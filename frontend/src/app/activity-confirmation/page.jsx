"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  CreditCard, 
  Loader, 
  Shield, 
  FileText, 
  ArrowLeft,
  ChevronRight,
  BadgeCheck,
  Percent,
  Sparkles
} from "lucide-react";
import  API_BASE  from "@/lib/api/klookApi";
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from "framer-motion";

const OrderConfirmationPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const agentOrderId = searchParams.get('agent_order_id');
    const { token, isAuthenticated, isLoading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [bookerInfo, setBookerInfo] = useState(null);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [markupRate] = useState(0.15);
    const [isFloating, setIsFloating] = useState(false);
    const [floatingTop, setFloatingTop] = useState(0);
    const [elementHeight, setElementHeight] = useState(0);
    const [passengerForms, setPassengerForms] = useState([]);
    const [passengerErrors, setPassengerErrors] = useState({});
    
    // Refs for floating behavior
    const priceSummaryRef = useRef(null);
    const priceSummaryContainerRef = useRef(null);
    const originalPositionRef = useRef(null);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
            return;
        }

        // Get booking data from localStorage
        const storedBooking = localStorage.getItem('pendingBooking');
        const storedBookerInfo = localStorage.getItem('bookerInfo');
        const storedBookingSummary = localStorage.getItem('bookingSummary');
        
        if (storedBooking) {
            const parsedBooking = JSON.parse(storedBooking);
            setBookingData(parsedBooking);
        }
        
        if (storedBookerInfo) {
            const parsedBookerInfo = JSON.parse(storedBookerInfo);
            setBookerInfo(parsedBookerInfo);
            console.log('Booker Info:', parsedBookerInfo);
        }
        
        if (storedBookingSummary) {
            const parsedBookingSummary = JSON.parse(storedBookingSummary);
            setBookingSummary(parsedBookingSummary);
            console.log('Booking Summary:', parsedBookingSummary);
        }
        
        if (storedBooking) {
            const parsedBooking = JSON.parse(storedBooking);

            const klookOrderNo = localStorage.getItem('klookOrderNo');
            const storedAgentOrderId = localStorage.getItem('agentOrderId');

            if (klookOrderNo) {
                fetchOrderDetails(klookOrderNo);
            } else if (storedAgentOrderId) {
                createKlookOrder(parsedBooking, storedAgentOrderId);
            } else {
                createKlookOrder(parsedBooking);
            }
        } else {
            setError("No booking data found. Please start over.");
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, router]);

    // Floating payment summary behavior
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
                const offset = 120; // Space for navbar + some margin
                
                // Check if we should start floating
                const shouldFloat = scrollTop + offset > originalTop;
                
                if (shouldFloat) {
                    setIsFloating(true);
                    setFloatingTop(offset);
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

    // Initialize passenger forms when booking summary is loaded
    useEffect(() => {
        if (bookingSummary) {
            const passengers = [];
            
            // Add additional adults (excluding the first adult who is the lead passenger/booker)
            for (let i = 1; i < bookingSummary.adult_quantity; i++) {
                passengers.push({
                    id: `adult_${i}`,
                    type: 'adult',
                    index: i,
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    country: "",
                    passport_id: "" // Passport/ID number for adults
                });
            }
            
            // Add children
            for (let i = 0; i < bookingSummary.child_quantity; i++) {
                passengers.push({
                    id: `child_${i}`,
                    type: 'child',
                    index: i,
                    first_name: "",
                    last_name: "",
                    country: "",
                    passport_id: "", // Passport/ID for children
                    age: "" // Required for children
                });
            }
            
            setPassengerForms(passengers);
            console.log('Initialized passenger forms:', passengers);
        }
    }, [bookingSummary]);

    // Handler for passenger form changes
    const handlePassengerFormChange = (passengerId, fieldName, value) => {
        setPassengerForms(prev => 
            prev.map(passenger => 
                passenger.id === passengerId 
                    ? { ...passenger, [fieldName]: value }
                    : passenger
            )
        );
        
        // Clear error if field becomes valid
        const errorKey = `${passengerId}_${fieldName}`;
        if (passengerErrors[errorKey]) {
            setPassengerErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    // Validation function for passenger forms
    const validatePassengerForms = () => {
        const newErrors = {};
        
        passengerForms.forEach((passenger) => {
            const requiredFields = ['first_name', 'last_name', 'country'];
            
            // Add passport_id for both adults and children, age for children only
            if (passenger.type === 'adult') {
                requiredFields.push('email', 'phone', 'passport_id');
            } else if (passenger.type === 'child') {
                requiredFields.push('passport_id', 'age');
            }
            
            requiredFields.forEach(field => {
                const value = passenger[field];
                const errorKey = `${passenger.id}_${field}`;
                
                if (field === 'age' && passenger.type === 'child') {
                    if (!value || value.trim() === '') {
                        newErrors[errorKey] = 'Age is required for children';
                    } else {
                        const age = parseInt(value);
                        if (isNaN(age) || age < 0 || age > 17) {
                            newErrors[errorKey] = 'Please enter a valid age (0-17 for children)';
                        }
                    }
                } else if (field === 'passport_id') {
                    if (!value || value.trim() === '') {
                        const passengerLabel = passenger.type === 'adult' ? `Adult ${passenger.index + 1}` : `Child ${passenger.index + 1}`;
                        newErrors[errorKey] = `${passengerLabel}: Passport/ID number is required`;
                    }
                } else if (field === 'email') {
                    if (!value || value.trim() === '') {
                        newErrors[errorKey] = 'Email is required';
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        newErrors[errorKey] = 'Please enter a valid email address';
                    }
                } else if (field === 'phone') {
                    if (!value || value.trim() === '') {
                        newErrors[errorKey] = 'Phone number is required';
                    } else {
                        const cleanPhone = value.replace(/\D/g, '');
                        if (cleanPhone.length < 10) {
                            newErrors[errorKey] = 'Phone number must be at least 10 digits';
                        }
                    }
                } else if (field === 'first_name' || field === 'last_name') {
                    if (!value || value.trim() === '') {
                        newErrors[errorKey] = `${field === 'first_name' ? 'First' : 'Last'} name is required`;
                    } else if (value.trim().length < 2) {
                        newErrors[errorKey] = `${field === 'first_name' ? 'First' : 'Last'} name must be at least 2 characters`;
                    } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                        newErrors[errorKey] = `${field === 'first_name' ? 'First' : 'Last'} name must contain only letters, spaces, hyphens, and apostrophes`;
                    }
                } else if (field === 'country') {
                    if (!value || value.trim() === '') {
                        newErrors[errorKey] = 'Country is required';
                    } else if (value.trim().length < 2) {
                        newErrors[errorKey] = 'Please enter a valid country name';
                    }
                }
            });
        });
        
        setPassengerErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createKlookOrder = async (bookingPayload, existingAgentOrderId = null) => {
        try {
            setCreatingOrder(true);
            setError(null);

            // Format the extra_info for Klook API with default values
            const formatExtraInfo = (extraInfo) => {
                if (!extraInfo) {
                    // Provide default values for required fields
                    return [
                        {
                            key: "pick_up_location_scope",
                            content: "1000536614", // Default to 深圳高新技术园
                            selected: [{"key": "1000536614"}],
                            input_type: "single_select"
                        }
                    ];
                }
                
                // If extraInfo exists, use it but ensure required fields are present
                const formattedInfo = Object.entries(extraInfo).map(([key, value]) => ({
                    key: key,
                    content: value,
                    selected: key === "pick_up_location_scope" ? [{"key": value}] : null,
                    input_type: key === "pick_up_location_scope" ? "single_select" : "text"
                }));

                // Check if pick_up_location_scope is already included
                const hasPickupLocation = formattedInfo.some(item => item.key === "pick_up_location_scope");
                
                // If not included, add default pickup location
                if (!hasPickupLocation) {
                    formattedInfo.push({
                        key: "pick_up_location_scope",
                        content: "1000536614", // Default to 深圳高新技术园
                        selected: [{"key": "1000536614"}],
                        input_type: "single_select"
                    });
                }

                return formattedInfo;
            };

            const orderPayload = {
                agent_order_id: existingAgentOrderId || 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                contact_info: {
                    country: bookingPayload.customer_info?.country || '',
                    email: bookingPayload.customer_info?.email || '',
                    first_name: bookingPayload.customer_info?.first_name || '',
                    family_name: bookingPayload.customer_info?.last_name || '',
                    mobile: bookingPayload.customer_info?.phone || ''
                },
                items: [
                    {
                        package_id: parseInt(bookingPayload.package_id),
                        start_time: bookingPayload.schedule.start_time,
                        sku_list: [
                            {
                                sku_id: parseInt(bookingPayload.schedule.sku_id),
                                count: parseInt(bookingPayload.adult_quantity) + parseInt(bookingPayload.child_quantity || 0)
                            }
                        ],
                        booking_extra_info: formatExtraInfo(bookingPayload.extra_info),
                        unit_extra_info: []
                    }
                ]
            };

            console.log("Creating order with payload:", orderPayload);

            // Use KLOOK_API_BASE for Klook API calls
            const response = await fetch(`${API_BASE}/klook/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderPayload)
            });

            const result = await response.json();

            if (result.success) {
                const klookOrderNo = result.data.klook_order_no;
                localStorage.setItem('klookOrderNo', klookOrderNo);
                localStorage.setItem('agentOrderId', orderPayload.agent_order_id);
                await fetchOrderDetails(klookOrderNo);
            } else {
                throw new Error(result.error?.message || 'Failed to create order');
            }
        } catch (err) {
            console.error('Order creation error:', err);
            setError(err.message || 'Failed to create order. Please try again.');
            setLoading(false);
        } finally {
            setCreatingOrder(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            setLoading(true);
            // Use KLOOK_API_BASE for Klook API calls
            const response = await fetch(`${API_BASE}/klook/orders/${orderId}`);
            const result = await response.json();

            if (result.success) {
                setOrderData(result.data);
            } else {
                throw new Error(result.error?.message || 'Failed to fetch order details');
            }
        } catch (err) {
            console.error('Order details error:', err);
            setError(err.message || 'Failed to fetch order details.');
        } finally {
            setLoading(false);
        }
    };

    const calculateMarkupPrice = (originalPrice) => {
        return originalPrice * (1 + markupRate);
    };

    const handleProceedToPayment = async () => {
        if (orderData && token) {
            try {
                setLoading(true);
                setError(null);
                
                // Validate passenger forms if there are any
                if (passengerForms.length > 0) {
                    const isValid = validatePassengerForms();
                    if (!isValid) {
                        setLoading(false);
                        // Scroll to first error
                        const firstErrorField = document.querySelector(`[name="${Object.keys(passengerErrors)[0]}"]`);
                        if (firstErrorField) {
                            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            firstErrorField.focus();
                        }
                        return;
                    }
                }
                
                const originalTotal = parseFloat(orderData.total_amount);
                const finalTotal = originalTotal * (1 + markupRate);
                
                const storedBooking = JSON.parse(localStorage.getItem('pendingBooking') || '{}');

                // Get customer info from stored booking or use defaults
                const customerEmail = orderData.contact_info?.email || 
                                   storedBooking.customer_info?.email || 
                                   storedBooking.formData?.email || 
                                   'customer@example.com';
                
                const customerName = `${orderData.contact_info?.first_name || storedBooking.customer_info?.first_name || storedBooking.formData?.first_name || 'Customer'} ${orderData.contact_info?.family_name || storedBooking.customer_info?.last_name || storedBooking.formData?.last_name || 'User'}`.trim() || 'Customer User';
                
                const packageId = storedBooking.package_id ? String(storedBooking.package_id) : '123';

                console.log('Payment Intent Data:', {
                    customer_email: customerEmail,
                    customer_name: customerName,
                    package_id: packageId,
                    storedBooking: storedBooking,
                    orderData: orderData
                });

                const response = await fetch(`${API_BASE}/klook/payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        order_id: orderData.klktech_order_id || 'order_' + Date.now(),
                        agent_order_id: orderData.agent_order_id || 'agent_' + Date.now(),
                        amount: finalTotal.toFixed(2),
                        currency: orderData.currency || 'USD',
                        customer_email: customerEmail,
                        customer_name: customerName,
                        booking_data: {
                            activity_id: storedBooking.activity_id || 'activity_123',
                            activity_name: orderData.bookings?.[0]?.activity_name || storedBooking.package_name || 'Klook Activity',
                            package_id: packageId,
                            start_time: storedBooking.schedule?.start_time || new Date().toISOString(),
                            adult_quantity: storedBooking.adult_quantity || 1,
                            child_quantity: storedBooking.child_quantity || 0,
                            customer_phone: orderData.contact_info?.mobile || storedBooking.customer_info?.phone || storedBooking.formData?.phone || '+1234567890',
                            customer_country: orderData.contact_info?.country || storedBooking.customer_info?.country || storedBooking.formData?.country || 'US'
                        }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('klookPayment', JSON.stringify(result.data));
                    // Redirect directly to Stripe checkout page
                    window.location.href = result.data.checkout_url;
                } else {
                    throw new Error(result.error?.message || result.message || 'Failed to create payment');
                }
            } catch (err) {
                console.error('Payment initiation error:', err);
                setError(err.message || 'Failed to initiate payment.');
            } finally {
                setLoading(false);
            }
        }
    };

    const testBackendConnection = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/health', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Backend connection successful:', data);
                return true;
            } else {
                console.warn('Backend server might not be running properly');
                return false;
            }
        } catch (err) {
            console.warn('Cannot connect to backend server:', err.message);
            return false;
        }
    };

    useEffect(() => {
        testBackendConnection();
    }, []);

    const handleBackToBooking = () => {
        router.back();
    };

    if (loading || creatingOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Loader className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {creatingOrder ? 'Creating Your Order' : 'Loading Order Details'}
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Please wait while we process your booking. This may take a moment.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
                <motion.div 
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-gray-700 font-medium mb-2">Troubleshooting tips:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    Ensure backend server is running on http://localhost:8000
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    Run: <code className="bg-gray-100 px-2 py-1 rounded text-xs">php artisan serve</code>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleBackToBooking}
                                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!orderData) {
        return null;
    }

    // Calculate total amounts
    const originalTotal = parseFloat(orderData.total_amount);
    const markupAmount = originalTotal * markupRate;
    const finalTotal = originalTotal + markupAmount;

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <pattern
                                id="grid-confirmation-page"
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
                        <rect width="100" height="100" fill="url(#grid-confirmation-page)" />
                    </svg>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>

                <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12 max-w-3xl mx-auto">
                        <motion.div 
                            className="inline-flex items-center gap-3 bg-green-50 px-6 py-3 rounded-full border border-green-200 mb-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <BadgeCheck className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Order Created Successfully</span>
                        </motion.div>
                        
                        <motion.h1 
                            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Order{' '}
                            <span className="text-blue-600 relative">
                                Confirmation
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
                        </motion.h1>
                        
                        <motion.p 
                            className="text-xl text-gray-600"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Review your order details before proceeding to payment
                        </motion.p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-3 gap-8 items-start">
                            {/* Left Column - Order Details */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Order Information */}
                                <motion.div 
                                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-blue-600 rounded-2xl p-3 shadow-lg">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Order Information</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-500">Order Number</span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {orderData.klktech_order_id}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-500">Agent Order ID</span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {orderData.agent_order_id}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-500">Status</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                {orderData.confirm_status}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-500">Transaction Status</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                {orderData.transaction_status}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Booking Summary */}
                                <motion.div 
                                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-purple-600 rounded-2xl p-3 shadow-lg">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Booking Summary</h2>
                                    </div>

                                    {orderData.bookings?.map((booking, index) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 last:mb-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-500">Activity</span>
                                                    </div>
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        {booking.activity_name}
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-500">Package</span>
                                                    </div>
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        {booking.package_name}
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-500">Reference Number</span>
                                                    </div>
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        {booking.booking_ref_number}
                                                    </p>
                                                </div>

                                                {booking.operator_contacts?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-gray-500">Operator Contacts</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {booking.operator_contacts.map((contact, contactIndex) => (
                                                                <div key={contactIndex} className="text-sm text-gray-700">
                                                                    {contact.details.map((detail, detailIndex) => (
                                                                        <p key={detailIndex} className="flex items-center gap-2">
                                                                            <span className="font-medium">{contact.method}:</span> {detail}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Passenger Information */}
                                {(bookerInfo || bookingSummary) && (
                                    <motion.div 
                                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="bg-green-600 rounded-2xl p-3 shadow-lg">
                                                <Users className="w-6 h-6 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">Passenger Information</h2>
                                        </div>

                                        {/* Passenger Quantities */}
                                        {bookingSummary && (
                                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {bookingSummary.adult_quantity || 0}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Adult{(bookingSummary.adult_quantity || 0) !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-600">
                                                            {bookingSummary.child_quantity || 0}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Child{(bookingSummary.child_quantity || 0) !== 1 ? 'ren' : ''}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            {(bookingSummary.adult_quantity || 0) + (bookingSummary.child_quantity || 0)}
                                                        </div>
                                                        <div className="text-sm text-gray-600">Total Passengers</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Lead Passenger/Booker Information */}
                                        {bookerInfo && (
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                        1
                                                    </div>
                                                    Lead Passenger & Contact Person
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                                                        <p className="text-gray-900 font-semibold">{bookerInfo.first_name || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                                                        <p className="text-gray-900 font-semibold">{bookerInfo.last_name || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                                        <p className="text-gray-900 font-semibold">{bookerInfo.email || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                                        <p className="text-gray-900 font-semibold">{bookerInfo.phone || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                                                        <p className="text-gray-900 font-semibold">{bookerInfo.country || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Passport/ID No.</label>
                                                        <p className="text-gray-900 font-semibold">{bookerInfo.passport_id || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Passengers Notice */}
                                        {bookingSummary && ((bookingSummary.adult_quantity > 1) || (bookingSummary.child_quantity > 0)) && (
                                            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-green-800 mb-1">Additional Passenger Details</h4>
                                                        <p className="text-green-700 text-sm">
                                                            Please fill in the details for {Math.max(0, (bookingSummary.adult_quantity || 0) - 1)} additional adult{Math.max(0, (bookingSummary.adult_quantity || 0) - 1) !== 1 ? 's' : ''} 
                                                            {bookingSummary.child_quantity > 0 && ` and ${bookingSummary.child_quantity} child${bookingSummary.child_quantity !== 1 ? 'ren' : ''}`} 
                                                            {' '}below before proceeding to payment.
                                                        </p>
                                                        <p className="text-green-600 text-xs mt-2">
                                                            All passenger information is required for booking confirmation.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Passenger Forms */}
                                        {passengerForms.length > 0 && (
                                            <motion.div 
                                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                            >
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="bg-orange-600 rounded-2xl p-3 shadow-lg">
                                                        <Users className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h2 className="text-2xl font-bold text-gray-900">Additional Passenger Details</h2>
                                                </div>

                                                <div className="space-y-8">
                                                    {passengerForms.map((passenger, index) => {
                                                        const isAdult = passenger.type === 'adult';
                                                        const passengerNumber = passenger.index + 1;
                                                        const title = isAdult ? `Adult ${passengerNumber}` : `Child ${passengerNumber}`;
                                                        const bgColor = isAdult ? 'bg-blue-50' : 'bg-green-50';
                                                        const borderColor = isAdult ? 'border-blue-200' : 'border-green-200';
                                                        
                                                        return (
                                                            <div key={passenger.id} className={`${bgColor} ${borderColor} border rounded-xl p-6`}>
                                                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                                                        isAdult ? 'bg-blue-600' : 'bg-green-600'
                                                                    }`}>
                                                                        {passengerNumber}
                                                                    </div>
                                                                    {title}
                                                                    {!isAdult && (
                                                                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                                                            Age required
                                                                        </span>
                                                                    )}
                                                                </h3>
                                                                
                                                                <div className="grid md:grid-cols-2 gap-6">
                                                                    {/* First Name */}
                                                                    <div className="space-y-3">
                                                                        <label className="block text-sm font-semibold text-gray-900">
                                                                            First Name <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name={`${passenger.id}_first_name`}
                                                                            value={passenger.first_name}
                                                                            onChange={(e) => handlePassengerFormChange(passenger.id, 'first_name', e.target.value)}
                                                                            placeholder={`Enter ${title.toLowerCase()}'s first name`}
                                                                            className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${
                                                                                passengerErrors[`${passenger.id}_first_name`]
                                                                                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                                                    : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                                            }`}
                                                                        />
                                                                        <AnimatePresence>
                                                                            {passengerErrors[`${passenger.id}_first_name`] && (
                                                                                <motion.p 
                                                                                    className="text-red-500 text-sm flex items-center gap-2"
                                                                                    initial={{ opacity: 0, y: -10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: -10 }}
                                                                                >
                                                                                    <AlertCircle className="w-4 h-4" />
                                                                                    {passengerErrors[`${passenger.id}_first_name`]}
                                                                                </motion.p>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                    
                                                                    {/* Last Name */}
                                                                    <div className="space-y-3">
                                                                        <label className="block text-sm font-semibold text-gray-900">
                                                                            Last Name <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name={`${passenger.id}_last_name`}
                                                                            value={passenger.last_name}
                                                                            onChange={(e) => handlePassengerFormChange(passenger.id, 'last_name', e.target.value)}
                                                                            placeholder={`Enter ${title.toLowerCase()}'s last name`}
                                                                            className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${
                                                                                passengerErrors[`${passenger.id}_last_name`]
                                                                                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                                                    : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                                            }`}
                                                                        />
                                                                        <AnimatePresence>
                                                                            {passengerErrors[`${passenger.id}_last_name`] && (
                                                                                <motion.p 
                                                                                    className="text-red-500 text-sm flex items-center gap-2"
                                                                                    initial={{ opacity: 0, y: -10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: -10 }}
                                                                                >
                                                                                    <AlertCircle className="w-4 h-4" />
                                                                                    {passengerErrors[`${passenger.id}_last_name`]}
                                                                                </motion.p>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                    
                                                                    {/* Email - Only for adults */}
                                                                    {passenger.type === 'adult' && (
                                                                        <div className="space-y-3">
                                                                            <label className="block text-sm font-semibold text-gray-900">
                                                                                Email Address <span className="text-red-500">*</span>
                                                                            </label>
                                                                            <input
                                                                                type="email"
                                                                                name={`${passenger.id}_email`}
                                                                                value={passenger.email}
                                                                                onChange={(e) => handlePassengerFormChange(passenger.id, 'email', e.target.value)}
                                                                                placeholder={`Enter ${title.toLowerCase()}'s email`}
                                                                                className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${
                                                                                    passengerErrors[`${passenger.id}_email`]
                                                                                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                                                        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                                                }`}
                                                                            />
                                                                            <AnimatePresence>
                                                                                {passengerErrors[`${passenger.id}_email`] && (
                                                                                    <motion.p 
                                                                                        className="text-red-500 text-sm flex items-center gap-2"
                                                                                        initial={{ opacity: 0, y: -10 }}
                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                        exit={{ opacity: 0, y: -10 }}
                                                                                    >
                                                                                        <AlertCircle className="w-4 h-4" />
                                                                                        {passengerErrors[`${passenger.id}_email`]}
                                                                                    </motion.p>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Phone - Only for adults */}
                                                                    {passenger.type === 'adult' && (
                                                                        <div className="space-y-3">
                                                                            <label className="block text-sm font-semibold text-gray-900">
                                                                                Phone Number <span className="text-red-500">*</span>
                                                                            </label>
                                                                            <input
                                                                                type="tel"
                                                                                name={`${passenger.id}_phone`}
                                                                                value={passenger.phone}
                                                                                onChange={(e) => handlePassengerFormChange(passenger.id, 'phone', e.target.value)}
                                                                                placeholder={`Enter ${title.toLowerCase()}'s phone`}
                                                                                className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${
                                                                                    passengerErrors[`${passenger.id}_phone`]
                                                                                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                                                        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                                                }`}
                                                                            />
                                                                            <AnimatePresence>
                                                                                {passengerErrors[`${passenger.id}_phone`] && (
                                                                                    <motion.p 
                                                                                        className="text-red-500 text-sm flex items-center gap-2"
                                                                                        initial={{ opacity: 0, y: -10 }}
                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                        exit={{ opacity: 0, y: -10 }}
                                                                                    >
                                                                                        <AlertCircle className="w-4 h-4" />
                                                                                        {passengerErrors[`${passenger.id}_phone`]}
                                                                                    </motion.p>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Country */}
                                                                    <div className="space-y-3">
                                                                        <label className="block text-sm font-semibold text-gray-900">
                                                                            Country <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name={`${passenger.id}_country`}
                                                                            value={passenger.country}
                                                                            onChange={(e) => handlePassengerFormChange(passenger.id, 'country', e.target.value)}
                                                                            placeholder={`Enter ${title.toLowerCase()}'s country`}
                                                                            list="countries-list"
                                                                            className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${
                                                                                passengerErrors[`${passenger.id}_country`]
                                                                                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                                                    : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                                            }`}
                                                                        />
                                                                        <datalist id="countries-list">
                                                                            {["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", "China", "India"].map(country => (
                                                                                <option key={country} value={country} />
                                                                            ))}
                                                                        </datalist>
                                                                        <AnimatePresence>
                                                                            {passengerErrors[`${passenger.id}_country`] && (
                                                                                <motion.p 
                                                                                    className="text-red-500 text-sm flex items-center gap-2"
                                                                                    initial={{ opacity: 0, y: -10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: -10 }}
                                                                                >
                                                                                    <AlertCircle className="w-4 h-4" />
                                                                                    {passengerErrors[`${passenger.id}_country`]}
                                                                                </motion.p>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                    
                                                                    {/* Passport/ID - Required for both adults and children */}
                                                                    <div className="space-y-3">
                                                                        <label className="block text-sm font-semibold text-gray-900">
                                                                            Passport No. / ID No. <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name={`${passenger.id}_passport_id`}
                                                                            value={passenger.passport_id}
                                                                            onChange={(e) => handlePassengerFormChange(passenger.id, 'passport_id', e.target.value)}
                                                                            placeholder="Enter passport or ID number"
                                                                            className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${
                                                                                passengerErrors[`${passenger.id}_passport_id`]
                                                                                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                                                    : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                                            }`}
                                                                        />
                                                                        <AnimatePresence>
                                                                            {passengerErrors[`${passenger.id}_passport_id`] && (
                                                                                <motion.p 
                                                                                    className="text-red-500 text-sm flex items-center gap-2"
                                                                                    initial={{ opacity: 0, y: -10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: -10 }}
                                                                                >
                                                                                    <AlertCircle className="w-4 h-4" />
                                                                                    {passengerErrors[`${passenger.id}_passport_id`]}
                                                                                </motion.p>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                    
                                                                    {/* Age - Only for children */}
                                                                    {passenger.type === 'child' && (
                                                                        <div className="space-y-3">
                                                                            <label className="block text-sm font-semibold text-gray-900">
                                                                                Age <span className="text-red-500">*</span>
                                                                                <span className="text-xs text-gray-500 ml-2">(0-17 years)</span>
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                name={`${passenger.id}_age`}
                                                                                min="0"
                                                                                max="17"
                                                                                value={passenger.age}
                                                                                onChange={(e) => handlePassengerFormChange(passenger.id, 'age', e.target.value)}
                                                                                placeholder="Enter child's age"
                                                                                className={`w-full p-4 border-2 rounded-xl transition-all duration-300 ${
                                                                                    passengerErrors[`${passenger.id}_age`]
                                                                                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                                                        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                                                }`}
                                                                            />
                                                                            <AnimatePresence>
                                                                                {passengerErrors[`${passenger.id}_age`] && (
                                                                                    <motion.p 
                                                                                        className="text-red-500 text-sm flex items-center gap-2"
                                                                                        initial={{ opacity: 0, y: -10 }}
                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                        exit={{ opacity: 0, y: -10 }}
                                                                                    >
                                                                                        <AlertCircle className="w-4 h-4" />
                                                                                        {passengerErrors[`${passenger.id}_age`]}
                                                                                    </motion.p>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
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
                                            delay: 0.5,
                                            scale: { duration: 0.2 }
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Payment Summary</h3>
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
                                            {/* Original Price */}
                                            <div className="text-sm text-gray-500 mb-2">Original Price:</div>
                                            {orderData.skus?.map((sku, index) => (
                                                <div key={index} className="flex justify-between text-sm text-gray-500">
                                                    <span>SKU {sku.sku_id} (x{sku.quantity})</span>
                                                    <span>
                                                        {sku.sku_price} {sku.currency}
                                                    </span>
                                                </div>
                                            ))}

                                            <div className="border-t border-gray-200 pt-2">
                                                <div className="flex justify-between text-sm text-gray-500">
                                                    <span>Original Total:</span>
                                                    <span>
                                                        {orderData.total_amount} {orderData.currency}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Service Fee */}
                                            <div className="pt-4">
                                                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                                    <Percent className="w-4 h-4 text-blue-600" />
                                                    <span>Service Fee ({markupRate * 100}%)</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Service Fee</span>
                                                    <span className="text-blue-600">
                                                        +{markupAmount.toFixed(2)} {orderData.currency}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Final total */}
                                            <div className="border-t-2 border-gray-200 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                                    <span className="text-2xl font-bold text-green-600">
                                                        {finalTotal.toFixed(2)} {orderData.currency}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.button
                                            onClick={handleProceedToPayment}
                                            className={`w-full mt-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                                                isFloating 
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl'
                                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                            }`}
                                            whileHover={!loading ? { scale: 1.02 } : {}}
                                            whileTap={!loading ? { scale: 0.98 } : {}}
                                            animate={isFloating ? { 
                                                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
                                            } : {}}
                                        >
                                            <Shield className="w-5 h-5" />
                                            Proceed to Payment
                                        </motion.button>

                                        <div className="mt-4 text-center">
                                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                                <Sparkles className="w-4 h-4" />
                                                <span>Your adventure awaits!</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Your booking will be confirmed after successful payment
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default OrderConfirmationPage;