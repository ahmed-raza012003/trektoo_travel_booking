'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Download, FileText, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const ThankYouContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, token, isInitialized } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');

  // Fallback: Get payment_id and order_id from localStorage if not in URL
  const getPaymentId = () => {
    if (paymentId) return paymentId;
    const storedPayment = localStorage.getItem('klookPayment');
    if (storedPayment) {
      try {
        return JSON.parse(storedPayment).payment_id;
      } catch (e) {
        console.error('Error parsing stored payment:', e);
      }
    }
    return null;
  };

  const getOrderId = () => {
    if (orderId) return orderId;
    return localStorage.getItem('klookOrderNo') || localStorage.getItem('agentOrderId');
  };

  const [activityBookingData, setActivityBookingData] = useState(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [voucherUrl, setVoucherUrl] = useState(null);
  const [flowStatus, setFlowStatus] = useState({
    completed: false,
    error: null,
    data: null
  });

  // Debug logging
  console.log('🔍 ThankYouContent render - orderInfo:', orderInfo);
  console.log('🔍 ThankYouContent render - flowStatus:', flowStatus);
  console.log('🔍 ThankYouContent render - isInitialized:', isInitialized);
  console.log('🔍 ThankYouContent render - token:', token ? 'exists' : 'missing');

  // Declare completePaymentFlow function before useEffect
  const completePaymentFlow = useCallback(async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);

      // Get resolved values
      const resolvedPaymentId = getPaymentId();
      const resolvedOrderId = getOrderId();

      // Get stored booking data
      const storedPayment = localStorage.getItem('klookPayment');
      const storedBooking = localStorage.getItem('pendingBooking');

      // Create fallback data if localStorage is missing
      const paymentData = storedPayment ? JSON.parse(storedPayment) : {
        payment_id: resolvedPaymentId,
        stripe_payment_intent_id: sessionId,
        amount: '0.00',
        currency: 'EUR'
      };

      const bookingData = storedBooking ? JSON.parse(storedBooking) : {
        activity_id: 'activity_123',
        activity_name: 'Asahiyama Zoo One-day Interactive Tour',
        package_id: '102044',
        start_time: '2025-10-01 00:00:00',
        adult_quantity: 1,
        child_quantity: 0,
        customer_phone: '+1234567890',
        customer_country: 'US'
      };

      console.log('Starting complete payment flow with:', {
        paymentData,
        bookingData,
        sessionId,
        resolvedOrderId,
        resolvedPaymentId
      });

      const response = await fetch('http://localhost:8000/api/klook/complete-payment-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: resolvedOrderId,
          payment_id: resolvedPaymentId,
          stripe_payment_intent_id: sessionId
        })
      });

      console.log('Complete payment flow response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Complete payment flow result:', result);

        if (result.success) {
          setFlowStatus({
            completed: true,
            error: null,
            data: result.data
          });

          setActivityBookingData({
            payment: paymentData,
            booking: bookingData,
            sessionId: sessionId
          });

          // Set order info with fallback structure
          const orderData = result.data || {};
          console.log('🔍 Order data structure:', orderData);
          
          const processedOrderInfo = {
            ...orderData,
            // Ensure bookings array exists with fallback data
            bookings: Array.isArray(orderData.bookings) ? orderData.bookings : [{
              booking_ref_number: orderData.booking?.external_booking_id || 'N/A',
              activity_name: orderData.booking?.activity_name || 'N/A',
              package_name: orderData.booking?.activity_package_id || 'N/A',
              operator_contacts: []
            }],
            // Ensure other required fields exist
            klktech_order_id: orderData.booking?.external_booking_id || orderData.payment?.id || 'N/A',
            confirm_status: 'paid',
            total_amount: orderData.payment?.amount || '0.00',
            currency: orderData.payment?.currency || 'EUR'
          };
          
          console.log('🔍 Processed order info:', processedOrderInfo);
          setOrderInfo(processedOrderInfo);
          setVoucherUrl(result.data.voucher_pdf_url);

          // Clear stored data
          localStorage.removeItem('klookPayment');
          localStorage.removeItem('pendingBooking');
          localStorage.removeItem('klookOrderNo');
          localStorage.removeItem('agentOrderId');
        } else {
          throw new Error(result.error || result.message || 'Payment flow failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Payment flow error:', error);
      setProcessingError(error.message);
      setFlowStatus({
        completed: false,
        error: error.message,
        data: null
      });
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, paymentId, orderId, token]);

  // Add this debug section to your ThankYou component
  useEffect(() => {
    const resolvedPaymentId = getPaymentId();
    const resolvedOrderId = getOrderId();
    
    console.log('🔵 ThankYou Component Debug Info:', {
      sessionId,
      paymentId,
      orderId,
      resolvedPaymentId,
      resolvedOrderId,
      isInitialized,
      isAuthenticated,
      hasToken: !!token,
      hasStoredPayment: !!localStorage.getItem('klookPayment'),
      hasStoredBooking: !!localStorage.getItem('pendingBooking')
    });

    if (sessionId && resolvedPaymentId && resolvedOrderId && isInitialized && token) {
      console.log('🟢 Starting payment flow with parameters:', {
        order_id: resolvedOrderId,
        payment_id: resolvedPaymentId,
        stripe_payment_intent_id: sessionId
      });
      completePaymentFlow();
    }
  }, [sessionId, paymentId, orderId, isInitialized, token, completePaymentFlow]);


  const downloadVoucher = async () => {
    try {
      const bookingRef = orderInfo.bookings?.[0]?.booking_ref_number || orderInfo.booking_ref_number || 'N/A';
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingRef}/voucher`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `trektoo-voucher-${orderInfo.klktech_order_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (!isInitialized || isProcessing) {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/25 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex items-center justify-center min-h-screen pt-24 pb-16 px-4"
        >
          <div className="max-w-md mx-auto p-8 text-center bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-50">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-gray-600 text-base mt-3">
              {isProcessing ? 'Completing your booking...' : 'Loading...'}
            </p>
          </div>
        </motion.div>
      </main>
    );
  }

  if (processingError) {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/25 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex items-center justify-center min-h-screen pt-24 pb-16 px-4"
        >
          <div className="max-w-md mx-auto p-8 text-center bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-50">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-3xl font-bold text-gray-900 mt-4">
              Processing Error
            </h3>
            <p className="text-gray-600 text-base mt-3">
              {processingError}
            </p>
            <Button
              onClick={() => router.push('/')}
              className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  if (!orderInfo) {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/25 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex items-center justify-center min-h-screen pt-24 pb-16 px-4"
        >
          <div className="max-w-md mx-auto p-8 text-center bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-50">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-3xl font-bold text-gray-900 mt-4">
              No Booking Information
            </h3>
            <p className="text-gray-600 text-base mt-3">
              Unable to find booking details. Please contact support.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  // Safety check for orderInfo
  if (!orderInfo || typeof orderInfo !== 'object') {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/25 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center flex items-center justify-center min-h-screen pt-24 pb-16">
          <div className="max-w-md mx-auto p-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-50">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-12 w-12 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xl text-gray-600 font-medium">Loading booking details...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-500/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/25 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-50 p-6 sm:p-8">
            {/* Hero Header */}
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Your activity booking has been confirmed. We look forward to seeing you!
              </p>
              <div className="flex justify-center items-center mt-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-sm font-semibold text-gray-600">
                  Payment Completed & Confirmed
                </span>
              </div>
            </div>

            {/* Booking Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-50 p-6 sm:p-8 mt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Order Number</p>
                      <p className="text-blue-600">{orderInfo.klktech_order_id || orderInfo.order_id || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Booking Reference</p>
                      <p className="text-blue-600">{orderInfo.bookings?.[0]?.booking_ref_number || orderInfo.booking_ref_number || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Status</p>
                      <p className="capitalize text-green-600">{orderInfo.confirm_status || 'Paid'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Activity</p>
                      <p>{orderInfo.bookings?.[0]?.activity_name || orderInfo.activity_name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Package</p>
                      <p>{orderInfo.bookings?.[0]?.package_name || orderInfo.package_name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 text-blue-500">💰</div>
                    <div>
                      <p className="font-semibold">Total Paid</p>
                      <p className="text-green-600 font-bold">
                        {orderInfo.total_amount || '0.00'} {orderInfo.currency || 'EUR'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voucher Download */}
              {voucherUrl && (
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">Your Voucher is Ready!</h3>
                      <p className="text-sm text-green-600">Download your official booking voucher</p>
                    </div>
                    <Button
                      onClick={downloadVoucher}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Voucher
                    </Button>
                  </div>
                </div>
              )}

              {/* Operator Contacts */}
              {orderInfo.bookings?.[0]?.operator_contacts && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Operator Contacts</h3>
                  {orderInfo.bookings?.[0]?.operator_contacts?.map((contact, index) => (
                    <div key={index} className="text-sm text-blue-700">
                      <p><strong>{contact.method}:</strong> {contact.details.join(', ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 flex justify-center space-x-4"
            >
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl px-6 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>

              {voucherUrl && (
                <Button
                  onClick={downloadVoucher}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-xl px-6 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Voucher
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default ThankYouContent;