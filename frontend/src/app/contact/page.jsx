'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Music,
  MapPin,
  Clock,
  Users,
  Globe,
  Star,
  Zap,
  Shield,
  Heart,
  Award,
  CheckCircle,
  Youtube,
  Linkedin,
  Camera,
} from 'lucide-react';

const ContactUsPage = () => {
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


  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Center',
      value: '01063425677',
      description: 'General inquiries and bookings',
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'from-green-600 to-emerald-700',
    },
    {
      icon: Users,
      title: 'Sales Department',
      value: '01092606758',
      description: 'Travel packages and special offers',
      gradient: 'from-blue-500 to-cyan-600',
      hoverGradient: 'from-blue-600 to-cyan-700',
    },
    {
      icon: MessageCircle,
      title: 'Support',
      value: '0155 829 8719',
      description: 'Technical support and assistance',
      gradient: 'from-purple-500 to-violet-600',
      hoverGradient: 'from-purple-600 to-violet-700',
    },
    {
      icon: Globe,
      title: 'UK Office',
      value: '+44 7308 656687',
      description: 'International support',
      gradient: 'from-red-500 to-rose-600',
      hoverGradient: 'from-red-600 to-rose-700',
    },
  ];

  const emailContacts = [
    {
      icon: Zap,
      title: 'Sales',
      value: 'sales@trektoo.com',
      description: 'For booking and sales inquiries',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: Shield,
      title: 'Support',
      value: 'support@trek-too.com',
      description: 'For technical support and help',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Star,
      title: 'Information',
      value: 'Info@trektoo.com',
      description: 'For company information',
      gradient: 'from-yellow-500 to-orange-600',
    },
  ];

  const socialMedia = [
    {
      icon: Facebook,
      title: 'Facebook',
      url: 'https://www.facebook.com/trektoo2000',
      description: 'Follow us for updates and travel tips',
      gradient: 'from-blue-600 to-blue-700',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      url: 'https://www.instagram.com/trek_too?igsh=MTJ5NmY2YmI2OXdtOQ==',
      description: 'Travel inspiration and behind-the-scenes',
      gradient: 'from-pink-500 to-purple-600',
    },
    {
      icon: Music,
      title: 'TikTok',
      url: 'https://www.tiktok.com/@trektoo?_t=ZS-8yK2lqloH4r&_r=1',
      description: 'Quick travel tips and fun content',
      gradient: 'from-gray-800 to-black',
    },
    {
      icon: Youtube,
      title: 'YouTube',
      url: 'https://www.youtube.com/@trektoo',
      description: 'Travel vlogs and destination guides',
      gradient: 'from-red-500 to-red-600',
    },
    {
      icon: Linkedin,
      title: 'LinkedIn',
      url: 'https://www.linkedin.com/company/trektoo',
      description: 'Professional updates and business insights',
      gradient: 'from-blue-700 to-blue-800',
    },
    {
      icon: Camera,
      title: 'Snapchat',
      url: 'https://www.snapchat.com/add/trektoo',
      description: 'Real-time travel moments and stories',
      gradient: 'from-yellow-500 to-yellow-600',
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
              id="grid-contact"
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
          <rect width="100" height="100" fill="url(#grid-contact)" />
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
                  Contact{' '}
                  <span className="text-blue-600 relative">
                    Trektoo
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
                  We're here to help make your travel dreams come true. Reach out to us through any of the channels below and our team will assist you promptly.
                </p>
              </motion.div>
          </motion.div>

          </section>

          {/* Phone Contacts - Rich Design */}
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
                  Phone{' '}
                  <span className="text-emerald-600 relative">
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
                  Get in touch with our specialized teams for all your travel needs
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-4 px-4"
            >
                {contactMethods.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <motion.div
                      key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${contact.gradient} rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-200"
                            style={{
                              fontFamily:
                                "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            }}
                          >
                            {contact.title}
                          </h3>
                        <a
                          href={`tel:${contact.value}`}
                            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors block mb-1"
                        >
                          {contact.value}
                        </a>
                          <p className="text-sm text-gray-600">
                          {contact.description}
                        </p>
                        </div>
                      </div>
                      </div>
                    </motion.div>
                  );
                })}
          </motion.div>
          </section>

          {/* Email Contacts - Rich Design */}
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
                  Email{' '}
                  <span className="text-indigo-600 relative">
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
                  Send us an email and we'll get back to you within 24 hours
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-4 px-4"
            >
                {emailContacts.map((email, index) => (
                  <motion.div
                    key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-300"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${email.gradient} rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0`}
                      >
                        <email.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-200"
                          style={{
                            fontFamily:
                              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          {email.title}
                        </h3>
                      <a
                        href={`mailto:${email.value}`}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors block mb-1 break-all"
                      >
                        {email.value}
                      </a>
                        <p className="text-sm text-gray-600">
                        {email.description}
                      </p>
                      </div>
                    </div>
                    </div>
                  </motion.div>
                ))}
          </motion.div>
          </section>

          {/* Social Media - Rich Design */}
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
                  Follow Us on{' '}
                  <span className="text-pink-600 relative">
                    Social Media
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
                  Stay connected and get the latest travel inspiration and updates
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="flex flex-wrap justify-center gap-4 px-4"
            >
                {socialMedia.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-pink-300 block"
                  >
                    <div className="p-6 text-center">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${social.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-sm group-hover:shadow-md transition-all duration-300`}
                      >
                        <IconComponent className="w-6 h-6" />
                        </div>
                      <h3
                        className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors duration-200"
                        style={{
                          fontFamily:
                            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                          {social.title}
                        </h3>
                      <p className="text-sm text-gray-600">
                          {social.description}
                        </p>
                      </div>
                    </motion.a>
                  );
                })}
            </motion.div>
          </section>

          {/* Company Information - Rich Design */}
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
                  Company{' '}
                  <span className="text-gray-700 relative">
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
                  Trusted and registered travel company serving travelers worldwide
                </p>
              </motion.div>
          </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="max-w-2xl mx-auto"
            >
          <motion.div
            variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-blue-300"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-center mx-auto mb-6 text-white shadow-sm">
                    <Shield className="w-8 h-8" />
                </div>
                  <h3
                    className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-200"
                    style={{
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Trusted Travel Partner
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      "Trek Too"
                    </span>{' '}
                    is a brand of{' '}
                    <span className="font-bold text-gray-900">
                      "TREK TOO LTD"
                    </span>
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Registration Details</span>
                    </div>
                    <p className="text-gray-700 font-medium text-sm">
                      Registered in England and Wales No:{' '}
                      <span className="font-bold text-blue-600 text-lg">
                        15766570
                      </span>
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

export default ContactUsPage;
