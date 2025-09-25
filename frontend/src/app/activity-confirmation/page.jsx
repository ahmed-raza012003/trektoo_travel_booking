"use client";
import React, { useEffect, useState } from "react";
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
    const [markupRate] = useState(0.15);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
            return;
        }

        // Get booking data from localStorage
        const storedBooking = localStorage.getItem('pendingBooking');
        if (storedBooking) {
            const parsedBooking = JSON.parse(storedBooking);
            setBookingData(parsedBooking);

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
                            </div>

                            {/* Right Column - Price Summary */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-32">
                                    <motion.div 
                                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Payment Summary</h3>
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
                                            className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
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