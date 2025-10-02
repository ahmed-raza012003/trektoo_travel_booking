"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    Zap,
    MapPin,
    Users,
    Calendar,
    Shield,
    Info,
    Globe,
    ArrowRight,
    Languages,
    AlertCircle,
    Heart,
    ChevronDown,
    ChevronUp,
    Badge,
    Clock,
    Ticket,
    Camera,
    Lightbulb,
} from "lucide-react";
import API_BASE from "@/lib/api/klookApi";
import DateInput from "@/components/ui/Custom/DateInput";

// --- Expandable Text Component ---
const ExpandableText = ({ children, maxHeight = 120 }) => {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
        }
    }, [children, maxHeight]);

    return (
        <div className="relative">
            <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: expanded ? 'none' : `${maxHeight}px`,
                    maskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 70%, transparent)',
                    WebkitMaskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 70%, transparent)',
                }}
            >
                {children}
            </div>
            {isOverflowing && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                    {expanded ? 'Show less' : 'Show more'}
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            )}
        </div>
    );
};

// --- Main Component ---
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
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);

    const currentPackage = activity?.package_list?.[selectedPackage];
    const currentSkuIds = currentPackage?.sku_list?.map(sku => sku.sku_id) || [];
    const MARKUP_PERCENTAGE = 0.15;
    const applyMarkup = (price) => price * (1 + MARKUP_PERCENTAGE);

    // Helper function to check if there are any available time slots
    const hasAvailableTimeSlots = (schedules) => {
        if (!schedules || schedules.length === 0) return false;
        
        return schedules.some(sku => 
            sku.calendars && 
            sku.calendars.length > 0 && 
            sku.calendars.some(cal => 
                cal.calendars && 
                cal.calendars.length > 0
            )
        );
    };

    const allowsChildren = currentPackage?.package_name?.toLowerCase().includes('child') ||
        currentPackage?.section_info?.some(section =>
            section.groups?.some(group =>
                group.content?.toLowerCase().includes('child')
            )
        );

    const parseContent = (content, hasGroupName = false) => {
        if (!content) return "";
        let parsedContent = content;
        if (hasGroupName) {
            parsedContent = parsedContent
                .replace(/^#+\s+.*$/gm, '')
                .replace(/^\s*$/gm, '')
                .trim();
        } else {
            parsedContent = parsedContent.replace(/## (.*?)(?=\n|$)/g, '<h4 class="text-lg font-bold text-gray-800 mb-3 mt-4">$1</h4>');
        }
        return parsedContent
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
            .replace(/- (.*?)(?=\n|$)/g, '<div class="flex items-start gap-3 mb-2"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><span class="text-gray-600 leading-relaxed">$1</span></div>')
            .replace(/\n/g, "<br/>");
    };

    // Auto-rotate images
    useEffect(() => {
        if (!autoRotate || activity?.images?.length <= 1) return;
        const interval = setInterval(() => {
            setSelectedImageIndex(prev => (prev + 1) % activity.images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRotate, activity?.images]);

    // Fetch activity
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setError(null);
                const res = await fetch(`${API_BASE}/klook/activities/${id}`);
                if (!res.ok) throw new Error(`Failed to fetch activity: ${res.status}`);
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

    // Fetch other info when package changes
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
                `${API_BASE}/klook/schedules?sku_ids=${skuIdsString}&start_time=${encodeURIComponent(formattedStart)}&end_time=${encodeURIComponent(formattedEnd)}`
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
            const res = await fetch(`${API_BASE}/klook/otherinfo/${packageId}`);
            const data = await res.json();
            if (data.success) {
                setOtherInfo(data.data);
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
        setBookingExtraInfo(prev => ({ ...prev, [key]: value }));
    };

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
            extra_info: bookingExtraInfo,
            total_price: selectedSchedule.price * adultQuantity + selectedSchedule.price * childQuantity,
            original_total_price: selectedSchedule.original_price * adultQuantity + selectedSchedule.original_price * childQuantity,
        };
        localStorage.setItem("pendingBooking", JSON.stringify(bookingPayload));
        window.location.href = `/activities-booking`;
    };

    // --- Loading State ---
    if (!activity) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-activity-detail" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#2196F3" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid-activity-detail)" />
                    </svg>
                </div>
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
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const images = activity.images || [];
    const totalQuantity = adultQuantity + childQuantity;

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-3">
                <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid-activity-detail-main" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2196F3" strokeWidth="0.3" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid-activity-detail-main)" />
                </svg>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-blue-400/3 to-blue-500/3 rounded-full blur-xl"></div>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4 mt-24 relative z-10">
                <div className="w-full px-8 lg:px-16 xl:px-24 mt-4">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="hover:text-blue-600 transition-colors cursor-pointer">Home</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="hover:text-blue-600 transition-colors cursor-pointer">Activities</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-gray-700 font-medium truncate max-w-md">{activity.title}</span>
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
            <div className="w-[90vw] mx-auto px-4 lg:px-8 py-10 bg-gradient-to-br from-blue-300 via-white to-blue-300 rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 aspect-video">
                            <Image
                                src={images[selectedImageIndex]?.image_url_host || "/placeholder.jpg"}
                                alt={activity.title}
                                fill
                                className="object-cover transition-all duration-500"
                                priority
                                onMouseEnter={() => setAutoRotate(false)}
                                onMouseLeave={() => setAutoRotate(true)}
                            />
                            {images.length > 1 && (
                                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    {selectedImageIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar"
                            >
                                {images.slice(0, 10).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedImageIndex(idx);
                                            setAutoRotate(false);
                                        }}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${selectedImageIndex === idx
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        aria-label={`View image ${idx + 1}`}
                                    >
                                        <Image
                                            src={img.image_url_host || "/placeholder.jpg"}
                                            alt={`Thumbnail ${idx + 1}`}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Activity Info */}
                    <div className="flex flex-col justify-start pt-4 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            {/* Category Badge */}
                            {activity.category_info?.leaf_category_name && (
                                <span className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md">
                                    {activity.category_info.leaf_category_name}
                                </span>
                            )}

                            {/* Title */}
                            <h1
                                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                                style={{
                                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {activity.title}
                            </h1>

                            {/* Subtitle */}
                            {activity.subtitle && (
                                <p className="text-lg text-gray-600 max-w-2xl">{activity.subtitle}</p>
                            )}

                            {/* Location & Language Badges */}
                            <div className="flex flex-wrap gap-3">
                                {activity.city_info?.[0] && (
                                    <div className="flex items-center gap-2 bg-white-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        <span className="text-gray-800 font-medium">
                                            {activity.city_info[0].city_name}, {activity.city_info[0].country_name}
                                        </span>
                                    </div>
                                )}
                                {activity.supported_languages?.length > 0 && (
                                    <div className="flex items-center gap-2 bg-white-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors">
                                        <Languages className="h-4 w-4 text-blue-600" />
                                        <span className="text-gray-800 font-medium">
                                            {activity.supported_languages.length} Languages
                                        </span>
                                    </div>
                                )}
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
                className="w-full px-8 lg:px-16 xl:px-24 py-20 relative z-10"
            >
                {/* What We Love */}
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
                        <ExpandableText>
                            <p className="text-gray-700 text-xl leading-relaxed font-normal">
                                {activity.what_we_love}
                            </p>
                        </ExpandableText>
                    </motion.div>
                )}

                {/* Highlights */}
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
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                            {activity.section_info
                                .find((s) => s.section_name === "Highlights")
                                ?.groups.map((g, i) => (
                                    <div
                                        key={`highlight-${i}-${g.group_name || i}`}
                                        className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-sm transition-all duration-300"
                                    >
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">{g.group_name}</h3>
                                        <ExpandableText>
                                            <div
                                                className="text-gray-700 leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: parseContent(g.content, !!g.group_name),
                                                }}
                                            />
                                        </ExpandableText>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}

                {/* Grid Layout */}
                <div className="grid xl:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="xl:col-span-8 space-y-12">
                        {/* Package Selection */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Package Options</h2>
                            {/* ... (package selection UI remains unchanged) ... */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Package Type</h3>

                                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                                    <table className="w-full min-w-max">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Package</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Group Size</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {activity.package_list?.map((pkg, idx) => (
                                                <tr
                                                    key={`package-${pkg.package_id}-${idx}`}
                                                    className={`cursor-pointer transition-all duration-300 hover:bg-gray-50 ${selectedPackage === idx ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                                                    onClick={() => {
                                                        setSelectedPackage(idx);
                                                        setTravelDate("");
                                                        setSelectedSchedule(null);
                                                        setScheduleData(null);
                                                    }}
                                                >
                                                    <td className="px-6 py-5">
                                                        <h4 className="text-lg font-bold text-gray-900">{pkg.package_name}</h4>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Users className="h-5 w-5 flex-shrink-0" />
                                                            <span className="text-base">{pkg.package_min_pax}–{pkg.package_max_pax} people</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`inline-block px-5 py-2.5 text-sm font-semibold rounded-full transition-colors ${selectedPackage === idx
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                                }`}
                                                        >
                                                            {selectedPackage === idx ? "Selected" : "Select"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Travel Date */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Select experience date</h3>
                                <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                                    <div className="flex-1">
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
                                        className="flex-1 sm:flex-none py-4 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                                    >
                                        {loadingSchedules ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                                Checking...
                                            </div>
                                        ) : (
                                            "Check Availability"
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Schedules, Passengers, Extra Info, Booking — unchanged */}
                            {loadingSchedules && (
                                <div className="flex justify-center my-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            )}

                            {scheduleData && (
                                <div className="mt-12 mb-12">
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                        Available Schedules
                                    </h3>
                                    
                                    {hasAvailableTimeSlots(scheduleData.schedules) ? (
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
                                                                        <tr key={`${sku.sku_id}-${slotIdx}`} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
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
                                                                                        <p className="text-sm font-medium text-gray-900">{slot.start_time.split(' ')[0]}</p>
                                                                                        <p className="text-xs text-gray-500">{slot.start_time.split(' ')[1]} - {slot.block_out_time_utc.split(' ')[1]}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Users className="w-4 h-4 text-gray-400" />
                                                                                    <span className="text-sm text-gray-600">{slot.remaining_quota ? `${slot.remaining_quota} spots` : 'Available'}</span>
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
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Calendar className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-semibold text-gray-700 mb-2">No Schedules Available</h4>
                                                    <p className="text-gray-500 mb-4">
                                                        Sorry, there are no available time slots for <span className="font-medium">{travelDate}</span>.
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        Please try selecting a different date or check back later.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedSchedule && hasAvailableTimeSlots(scheduleData?.schedules) && (
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

                            {selectedSchedule && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Number of Passengers</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {selectedSchedule && totalQuantity > 0 && (
                                <div className="mt-8">
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-semibold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {selectedSchedule.currency} {((selectedSchedule.price * adultQuantity) + (selectedSchedule.price * childQuantity)).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-6 text-center">Complete all required fields to continue</p>
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

                        {/* What to Expect */}
                        {activity.what_we_love && (
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Info className="h-6 w-6 text-blue-600" />
                                    What to expect
                                </h2>
                                <ExpandableText>
                                    <p className="text-gray-700 leading-relaxed font-medium">{activity.what_we_love}</p>
                                </ExpandableText>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="xl:col-span-4 space-y-12">
                        {selectedSchedule && totalQuantity > 0 && (
                            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Price Summary</h3>
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-lg text-gray-600">Subtotal</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {selectedSchedule.currency} {((selectedSchedule.price * adultQuantity) + (selectedSchedule.price * childQuantity)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {selectedSchedule.currency} {((selectedSchedule.price * adultQuantity) + (selectedSchedule.price * childQuantity)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-6 text-center">Complete all required fields to continue</p>
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
                            <div className="lg:sticky lg:top-24 lg:self-start">
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                        <Badge className="h-6 w-6 text-blue-600" />
                                        Package Details
                                    </h2>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Group Size:</span>
                                            <span>{currentPackage.package_min_pax}–{currentPackage.package_max_pax}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Children:</span>
                                            <span>{allowsChildren ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Cancellation:</span>
                                            <span className="truncate max-w-[120px]">{currentPackage.cancellation_type_multilang}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Voucher:</span>
                                            <span>{currentPackage.voucher_usage_multilang}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsPackageModalOpen(true)}
                                        className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1"
                                    >
                                        View full details <ChevronDown className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Package Details Modal */}
            <AnimatePresence>
                {isPackageModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsPackageModalOpen(false)} // Closes when clicking outside
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()} // Keeps modal open when clicking inside
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-900">Package Details</h3>
                                <button
                                    onClick={() => setIsPackageModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-800 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="overflow-y-auto p-6 flex-1">
                                {currentPackage.section_info?.map((section, si) => (
                                    <div key={si} className="mb-6">
                                        <h4 className="text-xl font-semibold text-gray-900 mb-3">{section.section_name}</h4>
                                        {section.groups?.map((group, gi) => (
                                            <div key={gi} className="mb-4">
                                                {group.group_name && <h5 className="font-medium text-gray-800 mb-2">{group.group_name}</h5>}
                                                <div
                                                    className="text-gray-700 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: parseContent(group.content, !!group.group_name) }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                    <h5 className="font-semibold text-blue-900 mb-2">Key Info</h5>
                                    <ul className="text-blue-800 space-y-1 text-sm">
                                        <li>Package ID: {currentPackage.package_id}</li>
                                        <li>Group Size: {currentPackage.package_min_pax}–{currentPackage.package_max_pax}</li>
                                        <li>Children: {allowsChildren ? 'Allowed (3–11 yrs)' : 'Not allowed'}</li>
                                        <li>Cancellation: {currentPackage.cancellation_type_multilang}</li>
                                        <li>Voucher: {currentPackage.voucher_usage_multilang}</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer Spacing */}
            <div className="pb-16"></div>

            {/* Hide Scrollbar */}
            <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default ActivityDetailPage;