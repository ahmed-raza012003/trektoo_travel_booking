'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Download, FileText, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const ThankYouContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');

  const [activityBookingData, setActivityBookingData] = useState(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [voucherUrl, setVoucherUrl] = useState(null);

  // Add this debug section to your ThankYou component
  useEffect(() => {
    console.log('🔵 ThankYou Component Debug Info:', {
      sessionId,
      paymentId,
      orderId,
      isAuthChecked,
      hasToken: !!token,
      hasStoredPayment: !!localStorage.getItem('klookPayment'),
      hasStoredBooking: !!localStorage.getItem('pendingBooking')
    });

    if (sessionId && paymentId && orderId && isAuthChecked && token) {
      console.log('🟢 Starting payment flow with parameters:', {
        order_id: orderId,
        payment_id: JSON.parse(localStorage.getItem('klookPayment') || '{}').payment_id,
        stripe_payment_intent_id: sessionId
      });
      completePaymentFlow();
    }
  }, [sessionId, paymentId, orderId, isAuthChecked, token]);

  // In your ThankYouContent component, replace the completePaymentFlow function:

  const completePaymentFlow = async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);

      // Get stored booking data
      const storedPayment = localStorage.getItem('klookPayment');
      const storedBooking = localStorage.getItem('pendingBooking');

      if (!storedPayment || !storedBooking) {
        throw new Error('Missing booking data in localStorage');
      }

      const paymentData = JSON.parse(storedPayment);
      const bookingData = JSON.parse(storedBooking);

      console.log('Starting complete payment flow with:', {
        paymentData,
        bookingData,
        sessionId,
        orderId
      });

      // ✅ CORRECT ENDPOINT - Use the new complete-payment-flow endpoint
      const response = await fetch('http://localhost:8000/api/klook/complete-payment-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderId, // This should be the Klook order ID
          payment_id: paymentData.payment_id, // From your stored payment data
          stripe_payment_intent_id: sessionId // The Stripe session ID
        })
      });

      console.log('Complete payment flow response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment flow failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Payment flow failed: ${errorText}`);
      }

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

        setOrderInfo(result.data.order_details);
        setVoucherUrl(result.data.voucher_pdf_url);

        // Clear stored data
        localStorage.removeItem('klookPayment');
        localStorage.removeItem('pendingBooking');
        localStorage.removeItem('klookOrderNo');
        localStorage.removeItem('agentOrderId');
      } else {
        throw new Error(result.error || result.message || 'Payment flow failed');
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
  };

  const downloadVoucher = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${orderInfo.bookings[0].booking_ref_number}/voucher`, {
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

  if (!isAuthChecked || isProcessing) {
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
                      <p className="text-blue-600">{orderInfo.klktech_order_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Booking Reference</p>
                      <p className="text-blue-600">{orderInfo.bookings[0].booking_ref_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Status</p>
                      <p className="capitalize text-green-600">{orderInfo.confirm_status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Activity</p>
                      <p>{orderInfo.bookings[0].activity_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Package</p>
                      <p>{orderInfo.bookings[0].package_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 text-blue-500">💰</div>
                    <div>
                      <p className="font-semibold">Total Paid</p>
                      <p className="text-green-600 font-bold">
                        {orderInfo.total_amount} {orderInfo.currency}
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
              {orderInfo.bookings[0].operator_contacts && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Operator Contacts</h3>
                  {orderInfo.bookings[0].operator_contacts.map((contact, index) => (
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