'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  Loader2,
  FileText,
  Calendar,
  Users,
  MapPin,
  Clock,
  CreditCard,
  Shield,
  Mail,
  Phone,
  ChevronRight,
  XCircle,
  Info,
  Ban,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Import jsPDF for PDF generation
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// Import your API configuration
import API_BASE  from '@/lib/api/klookApi';

const ThankYouPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isInitialized } = useAuth();

  const [orderData, setOrderData] = useState(null);
  const [stripePaymentData, setStripePaymentData] = useState(null);
  const [completeBookingData, setCompleteBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resendingVoucher, setResendingVoucher] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationInfo, setCancellationInfo] = useState(null);

  // Get order ID from URL or localStorage
  const orderId = searchParams.get('order_id') || localStorage.getItem('klookOrderNo');

  useEffect(() => {
    if (orderId && isInitialized && token) {
      fetchOrderDetails(orderId);
      fetchCompleteBookingData(orderId);
      // Get Stripe payment data from localStorage
      const storedPayment = localStorage.getItem('klookPayment');
      if (storedPayment) {
        try {
          setStripePaymentData(JSON.parse(storedPayment));
        } catch (e) {
          console.error('Error parsing stored payment data:', e);
        }
      }
    }
  }, [orderId, isInitialized, token]);

  

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/klook/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOrderData(result.data);
        } else {
          setError(result.error || 'Failed to fetch order details');
        }
      } else {
        setError(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompleteBookingData = async (orderId) => {
    try {
      console.log('Fetching complete booking data for orderId:', orderId);
      console.log('API URL:', `${API_BASE}/klook/booking-data/${orderId}`);
      
      const response = await fetch(`${API_BASE}/klook/booking-data/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        if (result.success) {
          setCompleteBookingData(result.data);
          console.log('Complete booking data loaded:', result.data);
        } else {
          console.error('Failed to fetch complete booking data:', result.error);
        }
      } else {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
      }
    } catch (error) {
      console.error('Error fetching complete booking data:', error);
    }
  };

  const resendVoucher = async () => {
    try {
      setResendingVoucher(true);
      setResendStatus(null);

      const response = await fetch(`${API_BASE}/klook/orders/${orderId}/resend-voucher`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setResendStatus({ success: true, message: 'Voucher has been resent successfully!' });
          // Refresh order details
          await fetchOrderDetails(orderId);
        } else {
          throw new Error(result.error || 'Failed to resend voucher');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Voucher resend error:', error);
      setResendStatus({ success: false, message: error.message });
    } finally {
      setResendingVoucher(false);
    }
  };

  const applyCancellation = async () => {
    try {
      setCancelling(true);
      setCancellationStatus(null);

      // Using refund_reason_id = 1 as a default (change if needed)
      const response = await fetch(`${API_BASE}/klook/orders/${orderId}/cancel/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refund_reason_id: 1
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCancellationStatus({
            success: true,
            message: 'Cancellation request submitted successfully!'
          });
          setShowCancelConfirm(false);
          // Refresh order details
          await fetchOrderDetails(orderId);
        } else {
          throw new Error(result.error || 'Failed to submit cancellation request');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      setCancellationStatus({
        success: false,
        message: error.message
      });
    } finally {
      setCancelling(false);
    }
  };

  const getCancellationStatus = async () => {
    try {
      setCancellationStatus({ loading: true, message: 'Checking cancellation status...' });

      const response = await fetch(`${API_BASE}/klook/orders/${orderId}/cancel/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCancellationInfo(result.data);
          setCancellationStatus({
            success: true,
            message: 'Cancellation status checked successfully!'
          });
        } else {
          throw new Error(result.error || 'Failed to get cancellation status');
        }
      } else if (response.status === 500) {
        // Handle 500 error specifically
        setCancellationStatus({
          success: false,
          message: 'You have not applied for cancellation yet.'
        });
        setCancellationInfo(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Cancellation status error:', error);
      setCancellationStatus({
        success: false,
        message: error.message.includes('500') ? 'You have not applied for cancellation yet.' : error.message
      });
    }
  };

  const downloadVoucher = (voucherUrl) => {
    if (voucherUrl) {
      window.open(voucherUrl, '_blank');
    }
  };

  // Calculate the final price with markup (15%)
  const calculateFinalPrice = () => {
    if (!orderData) return { amount: '0.00', currency: 'USD' };

    const klookAmount = parseFloat(orderData.total_amount) || 0;
    const markupRate = 0.15; // 15% markup
    const markupAmount = klookAmount * markupRate;
    const finalAmount = klookAmount + markupAmount;

    return {
      amount: finalAmount.toFixed(2),
      currency: orderData.currency || 'USD'
    };
  };

  // Get the price from Stripe if available, otherwise calculate with markup
  const getDisplayPrice = () => {
    if (stripePaymentData && stripePaymentData.amount) {
      // Convert from cents to dollars
      const amountInDollars = (stripePaymentData.amount / 100).toFixed(2);
      return {
        amount: amountInDollars,
        currency: stripePaymentData.currency || 'USD'
      };
    }

    // Fallback to calculated price if Stripe data isn't available
    return calculateFinalPrice();
  };

  const displayPrice = getDisplayPrice();

  // Enhanced PDF generation function using complete database data
  const downloadPDF = async () => {
    try {
      if (!completeBookingData) {
        // Try to fetch the data again if not available
        console.log('Complete booking data not available, attempting to fetch...');
        try {
          await fetchCompleteBookingData(orderId);
          // Wait a bit for state to update
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Failed to fetch complete booking data:', error);
        }
        
        if (!completeBookingData) {
          alert('Complete booking data not available. Please try again or contact support.');
          return;
        }
      }

      const { booking, passengers, payment, summary } = completeBookingData;
      const voucherCode = orderData?.bookings?.[0]?.original_vouchers?.[0]?.codes?.[0]?.code || 'N/A';
      
      // Debug logging
      console.log('PDF Generation - Complete booking data:', completeBookingData);
      console.log('PDF Generation - Booking data:', booking);
      console.log('PDF Generation - Payment data:', payment);
      console.log('PDF Generation - Passengers data:', passengers);

      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Define colors and styles
      const colors = {
        primary: [37, 99, 235],     // Blue #2563eb
        secondary: [59, 130, 246],  // Light Blue #3b82f6
        accent: [16, 185, 129],     // Green #10b981
        warning: [245, 158, 11],    // Amber #f59e0b
        danger: [239, 68, 68],      // Red #ef4444
        dark: [17, 24, 39],         // Gray-900 #111827
        light: [243, 244, 246],     // Gray-100 #f3f4f6
        text: [55, 65, 81],         // Gray-700 #374151
        border: [229, 231, 235],    // Gray-200 #e5e7eb
        success: [34, 197, 94]      // Green-500 #22c55e
      };

      // Set font
      doc.setFont('helvetica');

      // Utility functions
      const addPageFooter = (pageNum, totalPages) => {
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.1);
        doc.line(20, 285, 190, 285);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`TrekToo Booking Overview | ${booking.agent_order_id}`, 20, 290);
        doc.text(`Page ${pageNum} of ${totalPages}`, 190, 290, { align: 'right' });
      };

      const checkPageBreak = (currentY, minHeight = 20) => {
        if (currentY > 270) {
          doc.addPage();
          return 30;
        }
        return currentY;
      };

      const addSectionHeader = (title, currentY, color = colors.primary) => {
        doc.setFillColor(...color);
        doc.rect(20, currentY - 5, 170, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 25, currentY + 3);
        return currentY + 15;
      };

      // PAGE 1: Header and Booking Overview
      // Header with logo
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 45, 'F');

      // Logo placeholder
      doc.setFillColor(255, 255, 255);
      doc.rect(20, 12, 35, 12, 'F');
      doc.setTextColor(...colors.primary);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('TREKTOO', 25, 20);

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('BOOKING OVERVIEW', 80, 20);

      // Decorative elements
      doc.setFillColor(...colors.secondary);
      doc.circle(190, 22, 6, 'F');

      let currentY = 60;

      // Removed booking status section

      // Activity Information
      currentY = addSectionHeader('ACTIVITY INFORMATION', currentY);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      const activityLines = doc.splitTextToSize(booking.activity_name || 'Activity', 170);
      activityLines.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 8;
      });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.text(`Package ID: ${booking.activity_package_id}`, 20, currentY);
      currentY += 10;

      // Booking Details Grid
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.5);
      doc.line(20, currentY, 190, currentY);
      currentY += 10;

      doc.setFontSize(11);
      doc.setTextColor(...colors.text);

      // Left column
      doc.text('Booking ID:', 20, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.id.toString(), 20, currentY + 6);
      doc.setFont('helvetica', 'normal');
      currentY += 12;

      doc.text('Agent Order ID:', 20, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.agent_order_id, 20, currentY + 6);
      doc.setFont('helvetica', 'normal');
      currentY += 12;

      // Right column
      doc.text('Activity Date:', 120, currentY - 24);
      doc.setFont('helvetica', 'bold');
      const activityDate = booking.activity_date ?
        new Date(booking.activity_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) :
        'Not specified';
      doc.text(activityDate, 120, currentY - 18);
      doc.setFont('helvetica', 'normal');

      doc.text('Status:', 120, currentY - 12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.success);
      doc.text(booking.status.toUpperCase(), 120, currentY - 6);
      doc.setTextColor(...colors.text);
      doc.setFont('helvetica', 'normal');
      currentY += 6;

      // Payment Information
      currentY = addSectionHeader('PAYMENT INFORMATION', currentY, colors.accent);

      doc.setFontSize(11);
      doc.setTextColor(...colors.text);

      // Payment Information - Simplified
      const totalPrice = parseFloat(booking.total_price) || 0;
      const totalPaid = payment ? parseFloat(payment.amount) || 0 : totalPrice;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Total Paid:', 20, currentY);
      doc.setTextColor(...colors.success);
      doc.text(`${totalPaid.toFixed(2)} ${booking.currency}`, 120, currentY, { align: 'right' });
      doc.setTextColor(...colors.text);
      currentY += 15;

      // Passenger Information
      currentY = addSectionHeader('PASSENGER INFORMATION', currentY, colors.warning);
      
      // Lead Passenger
      const leadPassenger = summary.lead_passenger;
      if (leadPassenger) {
        doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
        doc.text('Lead Passenger:', 20, currentY);
        currentY += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
        
        const leadPassengerInfo = [
          `Name: ${leadPassenger.first_name} ${leadPassenger.last_name}`,
          `Email: ${leadPassenger.email || 'N/A'}`,
          `Phone: ${leadPassenger.phone || 'N/A'}`,
          `Country: ${leadPassenger.country}`,
          `Passport/ID: ${leadPassenger.passport_id}`
        ];

        leadPassengerInfo.forEach(info => {
          doc.text(info, 25, currentY);
          currentY += 6;
        });
        currentY += 8;
      }

      // All Passengers
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text(`Total Passengers: ${summary.total_passengers} (${summary.adult_passengers} adults, ${summary.child_passengers} children)`, 20, currentY);
      currentY += 8;

      // List all passengers
      passengers.forEach((passenger, index) => {
        if (!passenger.is_lead_passenger) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
          doc.text(`${passenger.type.toUpperCase()} ${passenger.passenger_number}:`, 25, currentY);
          currentY += 6;
          
          doc.text(`  • Name: ${passenger.first_name} ${passenger.last_name}`, 30, currentY);
      currentY += 5;

          if (passenger.email) {
            doc.text(`  • Email: ${passenger.email}`, 30, currentY);
      currentY += 5;
          }
          
          if (passenger.phone) {
            doc.text(`  • Phone: ${passenger.phone}`, 30, currentY);
      currentY += 5;
          }
          
          doc.text(`  • Country: ${passenger.country}`, 30, currentY);
          currentY += 5;
          
          doc.text(`  • Passport/ID: ${passenger.passport_id}`, 30, currentY);
          currentY += 5;
          
          if (passenger.age !== null) {
            doc.text(`  • Age: ${passenger.age}`, 30, currentY);
            currentY += 5;
          }
          
          currentY += 3;
        }
      });

      // QR Code
      currentY = checkPageBreak(currentY, 60);
      try {
        const QRCode = require('qrcode');
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, voucherCode, { width: 50, height: 50 });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 140, currentY, 50, 50);
      } catch (error) {
        console.error('QR Code generation error:', error);
        doc.setFillColor(...colors.light);
        doc.rect(140, currentY, 50, 50, 'F');
      doc.setTextColor(...colors.text);
        doc.setFontSize(8);
        doc.text('QR Code', 165, currentY + 25, { align: 'center' });
      }
      currentY += 60;

      addPageFooter(1, 2);

      // PAGE 2: Additional Details
      doc.addPage();

      // Header
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BOOKING DETAILS', 20, 20);

      currentY = 40;

      // Voucher Information
      currentY = addSectionHeader('VOUCHER INFORMATION', currentY);
      
      doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.accent);
      doc.text(`Voucher Code: ${voucherCode}`, 20, currentY);
      currentY += 15;

      // Booking Summary
      currentY = addSectionHeader('BOOKING SUMMARY', currentY, colors.secondary);
      
      const bookingSummary = [
        `Booking Type: ${booking.type}`,
        `External Booking ID: ${booking.external_booking_id || 'N/A'}`,
        `Adults: ${booking.adults}`,
        `Children: ${booking.children}`,
        `Total Guests: ${booking.guests}`,
        `Created: ${new Date(booking.created_at).toLocaleDateString()}`,
        `Confirmed: ${booking.confirmed_at ? new Date(booking.confirmed_at).toLocaleDateString() : 'Not confirmed'}`
      ];

      doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.text);

      bookingSummary.forEach(info => {
          currentY = checkPageBreak(currentY, 10);
        doc.text(info, 20, currentY);
          currentY += 7;
        });
        currentY += 5;

      // Removed Important Information and Contact Information sections

      addPageFooter(2, 2);

      // Save the PDF
      const fileName = `trektoo-booking-${booking.agent_order_id}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        completeBookingData: completeBookingData,
        orderData: orderData
      });
      alert(`Failed to generate PDF: ${error.message}. Please check console for details.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="text-center max-w-md p-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-50">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Order Data Found</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-thankyou-page"
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
          <rect width="100" height="100" fill="url(#grid-thankyou-page)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-full blur-2xl"></div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto mt-10">
          <motion.div
            className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full border border-green-200 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Booking Confirmed Successfully</span>
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
            Thank You for Your{' '}
            <span className="text-blue-600 relative">
              Booking!
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
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your activity has been successfully booked. We've sent a confirmation email with all the details.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Summary Card */}
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
                  <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
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
                      <CheckCircle className="w-4 h-4" />
                      {orderData.confirm_status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-500">Total Paid</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {displayPrice.amount} {displayPrice.currency}
                    </p>
                    {stripePaymentData && (
                      <p className="text-xs text-gray-500">
                        Paid via Stripe
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                {/* <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Klook Price</span>
                      <span>{orderData.total_amount} {orderData.currency}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee (15%)</span>
                      <span>{(parseFloat(orderData.total_amount) * 0.15).toFixed(2)} {orderData.currency}</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                      <span>Total Paid</span>
                      <span className="text-green-600">{displayPrice.amount} {displayPrice.currency}</span>
                    </div>
                  </div>
                </div> */}
              </motion.div>

              {/* Booking Details Card */}
              {orderData.bookings && orderData.bookings.map((booking, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-purple-600 rounded-2xl p-3 shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.activity_name}</h3>
                    <p className="text-gray-600">{booking.package_name}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-500">Booking Reference</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-600">
                        {booking.booking_ref_number}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-500">Status</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        {booking.confirm_status}
                      </div>
                    </div>
                  </div>

                  {/* Voucher Information */}
                  {booking.voucher_url && (
                    <div className="mb-6">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-1">Your Voucher is Ready</h4>
                            <p className="text-sm text-blue-600">Download your voucher to present at the activity</p>
                          </div>
                          <button
                            onClick={() => downloadVoucher(booking.voucher_url)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Activity Voucher
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Voucher Resend Section - Only show if booking is confirmed */}
                  {orderData.confirm_status === 'confirmed' && (
                  <div>
                    <button
                      onClick={resendVoucher}
                      disabled={resendingVoucher}
                      className="w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                    >
                      {resendingVoucher ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Resending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Voucher via Email
                        </>
                      )}
                    </button>

                    {/* Enhanced PDF Download Button */}
                    <button
                      onClick={downloadPDF}
                      className="w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition duration-200 flex items-center justify-center mt-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                        Download Booking Overview
                    </button>

                    {resendStatus && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${resendStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {resendStatus.message}
                      </div>
                    )}
                  </div>
                  )}

                  {/* Show message when booking is not confirmed */}
                  {orderData.confirm_status !== 'confirmed' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-800">Booking Pending Confirmation</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Your booking is being processed. You'll receive an email confirmation once it's confirmed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Important Information Card */}
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-amber-600 rounded-2xl p-3 shadow-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Important Information</h2>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <ul className="list-disc list-inside text-amber-800 space-y-2">
                    <li>Please bring a printed copy of your voucher or show it on your mobile device</li>
                    <li>Arrive at least 15 minutes before your scheduled activity time</li>
                    <li>Bring a valid photo ID that matches the name on the booking</li>
                    <li>Contact support if you have any questions or need to make changes</li>
                    <li>Check your package details in the downloaded PDF for complete itinerary and inclusions</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Actions & Support */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Cancellation Card */}
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <Ban className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cancellation Options</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Need to cancel your booking? We're here to help.
                  </p>

                  <div className="space-y-3">
                    {/* Cancel Booking Button - Only show if order is confirmed */}
                    {orderData?.confirm_status === 'confirmed' && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancel Booking
                      </button>
                    )}

                    {/* Check Cancellation Status Button - Only show if order is confirmed */}
                    {orderData?.confirm_status === 'confirmed' && (
                      <button
                        onClick={getCancellationStatus}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Check Cancellation Status
                      </button>
                    )}

                    {/* Show message when order is not confirmed */}
                    {orderData?.confirm_status !== 'confirmed' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-800">Cancellation Not Available</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Cancellation options are only available for confirmed bookings.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {cancellationStatus && (
                    <div className={`p-3 rounded-lg text-sm ${cancellationStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {cancellationStatus.message}
                    </div>
                  )}

                  {cancellationInfo && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-800">Order Cancelled</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Your order has been cancelled successfully.
                          </p>
                          {cancellationInfo.result && cancellationInfo.result.length > 0 && (
                            <div className="mt-2 text-xs text-red-600">
                              {/* <p>Refund Amount: {cancellationInfo.result[0].finance_info?.refund_amount} {cancellationInfo.result[0].finance_info?.currency}</p> */}
                              <p>Cancelled on: {new Date(cancellationInfo.result[0].cancel_confirm_time).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Support Card */}
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Our customer support team is here to help with any questions about your booking.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">support@trektoo.com</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">+1 (555) 123-4567</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/contact')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Contact Support
                  </button>
                </div>
              </motion.div>

              {/* Next Steps Card */}
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Next Steps</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600">1</span>
                    </div>
                    <p className="text-sm text-gray-600">Check your email for confirmation details</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600">2</span>
                    </div>
                    <p className="text-sm text-gray-600">Download your enhanced PDF voucher with complete package details</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600">3</span>
                    </div>
                    <p className="text-sm text-gray-600">Present your voucher at the activity location</p>
                  </div>

                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="text-center mb-6">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-gray-900 mt-4">Cancel Booking</h3>
                  <p className="text-gray-600 mt-2">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </p>
                  <div className="bg-red-50 rounded-lg p-4 mt-4 border border-red-200">
                    <p className="text-sm text-red-700">
                      <strong>Warning:</strong> Cancellation may be subject to fees based on the activity provider's policy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="bg-gray-500 text-white hover:bg-gray-600 rounded-xl px-6 py-3"
                    disabled={cancelling}
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={applyCancellation}
                    className="bg-red-600 text-white hover:bg-red-700 rounded-xl px-6 py-3"
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Booking'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThankYouPage;