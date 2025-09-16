"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Zap,
    MapPin,
    Users,
    Play,
    Calendar,
    Shield,
    Info,
    Globe,
    ArrowRight,
    Car,
    Languages,
    AlertCircle,
    Eye,
    Lightbulb,
    Timer,
    Plane,
    Award,
    Camera,
    Heart,
    ChevronDown,
    ChevronUp,
    Badge,
    Clock,
} from "lucide-react";
import API_BASE from "@/lib/api/klookApi";

const ActivityDetailPage = () => {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [adultQuantity, setAdultQuantity] = useState(1);
    const [childQuantity, setChildQuantity] = useState(0);
    const [scheduleData, setScheduleData] = useState(null);
    const [otherInfo, setOtherInfo] = useState(null);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [bookingExtraInfo, setBookingExtraInfo] = useState({});
    const [error, setError] = useState(null);
    const [travelDate, setTravelDate] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loadingOtherInfo, setLoadingOtherInfo] = useState(false);

    const currentPackage = activity?.package_list?.[selectedPackage];
    const currentSkuIds = currentPackage?.sku_list?.map(sku => sku.sku_id) || [];

    const MARKUP_PERCENTAGE = 0.15; // 15% increase
    const applyMarkup = (price) => price * (1 + MARKUP_PERCENTAGE);



    // Check if children are allowed
    const allowsChildren = currentPackage?.package_name?.toLowerCase().includes('child') ||
        currentPackage?.section_info?.some(section =>
            section.groups?.some(group =>
                group.content?.toLowerCase().includes('child')
            )
        );

    const parseContent = (content) => {
        if (!content) return "";
        return content
            .replace(/## (.*?)(?=\n|$)/g, '<h4 class="text-lg font-bold text-slate-800 mb-3 mt-4">$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
            .replace(/- (.*?)(?=\n|$)/g, '<div class="flex items-start gap-3 mb-2"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><span class="text-slate-600 leading-relaxed">$1</span></div>')
            .replace(/\n/g, "<br/>");
    };

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setError(null);
                const res = await fetch(`${API_BASE}/activities/${id}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch activity: ${res.status}`);
                }
                const json = await res.json();
                if (json.success) {
                    setActivity(json.data.activity);
                } else {
                    throw new Error(json.message || "Failed to load activity details");
                }
            } catch (error) {
                console.error("Error fetching activity details:", error);
                setError(error.message);
            }
        };

        if (id) fetchActivity();
    }, [id]);

    useEffect(() => {
        if (currentPackage?.package_id) {
            fetchOtherInfo(currentPackage.package_id);
        }
    }, [currentPackage]);

    const fetchSchedules = async () => {
        if (!travelDate || currentSkuIds.length === 0) return;

        setLoadingSchedules(true);
        setSelectedSchedule(null);
        setError(null);

        try {
            const formattedStart = `${travelDate} 00:00:00`;
            const formattedEnd = `${travelDate} 23:59:59`;
            const skuIdsString = currentSkuIds.join(",");

            const res = await fetch(
                `${API_BASE}/schedules?sku_ids=${skuIdsString}&start_time=${encodeURIComponent(
                    formattedStart
                )}&end_time=${encodeURIComponent(formattedEnd)}`
            );

            const data = await res.json();

            if (data.success) {
                const schedules = data.data?.schedules || [];
                setScheduleData({ schedules });
            } else {
                setScheduleData({ schedules: [] });
                setError(data.message || "Failed to fetch schedules");
            }
        } catch (error) {
            setScheduleData({ schedules: [] });
            setError("Error fetching schedules. Please try again.");
            console.error("Error fetching schedules:", error);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const fetchOtherInfo = async (packageId) => {
        try {
            setLoadingOtherInfo(true);
            const res = await fetch(`${API_BASE}/otherinfo/${packageId}`);
            const data = await res.json();
            if (data.success) {
                setOtherInfo(data.data);

                // Initialize booking extra info with default values
                const initialExtraInfo = {};
                data.data.items?.forEach(item => {
                    item.booking_extra_info?.forEach(info => {
                        if (info.input_type === "single_select" && info.options?.length > 0) {
                            initialExtraInfo[info.key] = info.options[0].key;
                        } else {
                            initialExtraInfo[info.key] = "";
                        }
                    });
                });
                setBookingExtraInfo(initialExtraInfo);
            } else {
                setError(data.message || "Failed to fetch additional information");
            }
        } catch (error) {
            console.error("Error fetching other info:", error);
            setError("Error loading additional information");
        } finally {
            setLoadingOtherInfo(false);
        }
    };

    const handleExtraInfoChange = (key, value) => {
        setBookingExtraInfo(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // In your ActivityDetailPage component
    // const handleBookNow = () => {
    //     if (!selectedSchedule) {
    //         setError("Please select a schedule first");
    //         return;
    //     }

    //     const bookingPayload = {
    //         service_type: "klook",
    //         service_id: currentPackage.package_id,
    //         package_id: currentPackage.package_id,
    //         schedule: {
    //             ...selectedSchedule,
    //             original_price: selectedSchedule.original_price, // Store original price
    //             markup_percentage: MARKUP_PERCENTAGE, // Store markup percentage
    //         },
    //         adult_quantity: adultQuantity,
    //         child_quantity: childQuantity,
    //         language: selectedLanguage,
    //         extra_info: bookingExtraInfo,
    //         total_price: selectedSchedule.price * adultQuantity + selectedSchedule.price * childQuantity,
    //         original_total_price: selectedSchedule.original_price * adultQuantity + selectedSchedule.original_price * childQuantity,
    //     };

    //     localStorage.setItem("pendingBooking", JSON.stringify(bookingPayload));
    //     window.location.href = `/activities-booking`;
    // };
    // In your handleBookNow function in ActivityDetailPage.jsx
    const handleBookNow = () => {
        if (!selectedSchedule) {
            setError("Please select a schedule first");
            return;
        }

        const bookingPayload = {
            service_type: "klook",
            service_id: currentPackage.package_id,
            package_id: currentPackage.package_id,
            schedule: {
                ...selectedSchedule,
                original_price: selectedSchedule.original_price,
                markup_percentage: MARKUP_PERCENTAGE,
            },
            adult_quantity: adultQuantity,
            child_quantity: childQuantity,
            language: selectedLanguage,
            extra_info: bookingExtraInfo, // This is the missing piece!
            total_price: selectedSchedule.price * adultQuantity + selectedSchedule.price * childQuantity,
            original_total_price: selectedSchedule.original_price * adultQuantity + selectedSchedule.original_price * childQuantity,
        };

        localStorage.setItem("pendingBooking", JSON.stringify(bookingPayload));
        window.location.href = `/activities-booking`;
    };


    if (!activity) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200 border-t-blue-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Plane className="h-8 w-8 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xl font-semibold text-slate-700 mb-2">Loading Experience</p>
                    <p className="text-sm text-slate-500">Preparing your adventure details...</p>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const images = activity.images || [];
    const totalQuantity = adultQuantity + childQuantity;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header with Breadcrumb */}
            <div className="bg-white shadow-sm border-b border-slate-100 py-4 mt-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Home</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>Activities</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="text-slate-700 font-medium truncate max-w-xs">
                            {activity.title}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="max-w-7xl mx-auto px-6 mt-4">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative h-[80vh] overflow-hidden">
                <Image
                    src={images[selectedImageIndex]?.image_url_host || "/placeholder.jpg"}
                    alt={activity.title}
                    fill
                    className="object-cover transition-all duration-700"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Image Gallery Navigation */}
                {images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                        {images.slice(0, 6).map((_, index) => (
                            <button
                                key={`image-nav-${index}-${images[index]?.image_url_host || index}`}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${selectedImageIndex === index
                                    ? "bg-white scale-125"
                                    : "bg-white/50 hover:bg-white/75"
                                    }`}
                            />
                        ))}
                        {images.length > 6 && (
                            <div className="flex items-center gap-1 ml-2 text-white/75 text-xs">
                                <Camera className="h-3 w-3" />
                                <span>+{images.length - 6}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Location and Travel Info */}
                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                {activity.city_info?.[0] && (
                                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                                        <MapPin className="h-5 w-5 text-red-400" />
                                        <span className="text-white font-medium">
                                            {activity.city_info[0].city_name},{" "}
                                            {activity.city_info[0].country_name}
                                        </span>
                                    </div>
                                )}
                                {activity.supported_languages?.length > 0 && (
                                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                                        <Languages className="h-4 w-4 text-green-400" />
                                        <span className="text-white/90">
                                            {activity.supported_languages.length} Languages Available
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Title and Category */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/20">
                                        {activity.category_info?.leaf_category_name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-yellow-400" />
                                        <span className="text-sm text-white/90">Premium Experience</span>
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight drop-shadow-lg">
                                    {activity.title}
                                </h1>
                                <p className="text-xl text-white/90 max-w-3xl">{activity.subtitle}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-6 py-16"
            >
                {activity.what_we_love && (
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl p-8 mb-10 shadow-sm border border-slate-200" >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-3 shadow-lg">
                                <Heart className="h-6 w-6 text-white" /> </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">What We Love</h2>
                                <p className="text-slate-500 text-sm mt-1">Why this experience stands out</p>
                            </div>
                        </div>
                        <p className="text-slate-700 text-lg leading-relaxed font-light"> {activity.what_we_love} </p>
                    </motion.div>)}

                {/* Highlights Section - Full Width */}
                {activity.section_info?.find((s) => s.section_name === "Highlights") && (
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-10"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-3 shadow-lg">
                                <Lightbulb className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Experience Highlights</h2>
                                <p className="text-slate-500 text-sm mt-1">The best parts of your adventure</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {activity.section_info
                                .find((s) => s.section_name === "Highlights")
                                ?.groups.map((g, i) => (
                                    <div
                                        key={`highlight-${i}-${g.group_name || i}`}
                                        className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-6 border border-slate-100"
                                    >
                                        <h3 className="font-bold text-slate-800 mb-3">{g.group_name}</h3>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: parseContent(g.content),
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Package Selection & What to Expect */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Package Selection */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Package Options</h2>

                            {/* Package Type Selection */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Package Type</h3>

                                {/* Grid layout for packages */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {activity.package_list?.map((pkg, idx) => (
                                        <div
                                            key={`package-${pkg.package_id}-${idx}`}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md 
                    ${selectedPackage === idx
                                                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                                                    : "border-slate-200 hover:border-slate-300"
                                                }`}
                                            onClick={() => {
                                                setSelectedPackage(idx);
                                                setTravelDate("");
                                                setSelectedSchedule(null);
                                                setScheduleData(null);
                                            }}
                                        >
                                            <div className="flex flex-col h-full justify-between">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-base">
                                                        {pkg.package_name}
                                                    </h4>
                                                    <p className="text-slate-600 text-sm mt-1">
                                                        👥 {pkg.package_min_pax}-{pkg.package_max_pax} people
                                                    </p>
                                                </div>

                                                <div className="mt-3 text-right">
                                                    <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full">
                                                        Select Package
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Travel Date Input */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                    Select experience date
                                </h3>
                                <input
                                    type="date"
                                    value={travelDate}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg"
                                    min={new Date().toISOString().split("T")[0]}
                                />
                                <button
                                    onClick={fetchSchedules}
                                    disabled={!travelDate || loadingSchedules}
                                    className="mt-4 w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingSchedules ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Checking Availability...
                                        </div>
                                    ) : "Check Availability"}
                                </button>
                            </div>

                            {/* Available Schedules */}
                            {loadingSchedules && (
                                <div className="flex justify-center my-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            )}

                            {scheduleData?.schedules?.length > 0 && (
                                <div className="mt-10 mb-10">
                                    {/* Heading */}
                                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                        Available Schedules
                                    </h3>

                                    {/* SKU Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {scheduleData.schedules.map((sku, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                                            >
                                                {/* SKU Header */}
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                            <Badge className="w-5 h-5 text-blue-600" />
                                                            SKU: {sku.sku_id}
                                                        </p>
                                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                                            <Globe className="w-4 h-4 text-slate-400" />
                                                            <span className="font-medium">{sku.currency}</span>
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${sku.publish_status === 1
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {sku.publish_status === 1 ? "Published" : "Unpublished"}
                                                    </span>
                                                </div>

                                                {/* Calendar Section */}
                                                {sku.calendars?.map((cal, i) => (
                                                    <div
                                                        key={i}
                                                        className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Clock className="w-4 h-4 text-blue-500" />
                                                            <p className="text-slate-700 font-medium">
                                                                {cal.month ? `Month: ${cal.month}` : "Available Dates"}
                                                            </p>
                                                        </div>

                                                        {/* Slots */}
                                                        <div className="space-y-3">
                                                            {cal.calendars?.map((slot, j) => {
                                                                const isSelected =
                                                                    selectedSchedule?.sku_id === sku.sku_id &&
                                                                    selectedSchedule?.start_time === slot.start_time;

                                                                return (
                                                                    <label
                                                                        key={j}
                                                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${isSelected
                                                                            ? "border-blue-500 bg-blue-50 shadow-md"
                                                                            : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50"
                                                                            }`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name={`schedule-${sku.sku_id}`}
                                                                            value={`${sku.sku_id}-${slot.start_time}`}
                                                                            checked={isSelected}
                                                                            // In your schedule selection code
                                                                            onChange={() =>
                                                                                setSelectedSchedule({
                                                                                    sku_id: sku.sku_id,
                                                                                    start_time: slot.start_time,
                                                                                    end_time: slot.block_out_time_utc,
                                                                                    price: applyMarkup(slot.selling_price),   // 15% markup
                                                                                    original_price: slot.selling_price,       // Store original price
                                                                                    currency: sku.currency,
                                                                                })
                                                                            }
                                                                            className="accent-blue-600 w-5 h-5"
                                                                        />

                                                                        <div className="flex flex-col flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-slate-800 font-medium flex items-center gap-2">
                                                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                                                    {slot.start_time} → {slot.block_out_time_utc}
                                                                                </span>
                                                                                <span className="text-blue-600 font-bold text-lg flex items-center gap-2">
                                                                                    <Badge className="w-4 h-4" />
                                                                                    {applyMarkup(slot.selling_price).toFixed(2)} {sku.currency}
                                                                                </span>
                                                                            </div>

                                                                            {slot.remaining_quota && (
                                                                                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                                                    <Users className="w-3 h-3 text-slate-400" />
                                                                                    {slot.remaining_quota} spots left
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Show Selected Schedule */}
                            {selectedSchedule && (
                                <div className="mt-6 p-4 border rounded-lg bg-green-50 mb-6">
                                    <h4 className="font-semibold text-green-700 mb-2">
                                        Selected Schedule
                                    </h4>
                                    <p>
                                        {selectedSchedule.start_time} →{" "}
                                        {selectedSchedule.end_time}
                                    </p>
                                    <p>
                                        Price: <b>{selectedSchedule.price}{" "}{selectedSchedule.currency}</b>
                                    </p>
                                </div>
                            )}

                            {/* Passenger Quantity Selection - Only show after schedule is selected */}
                            {selectedSchedule && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Number of Passengers</h3>

                                    {/* Adults */}
                                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-slate-800">Adults</h4>
                                            <p className="text-sm text-slate-600">12+ years</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setAdultQuantity(Math.max(1, adultQuantity - 1))}
                                                className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-medium">{adultQuantity}</span>
                                            <button
                                                onClick={() => setAdultQuantity(adultQuantity + 1)}
                                                disabled={totalQuantity >= (currentPackage?.package_max_pax || 10)}
                                                className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-slate-800">Children</h4>
                                            <p className="text-sm text-slate-600">3-11 years</p>
                                        </div>
                                        {allowsChildren ? (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setChildQuantity(Math.max(0, childQuantity - 1))}
                                                    className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{childQuantity}</span>
                                                <button
                                                    onClick={() => setChildQuantity(childQuantity + 1)}
                                                    disabled={totalQuantity >= (currentPackage?.package_max_pax || 10)}
                                                    className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-red-500">Children not allowed for this package</p>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-500 mt-2">
                                        Maximum {currentPackage?.package_max_pax || 10} passengers total
                                    </p>
                                </div>
                            )}

                            {/* Extra Information from otherinfo API - Only show after passengers are selected */}
                            {otherInfo && selectedSchedule && totalQuantity > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Additional Information</h3>
                                    {loadingOtherInfo ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {otherInfo.items?.map((item, itemIndex) => (
                                                <div key={`other-info-item-${item.id || item.package_id || itemIndex}`}>
                                                    {item.booking_extra_info?.map((info, infoIndex) => (
                                                        <div key={`other-info-${info.key}-${itemIndex}-${infoIndex}`} className="mb-4">
                                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                                {info.name}
                                                                {info.required && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            {info.input_type === "single_select" ? (
                                                                <select
                                                                    value={bookingExtraInfo[info.key] || ""}
                                                                    onChange={(e) => handleExtraInfoChange(info.key, e.target.value)}
                                                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    required={info.required}
                                                                >
                                                                    <option value="">Select {info.name}</option>
                                                                    {info.options?.map((option, optionIndex) => (
                                                                        <option key={`option-${option.key}-${itemIndex}-${infoIndex}-${optionIndex}`} value={option.key}>
                                                                            {option.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={bookingExtraInfo[info.key] || ""}
                                                                    onChange={(e) => handleExtraInfoChange(info.key, e.target.value)}
                                                                    placeholder={info.description}
                                                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    required={info.required}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Price Summary */}
                            {selectedSchedule && totalQuantity > 0 && (
                                <div className="p-4 bg-slate-50 rounded-lg mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-700">Total</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            {selectedSchedule.currency} {(
                                                (selectedSchedule.price * adultQuantity) +
                                                (selectedSchedule.price * childQuantity)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Complete all required fields to continue
                                    </p>
                                </div>
                            )}

                            {/* Booking Buttons */}
                            {selectedSchedule && totalQuantity > 0 && (
                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 px-6 bg-slate-100 text-slate-800 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                                        Add to cart
                                    </button>
                                    <button
                                        className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        onClick={handleBookNow}
                                    >
                                        <Zap className="h-5 w-5" />
                                        Book now
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {/* What to Expect Section */}
                        {activity.what_we_love && (
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <Info className="h-6 w-6 text-blue-600" />
                                    What to expect
                                </h2>
                                <p className="text-slate-700 leading-relaxed">
                                    {activity.what_we_love}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Package Details */}
                    <div className="space-y-8">
                        {currentPackage && (
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 sticky top-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-3">
                                    <Badge className="h-6 w-6 text-green-600" />
                                    Package details
                                </h2>

                                {/* Dynamic Package Details */}
                                {currentPackage.section_info?.map((section, sectionIndex) => (
                                    <div key={`package-section-${section.section_name || sectionIndex}`} className="mb-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-0">{section.section_name}</h3>
                                        {section.groups?.map((group, groupIndex) => (
                                            <div key={`package-group-${group.group_name || groupIndex}-${sectionIndex}`} className="mb-4">
                                                <h4 className="font-medium text-slate-700 mb-0">{group.group_name}</h4>
                                                <div className="text-slate-600 text-sm">
                                                    {group.content && (
                                                        <div dangerouslySetInnerHTML={{
                                                            __html: parseContent(group.content),
                                                        }} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                {/* Additional Package Info */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2">Important Information</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Package ID: {currentPackage.package_id}</li>
                                        <li>• Minimum Pax: {currentPackage.package_min_pax}</li>
                                        <li>• Maximum Pax: {currentPackage.package_max_pax}</li>
                                        <li>• Children Allowed: {allowsChildren ? 'Yes (3-11 years)' : 'No'}</li>
                                        <li>• Cancellation: {currentPackage.cancellation_type_multilang}</li>
                                        <li>• Voucher Usage: {currentPackage.voucher_usage_multilang}</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Footer Spacing */}
            <div className="pb-16"></div>
        </div>
    );
};

export default ActivityDetailPage;