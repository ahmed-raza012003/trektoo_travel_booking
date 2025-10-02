"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle,
    Tag,
    Users,
    Calendar,
    MapPin,
    CreditCard,
    Shield,
    AlertCircle,
    Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE from "@/lib/api/klookApi";

// Enhanced form validation with more comprehensive rules
const VALIDATION_RULES = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address"
    },
    phone: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        minLength: 10,
        message: "Phone number must be at least 10 digits"
    },
    name: {
        minLength: 2,
        pattern: /^[a-zA-Z\s'-]+$/,
        message: "Name must contain only letters, spaces, hyphens, and apostrophes"
    },
    country: {
        minLength: 2,
        message: "Please enter a valid country name"
    }
};

// Memoized country list for better performance
const POPULAR_COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "Japan", "Singapore", "China", "India"
];

const BookingPage = () => {
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [formData, setFormData] = useState({
        // Lead passenger (first adult) - used for booking contact
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country: "",
        passport_id: "", // Passport/ID for lead passenger
        term_conditions: false,
        voucher: "",
    });
    
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFloating, setIsFloating] = useState(false);
    const [floatingTop, setFloatingTop] = useState(0);
    const [elementHeight, setElementHeight] = useState(0);
    
    // Refs for floating behavior
    const priceSummaryRef = useRef(null);
    const priceSummaryContainerRef = useRef(null);
    const originalPositionRef = useRef(null);

    // Enhanced validation function with better error messages
    const validateField = useCallback((name, value) => {
        switch (name) {
            case "email":
                if (!value.trim()) return "Email is required";
                return VALIDATION_RULES.email.pattern.test(value) ? "" : VALIDATION_RULES.email.message;
            
            case "phone":
                if (!value.trim()) return "Phone number is required";
                const cleanPhone = value.replace(/\D/g, '');
                return cleanPhone.length >= VALIDATION_RULES.phone.minLength ? "" : VALIDATION_RULES.phone.message;
            
            case "first_name":
            case "last_name":
                if (!value.trim()) return `${name === 'first_name' ? 'First' : 'Last'} name is required`;
                if (value.trim().length < VALIDATION_RULES.name.minLength) {
                    return `${name === 'first_name' ? 'First' : 'Last'} name must be at least 2 characters`;
                }
                return VALIDATION_RULES.name.pattern.test(value) ? "" : VALIDATION_RULES.name.message;
            
            case "country":
                if (!value.trim()) return "Country is required";
                return value.trim().length >= VALIDATION_RULES.country.minLength ? "" : VALIDATION_RULES.country.message;
            
            default:
                return value.trim() ? "" : "This field is required";
        }
    }, []);

    // Load booking data with error handling
    useEffect(() => {
        try {
            const data = localStorage.getItem("pendingBooking");
            if (!data) {
                router.push("/activities");
                return;
            }
            
            const parsedBooking = JSON.parse(data);
            
            // Validate required booking fields
            if (!parsedBooking.package_id || !parsedBooking.schedule || !parsedBooking.total_price) {
                console.error("Invalid booking data structure");
                router.push("/activities");
                return;
            }
            
            setBooking(parsedBooking);
        } catch (error) {
            console.error("Error loading booking data:", error);
            router.push("/activities");
        }
    }, [router]);

    
    // Floating price summary behavior
    useEffect(() => {
        const handleScroll = () => {
            if (typeof window === 'undefined' || window.innerWidth < 1024) {
                setIsFloating(false);
                return;
            }

            if (priceSummaryContainerRef.current && priceSummaryRef.current) {
                const container = priceSummaryContainerRef.current;
                const element = priceSummaryRef.current;
                
                // Get the original position if not stored
                if (!originalPositionRef.current) {
                    const containerRect = container.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    originalPositionRef.current = {
                        top: containerRect.top + scrollTop,
                        left: containerRect.left,
                        width: containerRect.width
                    };
                    setElementHeight(elementRect.height);
                }
                
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const originalTop = originalPositionRef.current.top;
                const offset = 300; // Space for navbar + some margin (navbar ~80px + 40px margin)
                
                // Check if we should start floating
                // Start floating when the user scrolls past the original position
                const shouldFloat = scrollTop + offset > originalTop;
                
                if (shouldFloat) {
                    setIsFloating(true);
                    setFloatingTop(offset); // Fixed distance from top of viewport (below navbar)
                } else {
                    setIsFloating(false);
                    setFloatingTop(0);
                }
            }
        };
        
        const handleResize = () => {
            // Reset original position on resize
            originalPositionRef.current = null;
            setIsFloating(false);
            setTimeout(handleScroll, 100); // Delay to allow layout to settle
        };
        
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', handleResize);
            handleScroll();
        }
        
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    // Enhanced input change handler with real-time validation
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));
        
        // Clear error if field becomes valid
        if (errors[name] && type !== "checkbox") {
            const error = validateField(name, newValue);
            if (!error) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        }
    }, [errors, validateField]);
    

    // Enhanced voucher application with better error handling
    const handleApplyVoucher = useCallback(async () => {
        if (!formData.voucher.trim()) {
            setErrors(prev => ({
                ...prev,
                voucher: "Please enter a voucher code",
            }));
            return;
        }

        if (voucherApplied) {
            return; // Prevent double application
        }

        setLoading(true);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.voucher;
            return newErrors;
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/coupons/apply`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code: formData.voucher.trim().toUpperCase(),
                        service_type: booking.service_type,
                        service_id: booking.service_id,
                        total: booking.total_price,
                    }),
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            
            if (json.success && json.data?.amount) {
                setDiscount(json.data.amount);
                setVoucherApplied(true);
                
                // Show success feedback
                setTimeout(() => {
                    const successElement = document.querySelector('.voucher-success');
                    if (successElement) {
                        successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 100);
            } else {
                setErrors(prev => ({
                    ...prev,
                    voucher: json.message || "Invalid voucher code",
                }));
            }
        } catch (err) {
            console.error("Voucher error:", err);
            if (err.name === 'AbortError') {
                setErrors(prev => ({
                    ...prev,
                    voucher: "Request timed out. Please try again.",
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    voucher: "Error applying voucher. Please try again.",
                }));
            }
        } finally {
            setLoading(false);
        }
    }, [formData.voucher, voucherApplied, booking]);

    // Memoized extra info formatting function
    const formatExtraInfoForKlook = useCallback((extraInfo, otherInfoData) => {
        const booking_extra_info = [];

        const defaultPickupLocation = {
            key: "pick_up_location_scope",
            content: "1000536614",
            selected: [{"key": "1000536614"}],
            input_type: "single_select"
        };

        if (extraInfo) {
            Object.entries(extraInfo).forEach(([key, value]) => {
                if (value) {
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

        const hasPickupLocation = booking_extra_info.some(item => item.key === "pick_up_location_scope");
        
        if (!hasPickupLocation) {
            booking_extra_info.push(defaultPickupLocation);
        }

        return { booking_extra_info, unit_extra_info: [] };
    }, []);

    const findFieldInfo = useCallback((key, otherInfoData) => {
        if (!otherInfoData?.items) return null;

        for (const item of otherInfoData.items) {
            const field = item.booking_extra_info?.find(info => info.key === key);
            if (field) return field;
        }
        return null;
    }, []);

    // Enhanced form submission with comprehensive validation
    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);

        // Comprehensive form validation
        const newErrors = {};
        
        // Validate lead passenger (contact) information
        Object.keys(formData).forEach((key) => {
            if (key !== "voucher" && key !== "term_conditions") {
                if (key === "passport_id") {
                    if (!formData[key] || !formData[key].trim()) {
                        newErrors[key] = "Passport/ID number is required";
                    }
                } else {
                    const error = validateField(key, formData[key]);
                    if (error) newErrors[key] = error;
                }
            }
        });
        

        if (!formData.term_conditions) {
            newErrors.term_conditions = "Please accept the terms and conditions";
        }

        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            setIsSubmitting(false);
            // Scroll to first error
            const firstErrorField = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`);
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            return;
        }

        const formatDateForKlook = (dateString) => {
            const d = new Date(dateString);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd} 00:00:00`;
        };

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
            // 1. Check availability with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(`${API_BASE}/klook/availability/check-direct`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(availabilityPayload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`Availability check failed with status: ${res.status}`);
            }

            const json = await res.json();

            if (json.success) {
                console.log("✅ Availability confirmed. Proceeding with booking initiation...");

                // 2. Fetch otherInfo
                const otherInfoRes = await fetch(`${API_BASE}/klook/otherinfo/${booking.package_id}`);
                if (!otherInfoRes.ok) {
                    throw new Error("Failed to fetch additional booking information");
                }
                const otherInfoData = await otherInfoRes.json();

                // 3. Format the extra_info
                const formattedExtraInfo = formatExtraInfoForKlook(booking.extra_info, otherInfoData.data);

                const bookingPayload = {
                    customer_info: {
                        first_name: formData.first_name.trim(),
                        last_name: formData.last_name.trim(),
                        email: formData.email.trim().toLowerCase(),
                        phone: formData.phone.trim(),
                        country: formData.country.trim(),
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
                        voucher_code: voucherApplied ? formData.voucher.trim() : "",
                        markup_percentage: 0.15,
                        extra_info: formattedExtraInfo,
                        travel_date: formatDateForKlook(booking.schedule.start_time)
                    },
                    terms_accepted: formData.term_conditions,
                };

                // 4. Submit booking
                const bookingRes = await fetch(`${API_BASE}/klook/activities-booking/initiate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookingPayload),
                    signal: controller.signal,
                });

                if (!bookingRes.ok) {
                    throw new Error(`Booking initiation failed with status: ${bookingRes.status}`);
                }

                const bookingData = await bookingRes.json();

                if (bookingData.success) {
                    // Store booking data
                    localStorage.setItem('currentBooking', JSON.stringify({
                        agent_order_id: bookingData.data.agent_order_id,
                        payment_intent: bookingData.data.payment_intent,
                        validation: bookingData.data.validation
                    }));

                    // Store booker information for confirmation page
                    localStorage.setItem('bookerInfo', JSON.stringify({
                        first_name: formData.first_name.trim(),
                        last_name: formData.last_name.trim(),
                        email: formData.email.trim().toLowerCase(),
                        phone: formData.phone.trim(),
                        country: formData.country.trim(),
                        passport_id: formData.passport_id?.trim() || null
                    }));

                    // Store booking summary for passenger forms on confirmation page
                    localStorage.setItem('bookingSummary', JSON.stringify({
                        activity_id: booking.activity_id,
                        activity_name: booking.activity_name,
                        package_name: booking.package_name,
                        adult_quantity: booking.adult_quantity,
                        child_quantity: booking.child_quantity,
                        total_price: booking.total_price,
                        original_total_price: booking.original_total_price,
                        discount: discount,
                        voucher_code: voucherApplied ? formData.voucher.trim() : "",
                        schedule: booking.schedule,
                        checkout_url: bookingData.data.checkout_url
                    }));

                    // Navigate to confirmation page
                    router.push(`/activity-confirmation?agent_order_id=${bookingData.data.agent_order_id}`);
                } else {
                    // Handle specific booking errors
                    const errorCode = bookingData.error?.code;
                    let errorMessage = "Booking initiation failed. Please try again.";
                    
                    switch (errorCode) {
                        case "1401":
                            errorMessage = "Missing required information. Please check all required fields and try again.";
                            break;
                        case "1103":
                            errorMessage = "Sorry, this time slot can no longer be booked due to cut-off time restrictions. Please select a different date or time.";
                            break;
                        default:
                            errorMessage = bookingData.message || errorMessage;
                    }
                    
                    alert(errorMessage);
                    console.error("Booking Error:", bookingData.error);
                }

            } else {
                // Handle availability errors
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

                const errorCode = json.error?.code;
                let errorMessage = "Availability check failed. Please try again.";
                
                if (errorCode === "1103") {
                    errorMessage = "Sorry, this date is no longer available for booking. Please select a different date.";
                }
                
                alert(errorMessage);
                console.error("Backend Error:", json.error);
            }
        } catch (err) {
            console.error("Booking error:", err);
            
            if (err.name === 'AbortError') {
                alert("Request timed out. Please try again.");
            } else {
                alert("Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [booking, formData, discount, voucherApplied, validateField, formatExtraInfoForKlook, isSubmitting]);

    // Memoized calculations for better performance
    const priceCalculations = useMemo(() => {
        if (!booking) return { totalBeforeDiscount: 0, finalTotal: 0 };
        
        const totalBeforeDiscount = booking.total_price;
        const finalTotal = Math.max(totalBeforeDiscount - discount, 0);
        
        return { totalBeforeDiscount, finalTotal };
    }, [booking, discount]);

    // Memoized date formatting
    const formattedDate = useMemo(() => {
        if (!booking?.schedule?.start_time) return "";
        
        return new Date(booking.schedule.start_time).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }, [booking?.schedule?.start_time]);

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                    <p className="text-gray-600 text-lg">
                        Loading booking details...
                    </p>
                </motion.div>
            </div>
        );
    }

    const { totalBeforeDiscount, finalTotal } = priceCalculations;

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-3">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="grid-booking-page"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke="#2196F3"
                                strokeWidth="0.3"
                            />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid-booking-page)" />
                </svg>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>

            <div className="w-full px-8 lg:px-16 xl:px-24 py-20 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 mt-24">
                    <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full border border-blue-200 mb-6">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Secure Booking Process</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                        letterSpacing: '-0.02em',
                    }}>
                        Complete Your{' '}
                        <span className="text-blue-600 relative">
                            Booking
                            <svg
                                className="absolute -bottom-2 left-0 w-full h-3"
                                viewBox="0 0 200 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M2 10C50 2 100 2 198 10"
                                    stroke="#E0C097"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        You're just one step away from your amazing journey. Please review your details and proceed to secure payment.
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Booking Summary */}
                            <motion.div 
                                className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-blue-600 rounded-2xl p-3 shadow-lg">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900">Booking Summary</h2>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Package Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-900">Package</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">
                                                {booking.package_name || `PKG ID: ${booking.package_id}`}
                                            </p>
                                            {booking.schedule?.sku_id && (
                                                <p className="text-sm text-gray-600">SKU: {booking.schedule.sku_id}</p>
                                            )}
                                        </div>

                                        {/* Date & Time */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-900">Date & Time</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">
                                                {formattedDate}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {booking.schedule.start_time.split(' ')[1]} - {booking.schedule.end_time.split(' ')[1]}
                                            </p>
                                        </div>

                                        {/* Travelers */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-900">Travelers</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">
                                                {booking.adult_quantity} Adult{booking.adult_quantity > 1 ? 's' : ''}
                                                {booking.child_quantity > 0 && `, ${booking.child_quantity} Child${booking.child_quantity > 1 ? 'ren' : ''}`}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {booking.schedule.price.toFixed(2)} {booking.schedule.currency} per person
                                            </p>
                                           
                                        </div>
                                    </div>

                                    {/* Pickup Location */}
                                    {booking.extra_info?.pickup_location && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-900">Pickup Location</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">
                                                {booking.extra_info.pickup_location}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Lead Passenger (Contact Information) */}
                            <motion.div 
                                className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-purple-600 rounded-2xl p-3 shadow-lg">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900">Booker Information</h2>
                                        </div>
                                </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        { field: 'first_name', label: 'First Name', type: 'text', placeholder: 'Enter your first name' },
                                        { field: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Enter your last name' },
                                        { field: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email address' },
                                        { field: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter your phone number' },
                                        { field: 'country', label: 'Country', type: 'text', placeholder: 'Enter your country' },
                                        { field: 'passport_id', label: 'Passport No. / ID No.', type: 'text', placeholder: 'Enter your passport or ID number' },
                                    ].map(({ field, label, type, placeholder }) => (
                                        <div key={field} className="space-y-3">
                                            <label className="block text-sm font-semibold text-gray-900">
                                                {label} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type={type}
                                                name={field}
                                                value={formData[field]}
                                                onChange={handleInputChange}
                                                placeholder={placeholder}
                                                list={field === 'country' ? 'countries-list' : undefined}
                                                className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${errors[field]
                                                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                    }`}
                                                aria-invalid={errors[field] ? 'true' : 'false'}
                                                aria-describedby={errors[field] ? `${field}-error` : undefined}
                                            />
                                            {field === 'country' && (
                                                <datalist id="countries-list">
                                                    {POPULAR_COUNTRIES.map(country => (
                                                        <option key={country} value={country} />
                                                    ))}
                                                </datalist>
                                            )}
                                            <AnimatePresence>
                                                {errors[field] && (
                                                    <motion.p 
                                                        id={`${field}-error`}
                                                        className="text-red-500 text-sm flex items-center gap-2"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                        {errors[field]}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="term_conditions"
                                            checked={formData.term_conditions}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            aria-describedby={errors.term_conditions ? 'terms-error' : undefined}
                                        />
                                        <div className="flex-1">
                                            <span className="text-gray-700 group-hover:text-gray-900 transition-colors text-base">
                                                I agree to the <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">Terms & Conditions</a> and <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">Privacy Policy</a>
                                            </span>
                                            <AnimatePresence>
                                                {errors.term_conditions && (
                                                    <motion.p 
                                                        id="terms-error"
                                                        className="text-red-500 text-sm mt-2 flex items-center gap-2"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                        {errors.term_conditions}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </label>
                                </div>
                            </motion.div>


                            {/* Promotional Code */}
                            <motion.div 
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-green-600 rounded-2xl p-3 shadow-lg">
                                        <Tag className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Promotional Code</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                name="voucher"
                                                placeholder="Enter your voucher code"
                                                value={formData.voucher}
                                                onChange={handleInputChange}
                                                disabled={voucherApplied}
                                                className={`w-full p-3 border-2 rounded-xl font-mono text-sm tracking-wider transition-all duration-300 ${voucherApplied
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : errors.voucher
                                                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                    }`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !voucherApplied && !loading) {
                                                        handleApplyVoucher();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={handleApplyVoucher}
                                            disabled={loading || voucherApplied || !formData.voucher.trim()}
                                            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${voucherApplied
                                                ? 'bg-green-600 text-white cursor-default'
                                                : loading
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : !formData.voucher.trim()
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                                }`}
                                        >
                                            {voucherApplied ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Applied
                                                </div>
                                            ) : loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Applying
                                                </div>
                                            ) : (
                                                'Apply'
                                            )}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {errors.voucher && (
                                            <motion.p 
                                                className="text-red-500 text-sm flex items-center gap-2"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.voucher}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                        {voucherApplied && (
                                            <motion.div 
                                                className="voucher-success bg-green-50 border border-green-200 rounded-xl p-4"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-green-800">Voucher Applied!</p>
                                                        <p className="text-xs text-green-600">
                                                            You saved {discount.toFixed(2)} {booking.schedule?.currency || 'USD'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <p className="font-semibold text-gray-900 mb-3 text-sm">Try these demo codes:</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => !voucherApplied && setFormData(prev => ({ ...prev, voucher: 'SAVE2' }))}
                                                disabled={voucherApplied}
                                                className="flex items-center gap-2 hover:bg-white transition-colors p-1 rounded"
                                            >
                                                <code className="bg-white px-2 py-1 rounded-lg border border-gray-200 font-mono text-xs">SAVE2</code>
                                                <span className="text-xs text-gray-600">Save 2%</span>
                                            </button>
                                            <button
                                                onClick={() => !voucherApplied && setFormData(prev => ({ ...prev, voucher: 'WELCOME10' }))}
                                                disabled={voucherApplied}
                                                className="flex items-center gap-2 hover:bg-white transition-colors p-1 rounded"
                                            >
                                                <code className="bg-white px-2 py-1 rounded-lg border border-gray-200 font-mono text-xs">WELCOME10</code>
                                                <span className="text-xs text-gray-600">Save 10%</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Price Summary */}
                        <div className="lg:col-span-1" ref={priceSummaryContainerRef}>
                            {/* Placeholder to maintain layout when floating */}
                            {isFloating && (
                                <div style={{ height: `${elementHeight}px`, width: '100%' }} />
                            )}
                            
                            <div 
                                ref={priceSummaryRef}
                                className={`transition-all duration-300 ${
                                    isFloating ? 'fixed z-50' : 'relative'
                                }`}
                                style={{
                                    top: isFloating ? `${floatingTop}px` : 'auto',
                                    right: isFloating ? '2rem' : 'auto',
                                    width: isFloating ? '320px' : 'auto',
                                    maxWidth: isFloating ? '320px' : 'none'
                                }}
                            >
                                <motion.div 
                                    className={`bg-white rounded-2xl p-8 shadow-lg lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto transition-all duration-300 hover:shadow-xl ${
                                        isFloating ? 'shadow-2xl border-0 ring-2 ring-blue-200' : 'border border-gray-200'
                                    }`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        scale: isFloating ? 1.02 : 1
                                    }}
                                    transition={{ 
                                        delay: 0.3,
                                        scale: { duration: 0.2 }
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Price Summary</h3>
                                        </div>
                                        {isFloating && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="hidden lg:flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                                            >
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                Following
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold text-gray-900">
                                                {totalBeforeDiscount.toFixed(2)} {booking.schedule.currency}
                                            </span>
                                        </div>

                                        <AnimatePresence>
                                            {discount > 0 && (
                                                <motion.div 
                                                    className="flex justify-between items-center py-3 bg-green-50 rounded-xl px-4 border border-green-200"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <span className="text-green-700 font-medium">Voucher Discount</span>
                                                    <span className="font-semibold text-green-800">
                                                        -{discount.toFixed(2)} {booking.schedule.currency}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="border-t-2 border-gray-200 pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold text-gray-900">Total</span>
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {finalTotal.toFixed(2)} {booking.schedule.currency}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                                            isSubmitting 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : isFloating 
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                        animate={isFloating ? { 
                                            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
                                        } : {}}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-6 h-6" />
                                                    Secure Checkout
                                                </>
                                            )}
                                        </div>
                                    </motion.button>

                                    <div className="mt-6 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-gray-500 text-sm">
                                            <Shield className="w-4 h-4" />
                                            <span>256-bit SSL encrypted</span>
                                        </div>
                                        <p className="text-gray-500 text-xs">Your payment information is secure and protected</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Price Summary - Fixed at Bottom */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-blue-600 ml-2">
                                {finalTotal.toFixed(2)} {booking.schedule.currency}
                            </span>
                        </div>
                        <motion.button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                                isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                            whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                        >
                            <div className="flex items-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        Checkout
                                    </>
                                )}
                            </div>
                        </motion.button>
                    </div>
                    <AnimatePresence>
                        {discount > 0 && (
                            <motion.div 
                                className="text-sm text-green-600 text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                You saved {discount.toFixed(2)} {booking.schedule.currency} with your voucher!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Add bottom padding for mobile price summary */}
                <div className="lg:hidden h-24"></div>
            </div>
        </div>
    );
};

export default BookingPage;