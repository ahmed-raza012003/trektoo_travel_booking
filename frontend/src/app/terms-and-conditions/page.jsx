'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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
      icon: '📋',
      title: '1. Acceptance of Terms',
      content:
        "By accessing and using Trektoo's services, you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions constitute the entire agreement between you and Trek Too LTD.",
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: '👥',
      title: '2. Use of Services',
      content:
        'Our platform provides travel booking services including flights, hotels, and travel insurance. You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for ensuring the accuracy of all information provided during booking.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: '🔐',
      title: '3. User Accounts',
      content:
        'To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: '🌐',
      title: '4. Booking and Payment',
      content:
        'All bookings are subject to availability and confirmation. Prices may change without notice until booking is confirmed. Payment must be made in full at the time of booking. We accept various payment methods as displayed on our platform.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: '💰',
      title: '5. Cancellation and Refunds',
      content:
        'Cancellation policies vary by service provider and booking type. Refund eligibility depends on the specific terms of your booking. Processing fees may apply to cancellations. Please review individual booking terms before confirming your reservation.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: '⚖️',
      title: '6. Limitation of Liability',
      content:
        'Trek Too LTD acts as an intermediary between you and service providers. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of our services or any travel-related issues beyond our control.',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: '🕐',
      title: '7. Force Majeure',
      content:
        'We are not responsible for any failure to perform our obligations due to circumstances beyond our reasonable control, including but not limited to natural disasters, government actions, strikes, or other unforeseeable events.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: '✓',
      title: '8. Privacy and Data Protection',
      content:
        'We collect and process personal data in accordance with our Privacy Policy and applicable data protection laws. Your personal information is used solely for providing our services and improving your travel experience.',
      color: 'from-green-500 to-green-600',
    },
  ];

  const additionalTerms = [
    {
      title: 'Intellectual Property',
      content:
        'All content on our platform, including logos, text, images, and software, is owned by Trek Too LTD and protected by intellectual property laws. Unauthorized use is prohibited.',
    },
    {
      title: 'Third-Party Services',
      content:
        'Our platform may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of these third parties.',
    },
    {
      title: 'Modifications to Terms',
      content:
        'We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of modified terms.',
    },
    {
      title: 'Governing Law',
      content:
        'These Terms and Conditions are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
    },
    {
      title: 'Contact Information',
      content:
        'If you have any questions about these Terms and Conditions, please contact us at info@trektoo.com or call our customer service at +44 7308 656687.',
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
          {/* Hero Section - Matching About Page Style */}
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

          {/* Agreement Overview Section */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="max-w-4xl mx-auto"
            >
              <motion.div
                variants={itemVariants}
                className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl group-hover:opacity-10 transition-all duration-300"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">📋</div>
                    <h2
                      className="text-3xl font-bold text-gray-900"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Agreement Overview
                    </h2>
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

          {/* Main Terms Sections */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4"
            >
            {termsSection.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl group-hover:opacity-10 transition-all duration-300"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{section.icon}</div>
                    <h3
                      className="text-lg font-bold text-gray-900"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}
            </motion.div>
          </section>

          {/* Additional Terms Section */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="max-w-6xl mx-auto"
            >
              <motion.div
                variants={itemVariants}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="text-4xl mr-4">🛡️</div>
                  <h2
                    className="text-4xl font-bold text-gray-900"
                    style={{
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Additional Terms
                  </h2>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
              >
                {additionalTerms.map((term, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl group-hover:opacity-10 transition-all duration-300"></div>
                    <div className="relative">
                      <h4
                        className="text-lg font-bold text-gray-900 mb-3"
                        style={{
                          fontFamily:
                            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                        {term.title}
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {term.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
          </motion.div>
          </section>


        </div>
      </motion.div>
    </main>
  );
};

export default TermsConditionsPage;
