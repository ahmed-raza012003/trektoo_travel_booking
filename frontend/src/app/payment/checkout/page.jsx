"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, CreditCard, Shield, Loader, AlertCircle } from "lucide-react";
import { LOCAL_API_BASE } from "@/lib/api/klookApi";
import { useAuth } from '@/contexts/AuthContext';

const PaymentCheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentIntentId = searchParams.get('payment_intent');
    const orderId = searchParams.get('order_id');
    const { token, isAuthenticated, isLoading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
            return;
        }

        if (paymentIntentId && orderId) {
            fetchPaymentData();
        } else {
            setError("Missing payment information. Please try again.");
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, paymentIntentId, orderId, router]);

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get stored payment data from localStorage
            const storedPayment = localStorage.getItem('klookPayment');
            if (storedPayment) {
                const paymentInfo = JSON.parse(storedPayment);
                setPaymentData(paymentInfo);
            } else {
                // If not in localStorage, fetch from backend
                const response = await fetch(`${LOCAL_API_BASE}/klook/order-status/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPaymentData(data.data);
                } else {
                    throw new Error('Failed to fetch payment information');
                }
            }
        } catch (err) {
            console.error('Payment data fetch error:', err);
            setError(err.message || 'Failed to load payment information');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            setProcessing(true);
            setError(null);

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real implementation, you would integrate with Stripe here
            // For now, we'll simulate a successful payment
            setSuccess(true);

            // Clear stored data
            localStorage.removeItem('pendingBooking');
            localStorage.removeItem('klookOrderNo');
            localStorage.removeItem('agentOrderId');
            localStorage.removeItem('klookPayment');

            // Redirect to thank you page after 3 seconds
            setTimeout(() => {
                router.push('/thankyou');
            }, 3000);

        } catch (err) {
            console.error('Payment processing error:', err);
            setError(err.message || 'Payment processing failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading payment information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Error</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/activities')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        Back to Activities
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">Your booking has been confirmed. You will be redirected shortly.</p>
                    <div className="animate-pulse">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 mb-6">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Secure Payment</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
                        Complete Your Payment
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        You're almost done! Complete your secure payment to confirm your booking.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Payment Form */}
                    <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl shadow-blue-100/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Payment Method
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border-2 border-blue-200 bg-blue-50 rounded-xl cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="card"
                                            defaultChecked
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="ml-3">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                <span className="font-semibold text-gray-800">Credit/Debit Card</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Card Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl shadow-blue-100/20">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Order ID</span>
                                <span className="font-semibold">{orderId}</span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span>Payment Intent</span>
                                <span className="font-mono text-sm">{paymentIntentId}</span>
                            </div>

                            {paymentData && (
                                <>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Activity</span>
                                        <span className="font-semibold">{paymentData.activity_name || 'Klook Activity'}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Travelers</span>
                                        <span className="font-semibold">
                                            {paymentData.adult_quantity || 1} Adults
                                            {paymentData.child_quantity > 0 && `, ${paymentData.child_quantity} Children`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Travel Date</span>
                                        <span className="font-semibold">
                                            {paymentData.start_time ? new Date(paymentData.start_time).toLocaleDateString() : 'TBD'}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-800">Total Amount</span>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {paymentData?.amount || '0.00'} {paymentData?.currency || 'USD'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full p-4 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {processing ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Processing Payment...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <Shield className="w-5 h-5" />
                                    Complete Payment
                                </div>
                            )}
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
    );
};

export default PaymentCheckoutPage;
