'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Eye,
  Users,
  Lock,
  Globe,
  CheckCircle,
  Clock,
  Baby,
  Cookie,
  Link,
  Mail,
  Bell,
  AlertTriangle,
  FileText,
  Award,
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const router = useRouter();
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

  const privacySections = [
    {
      icon: Users,
      title: 'Information We Collect',
      content:
        'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes personal details like name, email, phone number, payment information, and travel preferences. We also automatically collect certain information about your device and usage of our services.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content:
        'We use your information to provide, maintain, and improve our services, process transactions, send you confirmations and updates, provide customer support, and communicate about promotions or new features. We may also use aggregated data for analytics and business insights.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Users,
      title: 'Information Sharing',
      content:
        'We share your information with service providers (hotels, airlines, insurance companies) necessary to fulfill your bookings, payment processors, and third-party vendors who assist our operations. We do not sell your personal information to third parties for marketing purposes.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Lock,
      title: 'Data Security',
      content:
        'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments. However, no method of transmission over the internet is 100% secure.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Globe,
      title: 'International Data Transfers',
      content:
        'As we operate globally, your information may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: CheckCircle,
      title: 'Your Rights and Choices',
      content:
        'You have the right to access, update, or delete your personal information. You can also opt out of marketing communications and request data portability. For EU residents, you have additional rights under GDPR including the right to object to processing and lodge complaints with supervisory authorities.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Clock,
      title: 'Data Retention',
      content:
        'We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Booking information is typically retained for 7 years for legal and tax purposes, while marketing preferences are kept until you opt out.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Baby,
      title: "Children's Privacy",
      content:
        'Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we discover we have collected information from a child under 16, we will delete such information promptly.',
      gradient: 'from-blue-500 to-blue-500',
    },
  ];

  const additionalSections = [
    {
      icon: Cookie,
      title: 'Cookies and Tracking Technologies',
      content:
        'We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Link,
      title: 'Third-Party Links and Services',
      content:
        'Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: Mail,
      title: 'Marketing Communications',
      content:
        'With your consent, we may send you promotional emails about our services, special offers, and travel tips. You can unsubscribe at any time by clicking the unsubscribe link in our emails or contacting us directly.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: AlertTriangle,
      title: 'Data Breach Notification',
      content:
        'In the event of a data breach that may pose a risk to your rights and freedoms, we will notify you and relevant authorities within 72 hours as required by applicable law. We will provide information about the nature of the breach and steps we are taking to address it.',
      gradient: 'from-blue-500 to-blue-500',
    },
    {
      icon: FileText,
      title: 'Updates to This Policy',
      content:
        'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and, where appropriate, by email.',
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
              id="grid-privacy"
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
          <rect width="100" height="100" fill="url(#grid-privacy)" />
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
                  Privacy{' '}
                  <span className="text-blue-600 relative">
                    Policy
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
                  Your privacy is important to us. This Privacy Policy explains how Trektoo collects, uses, and protects your personal information when you use our travel booking services.
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* 2. PRIVACY OVERVIEW - Company Commitment (Matching Contact Page Style) */}
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
                  Our{' '}
                  <span className="text-emerald-600 relative">
                    Commitment
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
                  Protecting your privacy is at the heart of everything we do
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
                      {React.createElement(Shield, { className: "w-6 h-6" })}
                    </div>
                    <h3
                      className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Privacy Protection Promise
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      <span className="font-bold text-blue-600">Trek Too LTD</span> (registered in England and Wales, Company No: 15766570) is committed to protecting and respecting your privacy.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      This policy sets out the basis on which any personal data we collect from you, or that you provide to us, will be processed by us in compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR).
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* 3. PRIVACY DETAILS - Core Information (Matching Contact Page Style) */}
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
                  Privacy{' '}
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
                  Comprehensive information about how we handle your data
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-4 px-4"
            >
              {privacySections.map((section, index) => {
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

          {/* 4. ADDITIONAL INFORMATION - Supporting Details (Matching Contact Page Style) */}
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
                    Information
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
                  Important details about cookies, third parties, and policy updates
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-4 px-4"
            >
              {additionalSections.map((section, index) => {
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

          {/* 5. CONTACT PRIVACY TEAM - Support (Matching Contact Page Style) */}
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
                  Privacy{' '}
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
                  Get in touch with our privacy team for any questions or concerns
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
                    Data Protection Team
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Contact our dedicated privacy team for any questions about your personal data
                  </p>
                  <div className="space-y-4">
                    <a
                      href="mailto:info@trektoo.com"
                      className="block text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      info@trektoo.com
                    </a>
                    <p className="text-sm text-gray-600">
                      We respond to all privacy inquiries within 24 hours
                    </p>
                    <button
                      onClick={() => router.push('/contact')}
                      className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-md hover:shadow-lg"
                    >
                      Contact Us
                    </button>
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

export default PrivacyPolicyPage;
