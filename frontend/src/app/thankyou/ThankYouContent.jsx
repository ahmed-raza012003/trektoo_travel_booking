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

      // Define colors and styles - Professional Blue Theme
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
        success: [34, 197, 94],     // Green-500 #22c55e
        blueLight: [239, 246, 255], // Blue-50 #eff6ff
        blueMedium: [147, 197, 253], // Blue-300 #93c5fd
        blueDark: [30, 64, 175],    // Blue-800 #1e40af
        grayLight: [249, 250, 251], // Gray-50 #f9fafb
        grayMedium: [156, 163, 175] // Gray-400 #9ca3af
      };

      // Set font
      doc.setFont('helvetica');

      // Enhanced utility functions for responsive design
      const addPageFooter = (pageNum, totalPages) => {
        // Elegant footer with gradient effect
        doc.setFillColor(...colors.blueLight);
        doc.rect(0, 280, 210, 30, 'F');
        
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(20, 285, 190, 285);
        
        doc.setFontSize(9);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(`TrekToo Travel Booking`, 20, 292);
        doc.text(`Order: ${booking.agent_order_id}`, 20, 297);
        
        doc.setTextColor(...colors.grayMedium);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${pageNum} of ${totalPages}`, 190, 292, { align: 'right' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 190, 297, { align: 'right' });
      };

      const checkPageBreak = (currentY, minHeight = 20) => {
        if (currentY > 260) {
          doc.addPage();
          return 30;
        }
        return currentY;
      };

      const addSectionHeader = (title, currentY, color = colors.primary, icon = null) => {
        // Elegant section header with gradient and icon
        const headerHeight = 16;
        
        // Main header background
        doc.setFillColor(...color);
        doc.roundedRect(20, currentY - 6, 170, headerHeight, 3, 3, 'F');
        
        // Subtle shadow effect
        doc.setFillColor(...colors.blueDark);
        doc.roundedRect(21, currentY - 5, 170, headerHeight, 3, 3, 'F');
        
        // Main header
        doc.setFillColor(...color);
        doc.roundedRect(20, currentY - 6, 170, headerHeight, 3, 3, 'F');
        
        // Icon if provided
        if (icon) {
          doc.setFillColor(255, 255, 255);
          doc.circle(30, currentY + 2, 3, 'F');
        }
        
        // Title text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(title, icon ? 40 : 25, currentY + 3);
        
        return currentY + 18;
      };

      const addInfoCard = (title, value, currentY, isHighlight = false) => {
        const cardHeight = 12;
        const cardWidth = 80;
        
        // Card background
        doc.setFillColor(...(isHighlight ? colors.blueLight : colors.grayLight));
        doc.roundedRect(20, currentY, cardWidth, cardHeight, 2, 2, 'F');
        
        // Card border
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, currentY, cardWidth, cardHeight, 2, 2, 'S');
        
        // Title
        doc.setFontSize(8);
        doc.setTextColor(...colors.grayMedium);
        doc.setFont('helvetica', 'normal');
        doc.text(title, 22, currentY + 4);
        
        // Value
        doc.setFontSize(10);
        doc.setTextColor(...(isHighlight ? colors.primary : colors.dark));
        doc.setFont('helvetica', 'bold');
        doc.text(value, 22, currentY + 8);
        
        return currentY + cardHeight + 4;
      };

      const addPassengerCard = (passenger, currentY, isLead = false) => {
        const cardHeight = isLead ? 20 : 16;
        const cardWidth = 170;
        
        // Card background with different colors for lead vs regular
        doc.setFillColor(...(isLead ? colors.blueLight : colors.grayLight));
        doc.roundedRect(20, currentY, cardWidth, cardHeight, 4, 4, 'F');
        
        // Card border
        doc.setDrawColor(...(isLead ? colors.primary : colors.border));
        doc.setLineWidth(isLead ? 0.8 : 0.3);
        doc.roundedRect(20, currentY, cardWidth, cardHeight, 4, 4, 'S');
        
        // Lead passenger badge
        if (isLead) {
          doc.setFillColor(...colors.primary);
          doc.roundedRect(25, currentY + 2, 30, 6, 3, 3, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('LEAD', 40, currentY + 5, { align: 'center' });
        }
        
        // Passenger name
        doc.setFontSize(11);
        doc.setTextColor(...colors.dark);
        doc.setFont('helvetica', 'bold');
        doc.text(`${passenger.first_name} ${passenger.last_name}`, 25, currentY + (isLead ? 10 : 6));
        
        // Passenger details
        doc.setFontSize(8);
        doc.setTextColor(...colors.text);
        doc.setFont('helvetica', 'normal');
        
        let detailY = currentY + (isLead ? 13 : 9);
        const details = [];
        
        if (passenger.email) details.push(`Email: ${passenger.email}`);
        if (passenger.phone) details.push(`Phone: ${passenger.phone}`);
        details.push(`Country: ${passenger.country}`);
        details.push(`ID: ${passenger.passport_id}`);
        if (passenger.age !== null) details.push(`Age: ${passenger.age}`);
        
        details.forEach((detail, index) => {
          if (detailY < currentY + cardHeight - 2) {
            doc.text(detail, 25, detailY);
            detailY += 3;
          }
        });
        
        return currentY + cardHeight + 6;
      };

      // PAGE 1: Elegant Header and Booking Overview
      // Modern gradient header
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 50, 'F');
      
      // Subtle gradient effect
      doc.setFillColor(...colors.blueDark);
      doc.rect(0, 0, 210, 5, 'F');
      
      // Logo area with modern design
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, 15, 40, 20, 4, 4, 'F');
      doc.setTextColor(...colors.primary);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TREKTOO', 40, 28, { align: 'center' });

      // Main title with elegant typography
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BOOKING CONFIRMATION', 80, 25);
      
      // Subtitle
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.blueMedium);
      doc.text('Your Adventure Awaits', 80, 30);

      // Decorative elements
      doc.setFillColor(255, 255, 255);
      doc.circle(185, 20, 4, 'F');
      doc.circle(190, 25, 2, 'F');
      doc.circle(180, 30, 3, 'F');

      let currentY = 70;

      // Activity Information with modern card design
      currentY = addSectionHeader('ACTIVITY INFORMATION', currentY, colors.primary);
      
      // Activity name with elegant typography
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.dark);
      const activityLines = doc.splitTextToSize(booking.activity_name || 'Activity', 160);
      activityLines.forEach((line, index) => {
        doc.text(line, 25, currentY + (index * 7));
      });
      currentY += (activityLines.length * 7) + 8;

      // Package info in a card
      doc.setFillColor(...colors.blueLight);
      doc.roundedRect(25, currentY, 160, 12, 3, 3, 'F');
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.roundedRect(25, currentY, 160, 12, 3, 3, 'S');
      
      doc.setFontSize(10);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Package ID:', 28, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(booking.activity_package_id, 28, currentY + 8);
      currentY += 18;

      // Booking Details in responsive grid
      currentY = addSectionHeader('BOOKING DETAILS', currentY, colors.secondary);
      
      // Create responsive grid of info cards
      const bookingDetails = [
        { title: 'Booking ID', value: booking.id.toString(), highlight: false },
        { title: 'Order ID', value: booking.agent_order_id, highlight: true },
        { title: 'Status', value: booking.status.toUpperCase(), highlight: true },
        { title: 'Activity Date', value: booking.activity_date ? 
          new Date(booking.activity_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Not specified', highlight: false }
      ];

      // Responsive grid layout
      let gridY = currentY;
      const cardWidth = 80;
      const cardSpacing = 10;
      const cardsPerRow = 2;
      
      bookingDetails.forEach((detail, index) => {
        const col = index % cardsPerRow;
        const row = Math.floor(index / cardsPerRow);
        const x = 20 + (col * (cardWidth + cardSpacing));
        const y = gridY + (row * 20);
        
        // Card background
        doc.setFillColor(...(detail.highlight ? colors.blueLight : colors.grayLight));
        doc.roundedRect(x, y, cardWidth, 16, 3, 3, 'F');
        
        // Card border
        doc.setDrawColor(...(detail.highlight ? colors.primary : colors.border));
        doc.setLineWidth(detail.highlight ? 0.8 : 0.3);
        doc.roundedRect(x, y, cardWidth, 16, 3, 3, 'S');
        
        // Title
        doc.setFontSize(8);
        doc.setTextColor(...colors.grayMedium);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.title, x + 3, y + 5);
        
        // Value
        doc.setFontSize(10);
        doc.setTextColor(...(detail.highlight ? colors.primary : colors.dark));
        doc.setFont('helvetica', 'bold');
        const valueLines = doc.splitTextToSize(detail.value, cardWidth - 6);
        valueLines.forEach((line, lineIndex) => {
          doc.text(line, x + 3, y + 9 + (lineIndex * 4));
        });
      });
      
      currentY = gridY + (Math.ceil(bookingDetails.length / cardsPerRow) * 20) + 10;

      // Payment Information with elegant design
      currentY = addSectionHeader('PAYMENT INFORMATION', currentY, colors.accent);
      
      const totalPrice = parseFloat(booking.total_price) || 0;
      const totalPaid = payment ? parseFloat(payment.amount) || 0 : totalPrice;

      // Payment summary card
      doc.setFillColor(...colors.success);
      doc.roundedRect(20, currentY, 170, 20, 4, 4, 'F');
      
      // Payment details
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount Paid', 25, currentY + 8);
      
      doc.setFontSize(18);
      doc.text(`${totalPaid.toFixed(2)} ${booking.currency}`, 25, currentY + 15);
      
      // Payment method if available
      if (payment && payment.method) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.blueMedium);
        doc.text(`Paid via ${payment.method}`, 25, currentY + 19);
      }
      
      currentY += 25;

      // Passenger Information with modern card layout
      currentY = addSectionHeader('PASSENGER INFORMATION', currentY, colors.warning);
      
      // Passenger summary
      doc.setFillColor(...colors.blueLight);
      doc.roundedRect(20, currentY, 170, 12, 3, 3, 'F');
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, currentY, 170, 12, 3, 3, 'S');
      
      doc.setFontSize(10);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Travelers: ${summary.total_passengers}`, 25, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`Adults: ${summary.adult_passengers} | Children: ${summary.child_passengers}`, 25, currentY + 8);
      currentY += 16;

      // Lead Passenger Card
      const leadPassenger = summary.lead_passenger;
      if (leadPassenger) {
        currentY = addPassengerCard(leadPassenger, currentY, true);
      }

      // Additional Passengers Cards
      passengers.forEach((passenger, index) => {
        if (!passenger.is_lead_passenger) {
          currentY = checkPageBreak(currentY, 20);
          currentY = addPassengerCard(passenger, currentY, false);
        }
      });

      // QR Code with elegant design
      currentY = checkPageBreak(currentY, 60);
      
      // QR Code container
      doc.setFillColor(...colors.blueLight);
      doc.roundedRect(130, currentY, 60, 50, 4, 4, 'F');
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(1);
      doc.roundedRect(130, currentY, 60, 50, 4, 4, 'S');
      
      try {
        const QRCode = require('qrcode');
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, voucherCode, { width: 40, height: 40 });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 140, currentY + 5, 40, 40);
      } catch (error) {
        console.error('QR Code generation error:', error);
        doc.setFillColor(...colors.light);
        doc.roundedRect(140, currentY + 5, 40, 40, 2, 2, 'F');
        doc.setTextColor(...colors.text);
        doc.setFontSize(8);
        doc.text('QR Code', 160, currentY + 25, { align: 'center' });
      }
      
      // QR Code label
      doc.setFontSize(8);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Voucher Code', 160, currentY + 48, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(voucherCode, 160, currentY + 52, { align: 'center' });
      
      currentY += 60;

      addPageFooter(1, 2);

      // PAGE 2: Additional Details with modern design
      doc.addPage();

      // Elegant header for second page
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 35, 'F');
      
      // Subtle gradient
      doc.setFillColor(...colors.blueDark);
      doc.rect(0, 0, 210, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('BOOKING DETAILS', 20, 22);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.blueMedium);
      doc.text('Complete Information & Voucher', 20, 28);

      currentY = 50;

      // Voucher Information with modern card
      currentY = addSectionHeader('VOUCHER INFORMATION', currentY, colors.accent);
      
      // Voucher card
      doc.setFillColor(...colors.blueLight);
      doc.roundedRect(20, currentY, 170, 16, 4, 4, 'F');
      doc.setDrawColor(...colors.accent);
      doc.setLineWidth(0.8);
      doc.roundedRect(20, currentY, 170, 16, 4, 4, 'S');
      
      doc.setFontSize(12);
      doc.setTextColor(...colors.accent);
      doc.setFont('helvetica', 'bold');
      doc.text('Voucher Code:', 25, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(voucherCode, 25, currentY + 12);
      currentY += 22;

      // Booking Summary with responsive cards
      currentY = addSectionHeader('BOOKING SUMMARY', currentY, colors.secondary);
      
      const bookingSummary = [
        { title: 'Booking Type', value: booking.type, highlight: false },
        { title: 'External ID', value: booking.external_booking_id || 'N/A', highlight: true },
        { title: 'Adults', value: booking.adults.toString(), highlight: false },
        { title: 'Children', value: booking.children.toString(), highlight: false },
        { title: 'Total Guests', value: booking.guests.toString(), highlight: true },
        { title: 'Created', value: new Date(booking.created_at).toLocaleDateString(), highlight: false },
        { title: 'Confirmed', value: booking.confirmed_at ? new Date(booking.confirmed_at).toLocaleDateString() : 'Not confirmed', highlight: booking.confirmed_at ? true : false }
      ];

      // Responsive grid for booking summary
      gridY = currentY;
      const summaryCardWidth = 80;
      const summaryCardSpacing = 10;
      const summaryCardsPerRow = 2;
      
      bookingSummary.forEach((item, index) => {
        const col = index % summaryCardsPerRow;
        const row = Math.floor(index / summaryCardsPerRow);
        const x = 20 + (col * (summaryCardWidth + summaryCardSpacing));
        const y = gridY + (row * 18);
        
        // Card background
        doc.setFillColor(...(item.highlight ? colors.blueLight : colors.grayLight));
        doc.roundedRect(x, y, summaryCardWidth, 16, 3, 3, 'F');
        
        // Card border
        doc.setDrawColor(...(item.highlight ? colors.secondary : colors.border));
        doc.setLineWidth(item.highlight ? 0.8 : 0.3);
        doc.roundedRect(x, y, summaryCardWidth, 16, 3, 3, 'S');
        
        // Title
        doc.setFontSize(8);
        doc.setTextColor(...colors.grayMedium);
        doc.setFont('helvetica', 'normal');
        doc.text(item.title, x + 3, y + 5);
        
        // Value
        doc.setFontSize(9);
        doc.setTextColor(...(item.highlight ? colors.secondary : colors.dark));
        doc.setFont('helvetica', 'bold');
        const valueLines = doc.splitTextToSize(item.value, summaryCardWidth - 6);
        valueLines.forEach((line, lineIndex) => {
          doc.text(line, x + 3, y + 9 + (lineIndex * 3));
        });
      });
      
      currentY = gridY + (Math.ceil(bookingSummary.length / summaryCardsPerRow) * 18) + 10;

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