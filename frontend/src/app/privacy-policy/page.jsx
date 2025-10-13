'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
      icon: '📊',
      title: '1. Information We Collect',
      content:
        'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes personal details like name, email, phone number, payment information, and travel preferences. We also automatically collect certain information about your device and usage of our services.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: '👁️',
      title: '2. How We Use Your Information',
      content:
        'We use your information to provide, maintain, and improve our services, process transactions, send you confirmations and updates, provide customer support, and communicate about promotions or new features. We may also use aggregated data for analytics and business insights.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: '👥',
      title: '3. Information Sharing',
      content:
        'We share your information with service providers (hotels, airlines, insurance companies) necessary to fulfill your bookings, payment processors, and third-party vendors who assist our operations. We do not sell your personal information to third parties for marketing purposes.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: '🔒',
      title: '4. Data Security',
      content:
        'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments. However, no method of transmission over the internet is 100% secure.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: '🌐',
      title: '5. International Data Transfers',
      content:
        'As we operate globally, your information may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: '✓',
      title: '6. Your Rights and Choices',
      content:
        'You have the right to access, update, or delete your personal information. You can also opt out of marketing communications and request data portability. For EU residents, you have additional rights under GDPR including the right to object to processing and lodge complaints with supervisory authorities.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: '🕐',
      title: '7. Data Retention',
      content:
        'We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Booking information is typically retained for 7 years for legal and tax purposes, while marketing preferences are kept until you opt out.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: '👶',
      title: "8. Children's Privacy",
      content:
        'Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we discover we have collected information from a child under 16, we will delete such information promptly.',
      color: 'from-red-500 to-red-600',
    },
  ];

  const additionalSections = [
    {
      title: 'Cookies and Tracking Technologies',
      content:
        'We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.',
    },
    {
      title: 'Third-Party Links and Services',
      content:
        'Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.',
    },
    {
      title: 'Marketing Communications',
      content:
        'With your consent, we may send you promotional emails about our services, special offers, and travel tips. You can unsubscribe at any time by clicking the unsubscribe link in our emails or contacting us directly.',
    },
    {
      title: 'Data Breach Notification',
      content:
        'In the event of a data breach that may pose a risk to your rights and freedoms, we will notify you and relevant authorities within 72 hours as required by applicable law. We will provide information about the nature of the breach and steps we are taking to address it.',
    },
    {
      title: 'Updates to This Policy',
      content:
        'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and, where appropriate, by email.',
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

          {/* Privacy Overview Section */}
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
                    <div className="text-4xl mr-4">🛡️</div>
                    <h2
                      className="text-3xl font-bold text-gray-900"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Our Commitment to Your Privacy
                    </h2>
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

          {/* Main Privacy Sections */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4"
            >
              {privacySections.map((section, index) => (
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

          {/* Additional Privacy Information */}
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
                  <div className="text-4xl mr-4">📋</div>
                  <h2
                    className="text-4xl font-bold text-gray-900"
                    style={{
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Additional Privacy Information
                  </h2>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
              >
                {additionalSections.map((section, index) => (
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
                        {section.title}
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </section>

          {/* Contact Information */}
          <section className="py-20 relative overflow-hidden">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                variants={itemVariants}
                className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-3xl group-hover:opacity-10 transition-all duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-center mb-6">
                    <div className="text-4xl mr-4">📧</div>
                    <h2
                      className="text-3xl font-bold text-gray-900"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Questions About Your Privacy?
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    Contact our Data Protection Officer for privacy-related inquiries
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button
                      onClick={() => window.open('mailto:info@trektoo.com', '_self')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-xl px-6 py-3 font-semibold shadow-md hover:shadow-lg"
                    >
                      📧 Email Privacy Team
                    </Button>
                    <Button
                      onClick={() => router.push('/contact')}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 rounded-xl px-6 py-3 font-semibold shadow-md hover:shadow-lg"
                    >
                      Contact Us
                    </Button>
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
