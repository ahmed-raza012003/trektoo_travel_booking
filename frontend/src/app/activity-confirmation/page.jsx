"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Users, MapPin, CreditCard, Loader, Shield, FileText, ArrowLeft } from "lucide-react";
import { KLOOK_API_BASE, LOCAL_API_BASE } from "@/lib/api/klookApi";
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const OrderConfirmationPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const agentOrderId = searchParams.get('agent_order_id');
    const { token, isAuthenticated, isLoading: authLoading } = useAuth(); // Use your auth context

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

            // Format the extra_info for Klook API
            const formatExtraInfo = (extraInfo) => {
                if (!extraInfo) return [];
                return Object.entries(extraInfo).map(([key, value]) => ({
                    key: key,
                    content: value,
                    selected: null,
                    input_type: "text"
                }));
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
            const response = await fetch(`${KLOOK_API_BASE}/orders`, {
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
            const response = await fetch(`${KLOOK_API_BASE}/orders/${orderId}`);
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


    // const handleProceedToPayment = () => {
    //     if (orderData) {
    //         // Store order data for payment page
    //         localStorage.setItem('currentOrder', JSON.stringify(orderData));

    //         // Get it back from localStorage (to confirm it saved correctly)
    //         const currentOrder = JSON.parse(localStorage.getItem('currentOrder'));

    //         // Show alert with order data (stringified for display)
    //         alert(`Current Order Data:\n${JSON.stringify(currentOrder, null, 2)}`);

    //         // Log the order data in console
    //         console.log("Current Order:", currentOrder);

    //         // Commenting out router push for now
    //         // router.push(`/payment/checkout?order_id=${orderData.klktech_order_id}`);
    //     }
    // };

    // Update your handleProceedToPayment function
    // In your OrderConfirmationPage component
    const handleProceedToPayment = async () => {
        if (orderData && token) {
            try {
                setLoading(true);
                setError(null);
                
                const originalTotal = parseFloat(orderData.total_amount);
                const finalTotal = originalTotal * (1 + markupRate);
                
                const storedBooking = JSON.parse(localStorage.getItem('pendingBooking') || '{}');

                const response = await fetch(`${LOCAL_API_BASE}/klook/payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        order_id: orderData.klktech_order_id,
                        agent_order_id: orderData.agent_order_id,
                        amount: finalTotal.toFixed(2),
                        currency: orderData.currency,
                        customer_email: orderData.contact_info?.email || storedBooking.customer_info?.email || '',
                        customer_name: `${orderData.contact_info?.first_name || ''} ${orderData.contact_info?.family_name || ''}`.trim(),
                        booking_data: {
                            activity_id: storedBooking.activity_id,
                            activity_name: orderData.bookings?.[0]?.activity_name,
                            package_id: storedBooking.package_id,
                            start_time: storedBooking.schedule?.start_time,
                            adult_quantity: storedBooking.adult_quantity || 1,
                            child_quantity: storedBooking.child_quantity || 0,
                            customer_phone: orderData.contact_info?.mobile || storedBooking.customer_info?.phone,
                            customer_country: orderData.contact_info?.country || storedBooking.customer_info?.country
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
                    router.push(`/payment/checkout?payment_intent=${result.data.payment_intent_id}&order_id=${result.data.order_id}`);
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


    // Add this function to test backend connection
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

    // Call this function when component mounts
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
                    <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700">
                        {creatingOrder ? 'Creating your order...' : 'Loading order details...'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we process your booking</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center max-w-md mx-4">
                    <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500 mb-6">
                        Please ensure your backend server is running on http://localhost:8000
                        <br />
                        Run: <code className="bg-gray-100 p-1 rounded">php artisan serve</code>
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleBackToBooking}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
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

    return (
        <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8 mt-10">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-green-100 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Order Created Successfully</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-700 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Order Confirmation
                    </h1>
                    <p className="text-gray-600">Review your order details before proceeding to payment</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Order Details */}
                    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl shadow-blue-100/20">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Order Information
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Number:</span>
                                <span className="font-semibold">{orderData.klktech_order_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Agent Order ID:</span>
                                <span className="font-semibold">{orderData.agent_order_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="font-semibold capitalize">{orderData.confirm_status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Transaction Status:</span>
                                <span className="font-semibold">{orderData.transaction_status}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-3">Booking Summary</h3>
                            {orderData.bookings?.map((booking, index) => (
                                <div key={index} className="space-y-2">
                                    <p className="font-medium">{booking.activity_name}</p>
                                    <p className="text-sm text-gray-600">{booking.package_name}</p>
                                    <p className="text-sm">Reference: {booking.booking_ref_number}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl shadow-blue-100/20">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Summary
                        </h2>

                        <div className="space-y-3">
                            {/* Show original price details */}
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

                            {/* Show markup details */}
                            <div className="pt-4">
                                <div className="text-sm font-medium mb-2">Service Fee ({markupRate * 100}%):</div>
                                <div className="flex justify-between text-sm">
                                    <span>Service Fee</span>
                                    <span className="text-blue-600">
                                        +{markupAmount.toFixed(2)} {orderData.currency}
                                    </span>
                                </div>
                            </div>

                            {/* Final total */}
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Amount:</span>
                                    <span className="text-green-600">
                                        {finalTotal.toFixed(2)} {orderData.currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleProceedToPayment}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <Shield className="w-5 h-5" />
                            Proceed Booking
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                            Your booking will be confirmed after successful payment
                        </p>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="mt-8 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl shadow-blue-100/20">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Details</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {orderData.bookings?.map((booking, bookingIndex) => (
                            <div key={bookingIndex}>
                                <h3 className="font-semibold text-gray-800 mb-3">Booking #{bookingIndex + 1}</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Activity:</span> {booking.activity_name}</p>
                                    <p><span className="font-medium">Package:</span> {booking.package_name}</p>
                                    <p><span className="font-medium">Reference:</span> {booking.booking_ref_number}</p>
                                    <p><span className="font-medium">Status:</span> {booking.confirm_status}</p>

                                    {booking.operator_contacts?.length > 0 && (
                                        <div>
                                            <p className="font-medium mb-1">Operator Contacts:</p>
                                            {booking.operator_contacts.map((contact, contactIndex) => (
                                                <div key={contactIndex} className="text-sm">
                                                    {contact.details.map((detail, detailIndex) => (
                                                        <p key={detailIndex}>{contact.method}: {detail}</p>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </ProtectedRoute>

    );
};

export default OrderConfirmationPage;