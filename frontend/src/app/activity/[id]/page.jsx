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
    Ticket,
} from "lucide-react";
import API_BASE from "@/lib/api/klookApi";
import DateInput from "@/components/ui/Custom/DateInput";

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

    const parseContent = (content, hasGroupName = false) => {
        if (!content) return "";
        let parsedContent = content;
        
        // Remove markdown headings when there's already a group name to prevent duplicates
        if (hasGroupName) {
            parsedContent = parsedContent
                .replace(/^#+\s+.*$/gm, '') // Remove all markdown headings
                .replace(/^\s*$/gm, '') // Remove empty lines
                .trim();
        } else {
            // Only create headings if there's no group name already
            parsedContent = parsedContent.replace(/## (.*?)(?=\n|$)/g, '<h4 class="text-lg font-bold text-gray-800 mb-3 mt-4">$1</h4>');
        }
        
        return parsedContent
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
            .replace(/- (.*?)(?=\n|$)/g, '<div class="flex items-start gap-3 mb-2"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><span class="text-gray-600 leading-relaxed">$1</span></div>')
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
                {/* Background Pattern - Matching Landing Page */}
                <div className="absolute inset-0 opacity-5">
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <pattern
                                id="grid-activity-detail"
                                width="10"
                                height="10"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 10 0 L 0 0 0 10"
                                    fill="none"
                                    stroke="#2196F3"
                                    strokeWidth="0.5"
                                />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid-activity-detail)" />
                    </svg>
                </div>

                {/* Decorative Elements - Matching Landing Page */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-300/10 to-blue-500/10 rounded-full blur-lg"></div>

                <div className="flex justify-center items-center min-h-screen relative z-10">
                <div className="text-center">
                    <div className="relative">
                            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                                <Ticket className="h-8 w-8 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                        <p className="text-xl font-semibold text-gray-800 mb-2">Loading Experience</p>
                        <p className="text-sm text-gray-600">Preparing your adventure details...</p>
                    </div>
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
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background Pattern - Matching Landing Page */}
            <div className="absolute inset-0 opacity-3">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="grid-activity-detail-main"
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
                    <rect width="100" height="100" fill="url(#grid-activity-detail-main)" />
                </svg>
            </div>

            {/* Decorative Elements - Subtle and Professional */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-blue-400/3 to-blue-500/3 rounded-full blur-xl"></div>

            {/* Header with Breadcrumb - Full Width */}
            <div className="bg-white border-b border-gray-200 py-4 mt-24 relative z-10">
                <div className="w-full px-8 lg:px-16 xl:px-24">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="hover:text-blue-600 transition-colors cursor-pointer">Home</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="hover:text-blue-600 transition-colors cursor-pointer">Activities</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-gray-700 font-medium truncate max-w-md">
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

            {/* Hero Section - Full Width */}
            <div className="relative h-[70vh] overflow-hidden">
                <Image
                    src={images[selectedImageIndex]?.image_url_host || "/placeholder.jpg"}
                    alt={activity.title}
                    fill
                    className="object-cover transition-all duration-700"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                
                {/* Subtle decorative elements */}
                <div className="absolute top-16 right-16 w-40 h-40 bg-gradient-to-br from-blue-500/8 to-blue-600/8 rounded-full blur-2xl"></div>
                <div className="absolute bottom-24 left-16 w-48 h-48 bg-gradient-to-br from-blue-400/6 to-blue-500/6 rounded-full blur-2xl"></div>

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

                {/* Hero Content - Full Width */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16 xl:p-24 text-white">
                    <div className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Location and Travel Info */}
                            <div className="flex flex-wrap items-center gap-8 mb-8">
                                {activity.city_info?.[0] && (
                                    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                        <span className="text-gray-800 font-medium">
                                            {activity.city_info[0].city_name},{" "}
                                            {activity.city_info[0].country_name}
                                        </span>
                                    </div>
                                )}
                                {activity.supported_languages?.length > 0 && (
                                    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                                        <Languages className="h-4 w-4 text-blue-600" />
                                        <span className="text-gray-800 font-medium">
                                            {activity.supported_languages.length} Languages Available
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Title and Category */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="px-6 py-3 bg-blue-600 rounded-full text-sm font-semibold text-white shadow-lg">
                                        {activity.category_info?.leaf_category_name}
                                    </span>
                                    </div>
                                <h1 
                                    className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight drop-shadow-lg"
                                    style={{
                                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {activity.title}
                                </h1>
                                <p className="text-2xl text-white/90 max-w-4xl font-medium leading-relaxed">{activity.subtitle}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content - Full Width */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full px-8 lg:px-16 xl:px-24 py-20 relative z-10"
            >
                {activity.what_we_love && (
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl p-12 mb-16 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="bg-blue-600 rounded-2xl p-4 shadow-lg">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">What We Love</h2>
                                <p className="text-gray-600 text-lg mt-2">Why this experience stands out</p>
                            </div>
                        </div>
                        <p className="text-gray-700 text-xl leading-relaxed font-medium max-w-4xl">{activity.what_we_love}</p>
                    </motion.div>
                )}

                {/* Highlights Section - Full Width */}
                {activity.section_info?.find((s) => s.section_name === "Highlights") && (
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 mb-16 hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex items-center gap-6 mb-10">
                            <div className="bg-blue-600 rounded-2xl p-4 shadow-lg">
                                <Lightbulb className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Experience Highlights</h2>
                                <p className="text-gray-600 text-lg mt-2">The best parts of your adventure</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {activity.section_info
                                .find((s) => s.section_name === "Highlights")
                                ?.groups.map((g, i) => (
                                    <div
                                        key={`highlight-${i}-${g.group_name || i}`}
                                        className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-sm transition-all duration-300"
                                    >
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">{g.group_name}</h3>
                                        <div
                                            className="text-gray-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: parseContent(g.content, !!g.group_name),
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
                {/* Main Content Grid - Full Width Layout */}
                <div className="grid xl:grid-cols-12 gap-12">
                    {/* Left Column - Package Selection & Booking */}
                    <div className="xl:col-span-8 space-y-12">
                        {/* Package Selection */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Package Options</h2>

                            {/* Package Type Selection */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Package Type</h3>

                                {/* Grid layout for packages */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activity.package_list?.map((pkg, idx) => (
                                        <div
                                            key={`package-${pkg.package_id}-${idx}`}
                                            className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg 
                    ${selectedPackage === idx
                                                    ? "border-blue-600 bg-blue-50 scale-[1.02]"
                                                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
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
                                                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                                                        {pkg.package_name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Users className="h-5 w-5" />
                                                        <span className="text-lg">
                                                            {pkg.package_min_pax}-{pkg.package_max_pax} people
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <span className={`inline-block px-6 py-3 text-sm font-semibold rounded-full transition-colors ${
                                                        selectedPackage === idx
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                    }`}>
                                                        {selectedPackage === idx ? "Selected" : "Select Package"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Travel Date Input */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    Select experience date
                                </h3>
                                <div className="max-w-md">
                                    <DateInput
                                        selectedDate={travelDate ? new Date(travelDate) : null}
                                        onChange={(date) => setTravelDate(date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Select your travel date"
                                        minDate={new Date()}
                                    />
                                </div>
                                <button
                                    onClick={fetchSchedules}
                                    disabled={!travelDate || loadingSchedules}
                                    className="mt-6 w-full max-w-md py-4 px-8 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    {loadingSchedules ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
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
                                <div className="mt-12 mb-12">
                                    {/* Heading */}
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                        Available Schedules
                                    </h3>

                                    {/* Compact Schedule Table */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Option</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Availability</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Select</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {scheduleData.schedules.map((sku, skuIdx) => 
                                                        sku.calendars?.map((cal, calIdx) => 
                                                            cal.calendars?.map((slot, slotIdx) => {
                                                                const isSelected = selectedSchedule?.sku_id === sku.sku_id && selectedSchedule?.start_time === slot.start_time;
                                                                
                                                                return (
                                                                    <tr 
                                                                        key={`${sku.sku_id}-${slotIdx}`}
                                                                        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                                                    >
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <Badge className="w-4 h-4 text-blue-600" />
                                                    <div>
                                                                                    <p className="text-sm font-medium text-gray-900">SKU: {sku.sku_id}</p>
                                                                                    <p className="text-xs text-gray-500">{sku.currency}</p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-gray-900">
                                                                                        {slot.start_time.split(' ')[0]}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        {slot.start_time.split(' ')[1]} - {slot.block_out_time_utc.split(' ')[1]}
                                                        </p>
                                                    </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <Users className="w-4 h-4 text-gray-400" />
                                                                                <span className="text-sm text-gray-600">
                                                                                    {slot.remaining_quota ? `${slot.remaining_quota} spots` : 'Available'}
                                                    </span>
                                                </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <span className="text-lg font-bold text-blue-600">
                                                                                {applyMarkup(slot.selling_price).toFixed(2)} {sku.currency}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-center">
                                                                        <input
                                                                            type="radio"
                                                                                name="schedule-selection"
                                                                            checked={isSelected}
                                                                            onChange={() =>
                                                                                setSelectedSchedule({
                                                                                    sku_id: sku.sku_id,
                                                                                    start_time: slot.start_time,
                                                                                    end_time: slot.block_out_time_utc,
                                                                                        price: applyMarkup(slot.selling_price),
                                                                                        original_price: slot.selling_price,
                                                                                    currency: sku.currency,
                                                                                })
                                                                            }
                                                                            className="accent-blue-600 w-5 h-5"
                                                                        />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Show Selected Schedule */}
                            {selectedSchedule && (
                                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            <h4 className="text-lg font-semibold text-blue-900">Selected Schedule</h4>
                                        </div>
                                        <span className="text-xl font-bold text-blue-600">
                                            {selectedSchedule.price.toFixed(2)} {selectedSchedule.currency}
                                        </span>
                                    </div>
                                    <p className="text-blue-800 mt-2">
                                        {selectedSchedule.start_time.split(' ')[0]} • {selectedSchedule.start_time.split(' ')[1]} - {selectedSchedule.end_time.split(' ')[1]}
                                    </p>
                                </div>
                            )}

                            {/* Passenger Quantity Selection - Only show after schedule is selected */}
                            {selectedSchedule && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Number of Passengers</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Adults */}
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                        <div>
                                                    <h4 className="text-lg font-medium text-gray-900">Adults</h4>
                                                    <p className="text-sm text-gray-600">12+ years</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setAdultQuantity(Math.max(1, adultQuantity - 1))}
                                                        className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center font-semibold"
                                            >
                                                -
                                            </button>
                                                    <span className="w-12 text-center font-bold text-lg">{adultQuantity}</span>
                                            <button
                                                onClick={() => setAdultQuantity(adultQuantity + 1)}
                                                disabled={totalQuantity >= (currentPackage?.package_max_pax || 10)}
                                                        className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center font-semibold"
                                            >
                                                +
                                            </button>
                                                </div>
                                        </div>
                                    </div>

                                    {/* Children */}
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                        <div>
                                                    <h4 className="text-lg font-medium text-gray-900">Children</h4>
                                                    <p className="text-sm text-gray-600">3-11 years</p>
                                        </div>
                                        {allowsChildren ? (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setChildQuantity(Math.max(0, childQuantity - 1))}
                                                            className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center font-semibold"
                                                >
                                                    -
                                                </button>
                                                        <span className="w-12 text-center font-bold text-lg">{childQuantity}</span>
                                                <button
                                                    onClick={() => setChildQuantity(childQuantity + 1)}
                                                    disabled={totalQuantity >= (currentPackage?.package_max_pax || 10)}
                                                            className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center font-semibold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                                    <p className="text-sm text-red-500">Not available</p>
                                        )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 mt-4 text-center">
                                        Maximum {currentPackage?.package_max_pax || 10} passengers total
                                    </p>
                                </div>
                            )}

                            {/* Extra Information from otherinfo API - Only show after passengers are selected */}
                            {otherInfo && selectedSchedule && totalQuantity > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h3>
                                    {loadingOtherInfo ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                            {otherInfo.items?.map((item, itemIndex) => (
                                                <div key={`other-info-item-${item.id || item.package_id || itemIndex}`}>
                                                    {item.booking_extra_info?.map((info, infoIndex) => (
                                                        <div key={`other-info-${info.key}-${itemIndex}-${infoIndex}`} className="mb-6">
                                                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                                {info.name}
                                                                {info.required && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            {info.input_type === "single_select" ? (
                                                                <div className="relative">
                                                                    <select
                                                                        value={bookingExtraInfo[info.key] || ""}
                                                                        onChange={(e) => handleExtraInfoChange(info.key, e.target.value)}
                                                                        className="w-full p-4 border-2 rounded-xl transition-all duration-300 border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                                        required={info.required}
                                                                    >
                                                                        <option value="">Select {info.name}</option>
                                                                        {info.options?.map((option, optionIndex) => (
                                                                            <option key={`option-${option.key}-${itemIndex}-${infoIndex}-${optionIndex}`} value={option.key}>
                                                                                {option.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={bookingExtraInfo[info.key] || ""}
                                                                    onChange={(e) => handleExtraInfoChange(info.key, e.target.value)}
                                                                    placeholder={info.description}
                                                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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

                            {/* Price Summary & Booking Actions */}
                            {selectedSchedule && totalQuantity > 0 && (
                                <div className="mt-8">
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-semibold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {selectedSchedule.currency} {(
                                                    (selectedSchedule.price * adultQuantity) +
                                                    (selectedSchedule.price * childQuantity)
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-6 text-center">
                                            Complete all required fields to continue
                                        </p>
                                        
                                        {/* Booking Buttons */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button className="py-4 px-6 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors border border-gray-300">
                                                Add to cart
                                            </button>
                                            <button
                                                className="py-4 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                onClick={handleBookNow}
                                            >
                                                <Zap className="h-5 w-5" />
                                                Book now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* What to Expect Section */}
                        {activity.what_we_love && (
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Info className="h-6 w-6 text-blue-600" />
                                    What to expect
                                </h2>
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    {activity.what_we_love}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Package Details */}
                    <div className="xl:col-span-4 space-y-12">
                        {/* Price Summary & Booking Actions - Floating */}
                            {selectedSchedule && totalQuantity > 0 && (
                            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Price Summary</h3>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-lg text-gray-600">Subtotal</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {selectedSchedule.currency} {(
                                                (selectedSchedule.price * adultQuantity) +
                                                (selectedSchedule.price * childQuantity)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                            {selectedSchedule.currency} {(
                                                (selectedSchedule.price * adultQuantity) +
                                                (selectedSchedule.price * childQuantity)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-6 text-center">
                                        Complete all required fields to continue
                                    </p>

                            {/* Booking Buttons */}
                                <div className="space-y-3">
                                    <button className="w-full py-4 px-6 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors border border-gray-300">
                                        Add to cart
                                    </button>
                                    <button
                                        className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        onClick={handleBookNow}
                                    >
                                        <Zap className="h-5 w-5" />
                                        Book now
                                    </button>
                                </div>
                                
                                <div className="mt-6 text-center text-sm text-gray-500">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Shield className="w-4 h-4" />
                                        <span>256-bit SSL encrypted payment</span>
                                    </div>
                                    <p>Your payment information is secure and protected</p>
                                </div>
                            </motion.div>
                        )}

                        {currentPackage && (
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                                    <Badge className="h-8 w-8 text-blue-600" />
                                    Package details
                                </h2>

                                {/* Dynamic Package Details */}
                                {currentPackage.section_info?.map((section, sectionIndex) => (
                                    <div key={`package-section-${section.section_name || sectionIndex}`} className="mb-8">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.section_name}</h3>
                                        {section.groups?.map((group, groupIndex) => (
                                            <div key={`package-group-${group.group_name || groupIndex}-${sectionIndex}`} className="mb-6">
                                                <h4 className="text-lg font-medium text-gray-800 mb-3">{group.group_name}</h4>
                                                <div className="text-gray-700 text-base leading-relaxed">
                                                    {group.content && (
                                                        <div dangerouslySetInnerHTML={{
                                                            __html: parseContent(group.content, !!group.group_name),
                                                        }} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                {/* Additional Package Info */}
                                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                                    <h4 className="text-lg font-semibold text-blue-900 mb-4">Important Information</h4>
                                    <ul className="text-base text-blue-800 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <Badge className="w-4 h-4 text-blue-600" />
                                            Package ID: {currentPackage.package_id}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            Group Size: {currentPackage.package_min_pax}-{currentPackage.package_max_pax} people
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-blue-600" />
                                            Children: {allowsChildren ? 'Yes (3-11 years)' : 'No'}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-blue-600" />
                                            Cancellation: {currentPackage.cancellation_type_multilang}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-blue-600" />
                                            Voucher: {currentPackage.voucher_usage_multilang}
                                        </li>
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