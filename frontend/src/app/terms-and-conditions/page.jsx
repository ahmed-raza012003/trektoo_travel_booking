'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FileText,
  Users,
  Shield,
  Globe,
  CreditCard,
  X,
  Scale,
  Clock,
  CheckCircle,
  Award,
  Lock,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';

const TermsConditionsPage = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };


  const termsSection = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content:
        "By accessing and using Trektoo's services, you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions constitute the entire agreement between you and Trek Too LTD.",
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Users,
      title: 'Use of Services',
      content:
        'Our platform provides travel booking services including flights, hotels, and travel insurance. You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for ensuring the accuracy of all information provided during booking.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Shield,
      title: 'User Accounts',
      content:
        'To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Globe,
      title: 'Booking and Payment',
      content:
        'All bookings are subject to availability and confirmation. Prices may change without notice until booking is confirmed. Payment must be made in full at the time of booking. We accept various payment methods as displayed on our platform.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: X,
      title: 'Cancellation and Refunds',
      content:
        'Cancellations made within 24 hours of booking are subject to a 15% cancellation fee. Refund eligibility depends on the specific terms of your booking and service provider policies. Processing fees may apply to cancellations. Please review individual booking terms before confirming your reservation.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Scale,
      title: 'Limitation of Liability',
      content:
        'Trek Too LTD acts as an intermediary between you and service providers. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of our services or any travel-related issues beyond our control.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Clock,
      title: 'Force Majeure',
      content:
        'We are not responsible for any failure to perform our obligations due to circumstances beyond our reasonable control, including but not limited to natural disasters, government actions, strikes, or other unforeseeable events.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: CheckCircle,
      title: 'Privacy and Data Protection',
      content:
        'We collect and process personal data in accordance with our Privacy Policy and applicable data protection laws. Your personal information is used solely for providing our services and improving your travel experience.',
      gradient: 'from-blue-500 to-blue-500',
    },
  ];

  const additionalTerms = [
    {
      icon: Award,
      title: 'Intellectual Property',
      content:
        'All content on our platform, including logos, text, images, and software, is owned by Trek Too LTD and protected by intellectual property laws. Unauthorized use is prohibited.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Lock,
      title: 'Third-Party Services',
      content:
        'Our platform may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of these third parties.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: AlertTriangle,
      title: 'Modifications to Terms',
      content:
        'We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of modified terms.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Scale,
      title: 'Governing Law',
      content:
        'These Terms and Conditions are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Mail,
      title: 'Contact Information',
      content:
        'If you have any questions about these Terms and Conditions, please contact us at info@trektoo.com or call our customer service at +44 7308 656687.',
      gradient: 'from-blue-500 to-blue-500',
    },
  ];

  return (
    <main className="relative min-h-screen bg-white">
      {/* Background Pattern - Matching Landing Page */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-terms"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#2196F3"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid-terms)" />
        </svg>
      </div>

      {/* Decorative Elements - Warm Vibe */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-pink-300/15 to-purple-400/15 rounded-full blur-lg"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-orange-300/10 to-yellow-400/10 rounded-full blur-md"></div>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* 1. HERO SECTION - Introduction (Matching Contact Page Style) */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="text-center mb-16"
            >
              <motion.div variants={itemVariants}>
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
                  style={{
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  Terms &{' '}
                  <span className="text-blue-600 relative">
                    Conditions
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
                </h1>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                  Please read these Terms and Conditions carefully before using Trektoo's services. Your use of our platform constitutes acceptance of these terms.
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* 2. AGREEMENT OVERVIEW - Company Information (Matching Contact Page Style) */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="text-center mb-16"
            >
              <motion.div variants={itemVariants}>
                <h2
                  className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
                  style={{
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  Agreement{' '}
                  <span className="text-emerald-600 relative">
                    Overview
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
                </h2>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                  Understanding the legal framework of our service agreement
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="max-w-4xl mx-auto px-4"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-300"
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0">
                      {React.createElement(FileText, { className: "w-6 h-6" })}
                    </div>
                    <h3
                      className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Legal Agreement
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      This agreement is between you and{' '}
                      <span className="font-bold text-blue-600">Trek Too LTD</span>,
                      a company registered in England and Wales (Company No: 15766570).
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      By using our travel booking platform and services, you agree to comply with and be bound by the following terms and conditions of use.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* 3. TERMS DETAILS - Core Information (Matching Contact Page Style) */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="text-center mb-16"
            >
              <motion.div variants={itemVariants}>
                <h2
                  className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
                  style={{
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  Terms{' '}
                  <span className="text-indigo-600 relative">
                    Details
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
                </h2>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                  Comprehensive information about our terms and conditions
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-4 px-4"
            >
              {termsSection.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${section.gradient} rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0`}
                        >
                          {React.createElement(IconComponent, { className: "w-6 h-6" })}
                        </div>
                        <h3
                          className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200"
                          style={{
                            fontFamily:
                              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          {section.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* 4. ADDITIONAL TERMS - Supporting Information (Matching Contact Page Style) */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="text-center mb-16"
            >
              <motion.div variants={itemVariants}>
                <h2
                  className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
                  style={{
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  Additional{' '}
                  <span className="text-purple-600 relative">
                    Terms
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
                </h2>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                  Important legal information and contact details
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-4 px-4"
            >
              {additionalTerms.map((term, index) => {
                const IconComponent = term.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${term.gradient} rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0`}
                        >
                          {React.createElement(IconComponent, { className: "w-6 h-6" })}
                        </div>
                        <h3
                          className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200"
                          style={{
                            fontFamily:
                              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          {term.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {term.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* 5. CONTACT SUPPORT - Legal Questions (Matching Contact Page Style) */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="text-center mb-16"
            >
              <motion.div variants={itemVariants}>
                <h2
                  className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
                  style={{
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  Legal{' '}
                  <span className="text-gray-700 relative">
                    Support
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
                </h2>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                  Get in touch with our legal team for any questions about these terms
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="max-w-2xl mx-auto px-4"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-300"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6 text-white shadow-sm">
                    {React.createElement(Mail, { className: "w-8 h-8" })}
                  </div>
                  <h3
                    className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-200"
                    style={{
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Legal Team Contact
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Contact our legal team for any questions about these Terms and Conditions
                  </p>
                  <div className="space-y-4">
                    <a
                      href="mailto:info@trektoo.com"
                      className="block text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      info@trektoo.com
                    </a>
                    <a
                      href="tel:+447308656687"
                      className="block text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      +44 7308 656687
                    </a>
                    <p className="text-sm text-gray-600">
                      We respond to all legal inquiries within 24 hours
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>


        </div>
      </motion.div>
    </main>
  );
};

export default TermsConditionsPage;
