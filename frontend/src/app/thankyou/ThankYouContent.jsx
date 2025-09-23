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
import { LOCAL_API_BASE } from '@/lib/api/klookApi';

const ThankYouPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isInitialized } = useAuth();

  const [orderData, setOrderData] = useState(null);
  const [stripePaymentData, setStripePaymentData] = useState(null);
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
      const response = await fetch(`${LOCAL_API_BASE}/klook/orders/${orderId}`, {
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

  const resendVoucher = async () => {
    try {
      setResendingVoucher(true);
      setResendStatus(null);

      const response = await fetch(`${LOCAL_API_BASE}/klook/orders/${orderId}/resend-voucher`, {
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
      const response = await fetch(`${LOCAL_API_BASE}/klook/orders/${orderId}/cancel/apply`, {
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

      const response = await fetch(`${LOCAL_API_BASE}/klook/orders/${orderId}/cancel/status`, {
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
            message: 'Cancellation status retrieved successfully!'
          });
        } else {
          throw new Error(result.error || 'Failed to get cancellation status');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Cancellation status error:', error);
      setCancellationStatus({
        success: false,
        message: error.message
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

  // Enhanced PDF generation function with package data


  const downloadPDF = async () => {
    try {
      if (!orderData || !orderData.bookings || orderData.bookings.length === 0) {
        alert('No booking data available for PDF generation.');
        return;
      }

      const booking = orderData.bookings[0];
      const voucherCode = booking.original_vouchers?.[0]?.codes?.[0]?.code || 'N/A';
      const primaryBooking = orderData.bookings[0];
      const itineraryItems = primaryBooking.original_vouchers?.[0]?.urls?.[0]?.description?.split('\n') || [];

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
        border: [229, 231, 235]     // Gray-200 #e5e7eb
      };

      // Set font
      doc.setFont('helvetica');

      // Utility function to add page number and footer
      const addPageFooter = (pageNum, totalPages) => {
        // Add footer line
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.1);
        doc.line(20, 285, 190, 285);

        // Add footer text
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`TrekToo Booking Voucher | ${booking.booking_ref_number}`, 20, 290);
        doc.text(`Page ${pageNum} of ${totalPages}`, 190, 290, { align: 'right' });
      };

      // Utility function to check if we need a new page
      const checkPageBreak = (currentY, minHeight = 20) => {
        if (currentY > 270) { // Leave space for footer
          doc.addPage();
          return 30; // Start at 30mm on new page
        }
        return currentY;
      };

      // Utility function to add QR code
      const addQRCode = async (text, x, y, size = 50) => {
        try {
          // Create QR code using qrcode.js (you need to install this library)
          // npm install qrcode
          const QRCode = require('qrcode');
          const canvas = document.createElement('canvas');
          await QRCode.toCanvas(canvas, text, { width: size, height: size });
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', x, y, size, size);
        } catch (error) {
          console.error('QR Code generation error:', error);
          // Fallback: Draw placeholder
          doc.setFillColor(...colors.light);
          doc.rect(x, y, size, size, 'F');
          doc.setTextColor(...colors.text);
          doc.setFontSize(8);
          doc.text('QR Code', x + size / 2, y + size / 2 + 2, { align: 'center' });
        }
      };

      // PAGE 1: Header, Booking Info, and Traveler Details
      // Add decorative header
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 40, 'F');

      // Add company logo placeholder
      doc.setFillColor(255, 255, 255);
      doc.rect(20, 10, 40, 10, 'F');
      doc.setTextColor(...colors.primary);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TrekToo', 25, 17);

      // Add title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL BOOKING VOUCHER', 80, 17);

      // Add decorative circle
      doc.setFillColor(...colors.secondary);
      doc.circle(190, 20, 8, 'F');

      // Add main content
      let currentY = 55;
      doc.setTextColor(...colors.dark);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      const activityLines = doc.splitTextToSize(booking.activity_name, 170);
      activityLines.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 10;
      });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Package: ' + booking.package_name, 20, currentY);
      currentY += 15;

      // Add horizontal separator
      doc.setDrawColor(...colors.secondary);
      doc.setLineWidth(0.5);
      doc.line(20, currentY, 190, currentY);
      currentY += 10;

      // Booking Reference and Voucher Code section
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);

      // Left column
      doc.text('Booking Reference ID:', 20, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.booking_ref_number, 20, currentY + 7);
      doc.setFont('helvetica', 'normal');
      currentY += 14;

      doc.text('Voucher No.:', 20, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.accent);
      doc.text(voucherCode, 20, currentY + 7);
      doc.setTextColor(...colors.text);
      doc.setFont('helvetica', 'normal');
      currentY += 14;

      // Right column - Dynamic quantity calculation
      doc.text('Date:', 120, currentY - 28);
      doc.setFont('helvetica', 'bold');
      const activityDate = booking.start_time ?
        new Date(booking.start_time).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) :
        new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      doc.text(activityDate, 120, currentY - 21);
      doc.setFont('helvetica', 'normal');

      doc.text('Quantity:', 120, currentY - 14);
      doc.setFont('helvetica', 'bold');
      // Calculate quantity from booking data
      let totalTravelers = 0;
      if (booking.skus && booking.skus.length > 0) {
        totalTravelers = booking.skus.reduce((sum, sku) => sum + (sku.quantity || 0), 0);
      } else if (orderData.booking) {
        totalTravelers = (orderData.booking.adults || 0) + (orderData.booking.children || 0);
      } else if (booking.adult_quantity || booking.child_quantity) {
        totalTravelers = (booking.adult_quantity || 0) + (booking.child_quantity || 0);
      } else {
        totalTravelers = 1; // Default to 1 if no quantity data found
      }
      doc.text(`${totalTravelers} traveler(s)`, 120, currentY - 7);
      doc.setFont('helvetica', 'normal');
      currentY += 7;

      // Add QR Code
      currentY = checkPageBreak(currentY, 60);
      try {
        // Generate QR code with voucher code
        const QRCode = require('qrcode');
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, voucherCode, { width: 50, height: 50 });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 140, currentY, 50, 50);
      } catch (error) {
        console.error('QR Code generation error:', error);
        // Fallback: Draw placeholder
        doc.setFillColor(...colors.light);
        doc.rect(140, currentY, 50, 50, 'F');
        doc.setTextColor(...colors.text);
        doc.setFontSize(8);
        doc.text('Scan QR Code', 165, currentY + 25, { align: 'center' });
        doc.text('at activity', 165, currentY + 32, { align: 'center' });
        doc.text('location', 165, currentY + 39, { align: 'center' });
      }
      currentY += 60;

      // Traveler's Information section
      currentY = checkPageBreak(currentY, 30);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(...colors.light);
      doc.rect(20, currentY - 5, 170, 10, 'F');
      doc.setTextColor(...colors.dark);
      doc.text('Traveler\'s Information', 25, currentY + 2);
      currentY += 12;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const contactInfo = orderData.contact_info || {};
      const infoItems = [
        `Lead Participant: ${contactInfo.first_name || 'N/A'} ${contactInfo.family_name || 'N/A'}`,
        `Email: ${contactInfo.email || 'N/A'}`,
        `Phone: ${contactInfo.mobile || 'N/A'}`,
        `Country: ${contactInfo.country || 'N/A'}`
      ];

      infoItems.forEach(item => {
        currentY = checkPageBreak(currentY, 10);
        doc.text(item, 25, currentY);
        currentY += 8;
      });

      // Add page number
      addPageFooter(1, 3);

      // PAGE 2: Package Details & Policies
      doc.addPage();

      // Header for page 2
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Package Details & Policies', 20, 20);

      currentY = 40;

      // Package Description section
      currentY = checkPageBreak(currentY, 20);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text('Package Description', 20, currentY);
      currentY += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      const packageDescription = booking.package_name || 'Standard Package';
      const descLines = doc.splitTextToSize(packageDescription, 170);
      descLines.forEach(line => {
        currentY = checkPageBreak(currentY, 10);
        doc.text(line, 20, currentY);
        currentY += 7;
      });
      currentY += 5;

      // Eligibility section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.warning);
      doc.text('Eligibility', 20, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.text('• Infants and children must be included in the passenger headcount', 20, currentY);
      currentY += 10;

      // Terms & Conditions section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text('Terms & Conditions', 20, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      const terms = [
        '• You will receive confirmation of your booking instantly via email.',
        '• In the event that you do not receive an email from us, please check your Spam folder.',
        '• All bookings are subject to availability at the time of confirmation.'
      ];
      terms.forEach(term => {
        currentY = checkPageBreak(currentY, 10);
        doc.text(term, 20, currentY);
        currentY += 7;
      });
      currentY += 5;

      // Cancellation Policy section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.danger);
      doc.text('Cancellation Policy', 20, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      const cancellationPolicy = [
        '• Full refunds will be issued for cancellations made before the voucher is redeemed',
        '• Cancellations within 24 hours of booking may be subject to a processing fee',
        '• No refunds will be issued for no-shows or late arrivals'
      ];
      cancellationPolicy.forEach(policy => {
        currentY = checkPageBreak(currentY, 10);
        doc.text(policy, 20, currentY);
        currentY += 7;
      });
      currentY += 5;

      // How To Use section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.accent);
      doc.text('How To Use', 20, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      const howToUse = [
        '• Look for the guide with a TrekToo sign',
        '• Latecomers or no-shows won\'t be refunded',
        '• Please bring a valid ID matching the booking name',
        '• Present this voucher at the activity location'
      ];
      howToUse.forEach(instruction => {
        currentY = checkPageBreak(currentY, 10);
        doc.text(instruction, 20, currentY);
        currentY += 7;
      });
      currentY += 5;

      // Opening Hours section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text('Opening Hours', 20, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.text('• May, January-March', 20, currentY);
      currentY += 10;

      // Usage Validity section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.text('Usage Validity', 20, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.text('• The voucher is valid only on the specified date (and time if have)', 20, currentY);
      currentY += 10;

      // Add page number
      addPageFooter(2, 3);

      // PAGE 3: Itinerary & Logistics
      doc.addPage();

      // Header for page 3
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Itinerary & Logistics', 20, 20);

      currentY = 40;

      // What's Included section
      currentY = checkPageBreak(currentY, 20);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text('What is included', 20, currentY);
      currentY += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);

      // Extract inclusions from itinerary or use defaults
      let inclusions = [];
      if (itineraryItems && itineraryItems.length > 0) {
        itineraryItems.forEach(item => {
          if (item.includes('[Transportation]')) {
            inclusions.push({ type: 'Transport', items: [item.replace('[Transportation]', '').trim()] });
          } else if (item.includes('[Dining]')) {
            inclusions.push({ type: 'Meal', items: [item.replace('[Dining]', '').trim()] });
          } else if (item.includes('[Attraction/Experience]')) {
            inclusions.push({ type: 'Ticket admission', items: [item.replace('[Attraction/Experience]', '').trim()] });
          }
        });
      }

      // If no inclusions from itinerary, use defaults
      if (inclusions.length === 0) {
        inclusions = [
          { type: 'Transport', items: ['Bus', 'Train'] },
          { type: 'Meal', items: ['Breakfast', 'Lunch', 'Barbecue'] },
          { type: 'Ticket admission', items: ['Minsheng Chongqing Road Intersection'] },
          { type: 'Driver', items: ['Chinese'] },
          { type: 'Extra Fee', items: ['Photography fees'] },
          { type: 'Tax & Discounts', items: ['Tax and discounts included'] },
          { type: 'Insurance', items: ['Insurance provided by the operator'] }
        ];
      }

      inclusions.forEach(inclusion => {
        currentY = checkPageBreak(currentY, 15);
        doc.setFont('helvetica', 'bold');
        doc.text(`${inclusion.type}:`, 20, currentY);
        doc.setFont('helvetica', 'normal');
        const itemsText = inclusion.items.join(', ');
        const itemLines = doc.splitTextToSize(itemsText, 150);
        itemLines.forEach((line, index) => {
          currentY = checkPageBreak(currentY, 10);
          doc.text(line, 45, currentY);
          if (index === 0) currentY += 7;
        });
        currentY += 5;
      });

      currentY += 5;

      // Departure Details section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text('Departure details', 20, currentY);
      currentY += 10;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);

      // Get departure details from booking data or use defaults
      let departureDetails = [];
      if (booking.departure_details && Array.isArray(booking.departure_details)) {
        departureDetails = booking.departure_details;
      } else {
        departureDetails = [
          {
            time: '08:00',
            location: '南方科技大学',
            address: '1088 Xueyuan Blvd, Nanshan, Shenzhen, Guangdong Province, China, 518055',
            instruction: 'You can choose to depart at the following times: 08:00. Make sure you take part at the time you selected at booking'
          },
          {
            time: '09:00',
            location: '深圳高新科技园',
            address: 'China, Guangdong Province, Shenzhen, Nanshan, 高新科技园邮政编码: 518063',
            instruction: 'You can choose to depart at the following times: 09:00. Make sure you take part at the time you selected at booking'
          },
          {
            time: '10:00',
            location: '深圳大学',
            address: '3688 Nanhai Blvd, Nanshan, Shenzhen, Guangdong Province, China, 518060',
            instruction: 'You can choose to depart at the following times: 10:00. Make sure you take part at the time you selected at booking'
          }
        ];
      }

      departureDetails.forEach((departure, index) => {
        currentY = checkPageBreak(currentY, 30);
        doc.setFont('helvetica', 'bold');
        doc.text(`${departure.time} - ${departure.location}`, 20, currentY);
        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.text);

        const addressLines = doc.splitTextToSize(`Address: ${departure.address}`, 170);
        addressLines.forEach(line => {
          currentY = checkPageBreak(currentY, 10);
          doc.text(line, 25, currentY);
          currentY += 7;
        });

        const instructionLines = doc.splitTextToSize(`Instruction: ${departure.instruction}`, 170);
        instructionLines.forEach(line => {
          currentY = checkPageBreak(currentY, 10);
          doc.text(line, 25, currentY);
          currentY += 7;
        });

        currentY += 5;

        // Add separator between departures except after the last one
        if (index < departureDetails.length - 1) {
          currentY = checkPageBreak(currentY, 10);
          doc.setDrawColor(...colors.border);
          doc.setLineWidth(0.2);
          doc.line(20, currentY, 190, currentY);
          currentY += 5;
        }
      });

      // Return Details section
      currentY = checkPageBreak(currentY, 30);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text('Return details', 20, currentY);
      currentY += 10;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);

      // Get return details from booking data or use defaults
      let returnDetails = {};
      if (booking.return_details) {
        returnDetails = booking.return_details;
      } else {
        returnDetails = {
          time: '18:00',
          location: 'Shenzhen University Station',
          address: 'Shenzhen University Station, Shenzhen, Guangdong, China',
          instruction: 'You can choose to return at the following times: 18:00. Options available can vary based on the departure time you selected at booking and the duration of the itinerary.'
        };
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${returnDetails.time} - ${returnDetails.location}`, 20, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);

      const returnAddressLines = doc.splitTextToSize(`Address: ${returnDetails.address}`, 170);
      returnAddressLines.forEach(line => {
        currentY = checkPageBreak(currentY, 10);
        doc.text(line, 25, currentY);
        currentY += 7;
      });

      const returnInstructionLines = doc.splitTextToSize(`Instruction: ${returnDetails.instruction}`, 170);
      returnInstructionLines.forEach(line => {
        currentY = checkPageBreak(currentY, 10);
        doc.text(line, 25, currentY);
        currentY += 7;
      });

      currentY += 5;

      // Itinerary section
      currentY = checkPageBreak(currentY, 20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      doc.text('Itinerary', 20, currentY);
      currentY += 10;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);

      // Use itinerary from booking data or fallback to sample
      let itinerary = [];
      if (itineraryItems && itineraryItems.length > 0) {
        itinerary = itineraryItems.filter(item => item.trim().length > 0);
      } else {
        itinerary = [
          '[Attraction/Experience] 6 hr(s) Free entry Minsheng Chongqing Road Intersection',
          '[Transportation] 3 hr(s) Bus, 6 hr(s) Train',
          '[Dining] Lunch, Barbecue, 2 hr(s), 深圳湾餐厅',
          '[Attraction/Experience] Tour passes by Workshop and class 香港迪士尼游玩'
        ];
      }

      itinerary.forEach(item => {
        currentY = checkPageBreak(currentY, 15);
        // Format the item with icons based on type
        let icon = '•';
        if (item.includes('[Attraction/Experience]')) {
          icon = '★';
          doc.setTextColor(...colors.accent);
        } else if (item.includes('[Transportation]')) {
          icon = '🚌';
          doc.setTextColor(...colors.primary);
        } else if (item.includes('[Dining]')) {
          icon = '🍽️';
          doc.setTextColor(...colors.warning);
        } else {
          doc.setTextColor(...colors.text);
        }

        let cleanItem = item;
        if (item.includes('[') && item.includes(']')) {
          cleanItem = item.replace(/\[.*?\]/, '').trim();
        }

        const lines = doc.splitTextToSize(`${icon} ${cleanItem}`, 170);
        lines.forEach((line, index) => {
          currentY = checkPageBreak(currentY, 10);
          doc.text(line, 20, currentY);
          currentY += 8;
        });
        doc.setTextColor(...colors.text);
      });

      // Add footer with important notes
      currentY = checkPageBreak(currentY, 30);
      doc.setFillColor(...colors.light);
      doc.rect(20, currentY, 170, 20, 'F');
      doc.setTextColor(...colors.danger);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Notes:', 25, currentY + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);

      const importantNotes = [
        '• 准时到呀 (Please be on time)',
        '• 南方科技大学站点哈 (Southern University of Science and Technology Station)',
        '• Contact support if you have any questions: support@trektoo.com'
      ];

      importantNotes.forEach((note, index) => {
        doc.text(note, 25, currentY + 14 + (index * 7));
      });

      // Add page number
      addPageFooter(3, 3);

      // Save the PDF
      doc.save(`trektoo-voucher-${booking.booking_ref_number}.pdf`);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
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
            className="inline-flex items-center gap-3 bg-green-50 px-6 py-3 rounded-full border border-green-200 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Booking Confirmed Successfully</span>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {orderData.confirm_status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-500">Total Paid</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">
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
                <div className="mt-6 pt-6 border-t border-gray-200">
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
                </div>
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
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
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
                            View Voucher
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Voucher Resend Section */}
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
                      Download Voucher
                    </button>

                    {resendStatus && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${resendStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {resendStatus.message}
                      </div>
                    )}
                  </div>
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
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Cancel Booking
                    </button>

                    <button
                      onClick={getCancellationStatus}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Check Cancellation Status
                    </button>
                  </div>

                  {cancellationStatus && (
                    <div className={`p-3 rounded-lg text-sm ${cancellationStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {cancellationStatus.message}
                    </div>
                  )}

                  {cancellationInfo && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Cancellation Details</h4>
                      <pre className="text-xs text-blue-700 overflow-auto">
                        {JSON.stringify(cancellationInfo, null, 2)}
                      </pre>
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