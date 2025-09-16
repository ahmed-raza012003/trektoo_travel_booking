"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle,
    Tag,
    Users,
    Calendar,
    MapPin,
    CreditCard,
    Shield,
} from "lucide-react";
import API_BASE from "@/lib/api/klookApi";


const BookingPage = () => {
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country: "",
        term_conditions: false,
        voucher: "",
    });
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [errors, setErrors] = useState({});

    // ✅ Load pendingBooking from localStorage
    useEffect(() => {
        const data = localStorage.getItem("pendingBooking");
        if (!data) {
            // No booking data found, redirect back to home or activities page
            router.push("/activities");
            return;
        }
        setBooking(JSON.parse(data));
    }, [router]);

    const validateField = (name, value) => {
        switch (name) {
            case "email":
                return /\S+@\S+\.\S+/.test(value)
                    ? ""
                    : "Invalid email address";
            case "phone":
                return value.length >= 10
                    ? ""
                    : "Phone number must be at least 10 digits";
            case "first_name":
            case "last_name":
                return value.trim().length >= 2
                    ? ""
                    : "Must be at least 2 characters";
            default:
                return value.trim() ? "" : "This field is required";
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleApplyVoucher = async () => {
        if (!formData.voucher.trim()) {
            setErrors((prev) => ({
                ...prev,
                voucher: "Please enter a voucher code",
            }));
            return;
        }

        setLoading(true);
        try {
            // Call your backend coupon validation API
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/coupons/apply`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code: formData.voucher,
                        service_type: booking.service_type,
                        service_id: booking.service_id,
                        total: booking.total_price,
                    }),
                }
            );

            const json = await res.json();
            if (json.success) {
                setDiscount(json.data.amount);
                setVoucherApplied(true);
            } else {
                setErrors((prev) => ({
                    ...prev,
                    voucher: json.message || "Invalid voucher code",
                }));
            }
        } catch (err) {
            console.error("Voucher error:", err);
            setErrors((prev) => ({
                ...prev,
                voucher: "Error applying voucher. Please try again.",
            }));
        } finally {
            setLoading(false);
        }
    };


    // Add this function to format extra_info for Klook API with default values
    const formatExtraInfoForKlook = (extraInfo, otherInfoData) => {
        const booking_extra_info = [];

        // Always include default pickup location for package 102191
        const defaultPickupLocation = {
            key: "pick_up_location_scope",
            content: "1000536614", // Default to 深圳高新技术园
            selected: [{"key": "1000536614"}],
            input_type: "single_select"
        };

        // If extraInfo exists, process it
        if (extraInfo) {
            Object.entries(extraInfo).forEach(([key, value]) => {
                if (value) {
                    // Find the corresponding field info from otherInfoData
                    const fieldInfo = findFieldInfo(key, otherInfoData);

                    booking_extra_info.push({
                        key: key,
                        content: value,
                        selected: fieldInfo?.input_type === "single_select" ? [{ key: value }] : null,
                        input_type: fieldInfo?.input_type || "text"
                    });
                }
            });
        }

        // Check if pick_up_location_scope is already included
        const hasPickupLocation = booking_extra_info.some(item => item.key === "pick_up_location_scope");
        
        // If not included, add default pickup location
        if (!hasPickupLocation) {
            booking_extra_info.push(defaultPickupLocation);
        }

        return { booking_extra_info, unit_extra_info: [] };
    };

    // Helper function to find field information
    const findFieldInfo = (key, otherInfoData) => {
        if (!otherInfoData?.items) return null;

        for (const item of otherInfoData.items) {
            const field = item.booking_extra_info?.find(info => info.key === key);
            if (field) return field;
        }
        return null;
    };



    const handleSubmit = async () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (key !== "voucher" && key !== "term_conditions") {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });

        if (!formData.term_conditions) {
            newErrors.term_conditions = "Please accept the terms and conditions";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        // Use the same format for both availability check and order validation
        const formatDateForKlook = (dateString) => {
            const d = new Date(dateString);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd} 00:00:00`;
        };

        // Build availability payload
        const availabilityPayload = [
            {
                package_id: Number(booking.package_id),
                start_time: formatDateForKlook(booking.schedule.start_time),
                sku_list: [
                    {
                        sku_id: Number(booking.schedule?.sku_id),
                        count: Number(booking.adult_quantity || 0) + Number(booking.child_quantity || 0),
                        price: booking.schedule?.original_price ? String(booking.schedule.original_price) : "",
                    },
                ],
            },
        ];

        try {
            // 1. Check availability
            const res = await fetch(`${API_BASE}/availability/check-direct`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(availabilityPayload),
            });

            const json = await res.json();

            if (json.success) {
                console.log("✅ Availability confirmed. Proceeding with booking initiation...");

                // 2. Fetch otherInfo to get the field structure
                const otherInfoRes = await fetch(`${API_BASE}/otherinfo/${booking.package_id}`);
                const otherInfoData = await otherInfoRes.json();

                // 3. Format the extra_info for Klook API
                const formattedExtraInfo = formatExtraInfoForKlook(booking.extra_info, otherInfoData.data);

                const bookingPayload = {
                    customer_info: {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        phone: formData.phone,
                        country: formData.country,
                    },
                    booking_details: {
                        package_id: booking.package_id,
                        schedule: {
                            ...booking.schedule,
                            start_time: formatDateForKlook(booking.schedule.start_time)
                        },
                        adult_quantity: booking.adult_quantity,
                        child_quantity: booking.child_quantity,
                        total_price: booking.total_price,
                        original_total_price: booking.original_total_price,
                        discount: discount,
                        voucher_code: formData.voucher,
                        markup_percentage: 0.15,
                        extra_info: formattedExtraInfo, // Use formatted extra info
                        travel_date: formatDateForKlook(booking.schedule.start_time)
                    },
                    terms_accepted: formData.term_conditions,
                };

                console.log("Booking payload with formatted extra_info:", bookingPayload);

                // 4. Call the new booking initiation endpoint
                const bookingRes = await fetch(`${API_BASE}/activities-booking/initiate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookingPayload),
                });

                const bookingData = await bookingRes.json();

                if (bookingData.success) {
                    // Store booking data for payment page
                    localStorage.setItem('currentBooking', JSON.stringify({
                        agent_order_id: bookingData.data.agent_order_id,
                        payment_intent: bookingData.data.payment_intent,
                        validation: bookingData.data.validation
                    }));

                    // Redirect to payment page
                    window.location.href = bookingData.data.checkout_url;
                } else {
                    // Handle specific errors
                    if (bookingData.error && bookingData.error.code === "1401") {
                        alert("Missing required information. Please check all required fields and try again.");
                    } else if (bookingData.error && bookingData.error.code === "1103") {
                        alert("Sorry, this time slot can no longer be booked due to cut-off time restrictions. Please select a different date or time.");
                    } else {
                        alert(bookingData.message || "Booking initiation failed");
                    }
                    console.error("Booking Error:", bookingData.error);
                }

            } else {
                // Handle price change error
                if (json.message && json.message.includes("price had changed")) {
                    const newPriceMatch = json.message.match(/new price (\d+\.\d+)/);
                    if (newPriceMatch && newPriceMatch[1]) {
                        const newPrice = parseFloat(newPriceMatch[1]);
                        const newPriceWithMarkup = newPrice * (1 + 0.15);

                        const updatedBooking = {
                            ...booking,
                            schedule: {
                                ...booking.schedule,
                                price: newPriceWithMarkup,
                                original_price: newPrice
                            },
                            total_price: newPriceWithMarkup * (booking.adult_quantity + booking.child_quantity),
                            original_total_price: newPrice * (booking.adult_quantity + booking.child_quantity)
                        };

                        localStorage.setItem("pendingBooking", JSON.stringify(updatedBooking));
                        setBooking(updatedBooking);

                        alert(`The price has been updated to ${newPriceWithMarkup.toFixed(2)} ${booking.schedule.currency}. Please review and confirm your booking.`);
                        return;
                    }
                }

                // Handle availability errors
                if (json.error && json.error.code === "1103") {
                    alert("Sorry, this date is no longer available for booking. Please select a different date.");
                } else {
                    alert(json.message || "Availability check failed");
                }
                console.error("Backend Error:", json.error);
            }
        } catch (err) {
            console.error("Booking error:", err);
            alert("Something went wrong. Please try again.");
        }
    };



    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="animate-pulse text-center">
                    <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">
                        Loading booking details...
                    </p>
                </div>
            </div>
        );
    }

    const totalBeforeDiscount = booking.total_price;
    const finalTotal = Math.max(totalBeforeDiscount - discount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-12 mt-12">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 mb-6">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Secure Booking Process</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
                        Complete Your Booking
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        You're just one step away from your amazing journey. Please review your details and proceed to secure payment.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Booking Summary */}

                        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl shadow-blue-100/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Booking Summary</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Package Name or ID */}
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {booking.package_name || `PKG ID: ${booking.package_id}`}
                                            </p>
                                            {booking.schedule?.sku_id && (
                                                <p className="text-gray-500 text-sm">SKU: {booking.schedule.sku_id}</p>
                                            )}
                                            <p className="text-gray-600 text-sm">Premium Experience</p>
                                        </div>
                                    </div>

                                    {/* Departure Date */}
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(booking.schedule.start_time).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-gray-600 text-sm">Departure Date</p>
                                        </div>
                                    </div>

                                    {/* Pickup Location (if exists) */}
                                    {booking.extra_info?.pickup_location && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {booking.extra_info.pickup_location}
                                                </p>
                                                <p className="text-gray-600 text-sm">Pickup Location</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Travelers */}
                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {booking.adult_quantity} Adults
                                                {booking.child_quantity > 0 && `, ${booking.child_quantity} Children`}
                                            </p>
                                            <p className="text-gray-600 text-sm">Total Travelers</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {booking.schedule.price} {booking.schedule.currency} per traveller
                                            </p>
                                            <p className="text-gray-600 text-sm">Base Price</p>
                                        </div>
                                    </div>

                                    {/* Language (if exists) */}
                                    {booking.language && (
                                        <div className="flex items-start gap-3">
                                            <Tag className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-800">{booking.language}</p>
                                                <p className="text-gray-600 text-sm">Preferred Language</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Discount Voucher */}
                        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl shadow-blue-100/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Tag className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Promotional Code</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="voucher"
                                        placeholder="Enter your voucher code"
                                        value={formData.voucher}
                                        onChange={handleInputChange}
                                        disabled={voucherApplied}
                                        className={`w-full p-4 pr-32 border-2 rounded-2xl font-mono text-sm tracking-wider transition-all duration-300 ${voucherApplied
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : errors.voucher
                                                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                                            }`}
                                    />
                                    <button
                                        onClick={handleApplyVoucher}
                                        disabled={loading || voucherApplied}
                                        className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${voucherApplied
                                            ? 'bg-green-500 text-white cursor-default'
                                            : loading
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                            }`}
                                    >
                                        {voucherApplied ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Applied
                                            </div>
                                        ) : loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                Applying
                                            </div>
                                        ) : (
                                            'Apply Code'
                                        )}
                                    </button>
                                </div>

                                {errors.voucher && (
                                    <p className="text-red-500 text-sm flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-red-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        </div>
                                        {errors.voucher}
                                    </p>
                                )}

                                {voucherApplied && (
                                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-green-800">Voucher Applied Successfully!</p>
                                                <p className="text-green-600 text-sm">
                                                    You saved {discount} {booking.schedule?.currency || 'USD'} on this booking
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                                    <p className="font-medium mb-1">Try these demo codes:</p>
                                    <p><code className="bg-white px-2 py-1 rounded">SAVE2</code> - Save 2 %</p>
                                    <p><code className="bg-white px-2 py-1 rounded">WELCOME10</code> - Save 10 %</p>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details */}
                        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl shadow-blue-100/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Passenger Details</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { field: 'first_name', label: 'First Name', type: 'text' },
                                    { field: 'last_name', label: 'Last Name', type: 'text' },
                                    { field: 'email', label: 'Email Address', type: 'email' },
                                    { field: 'phone', label: 'Phone Number', type: 'tel' },
                                ].map(({ field, label, type }) => (
                                    <div key={field} className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            {label}
                                        </label>
                                        <input
                                            type={type}
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleInputChange}
                                            className={`w-full p-4 border-2 rounded-2xl transition-all duration-300 ${errors[field]
                                                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                                                }`}
                                        />
                                        {errors[field] && (
                                            <p className="text-red-500 text-sm">{errors[field]}</p>
                                        )}
                                    </div>
                                ))}

                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className={`w-full p-4 border-2 rounded-2xl transition-all duration-300 ${errors.country
                                            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                                            : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                                            }`}
                                    />
                                    {errors.country && (
                                        <p className="text-red-500 text-sm">{errors.country}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="term_conditions"
                                        checked={formData.term_conditions}
                                        onChange={handleInputChange}
                                        className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                            I agree to the <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">Terms & Conditions</a> and <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">Privacy Policy</a>
                                        </span>
                                        {errors.term_conditions && (
                                            <p className="text-red-500 text-sm mt-1">{errors.term_conditions}</p>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Price Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl shadow-blue-100/20">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Price Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">{totalBeforeDiscount} {booking.schedule.currency}</span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600 bg-green-50 -mx-2 px-2 py-2 rounded-lg">
                                            <span>Voucher Discount</span>
                                            <span className="font-semibold">-{discount} {booking.schedule.currency}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-800">Total</span>
                                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {finalTotal} {booking.schedule.currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full p-4 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <Shield className="w-5 h-5" />
                                        Secure Checkout
                                    </div>
                                </button>

                                <div className="mt-4 text-center text-xs text-gray-500">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Shield className="w-4 h-4" />
                                        <span>256-bit SSL encrypted payment</span>
                                    </div>
                                    <p>Your payment information is secure and protected</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;