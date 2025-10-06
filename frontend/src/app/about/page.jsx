'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  MapPin,
  Users,
  Heart,
  Shield,
  Zap,
  Clock,
  Award,
  Globe,
  Star,
  CheckCircle,
  Compass,
  Target,
} from 'lucide-react';

const AboutUsPage = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Background Pattern - Matching Landing Page */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-about"
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
          <rect width="100" height="100" fill="url(#grid-about)" />
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
          {/* Hero Section - Matching Landing Page Style */}
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
                  About{' '}
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
                  We make travel dreams achievable. Founded in 2024 by a team that
              overcame financial barriers to explore the world, we're here to
              ensure you never face the same struggles.
                </p>
              </motion.div>
            </motion.div>

            {/* Stats Cards - Rich Design */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 px-4"
            >
              {[
                { 
                  icon: Globe, 
                  value: '50+', 
                  label: 'Destinations',
                  description: 'Amazing places to explore',
                  color: 'from-emerald-500 to-emerald-600'
                },
                { 
                  icon: Award, 
                  value: '24/7', 
                  label: 'Support',
                  description: 'Always here to help',
                  color: 'from-purple-500 to-purple-600'
                },
                { 
                  icon: Star, 
                  value: '2024', 
                  label: 'Founded',
                  description: 'Born from passion',
                  color: 'from-blue-500 to-blue-600'
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden transition-all duration-300 border border-gray-200 hover:border-blue-500"
                >
                  <div className="p-8 text-center">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-lg transition-all duration-300`}
                    >
                      <stat.icon className="w-10 h-10" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </div>
                    <div className="text-xl font-semibold text-gray-800 mb-2">
                    {stat.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Our Story Section - Rich Design */}
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
                  <span className="text-red-600 relative">
                    Story
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
                  Born from resilience, built for everyone
                </p>
            </motion.div>
          </motion.div>

          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Story Content */}
              <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg mr-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h3
                      className="text-2xl font-bold text-gray-900"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Born from Resilience
                    </h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mt-2"></div>
                  </div>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Trektoo emerged from personal hardship. When travel seemed
                impossible due to limited resources, we refused to give up. We
                built this platform to democratize travel — making it{' '}
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  accessible, transparent, and effortless
                </span>{' '}
                for everyone.
              </p>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
                  <div className="text-3xl font-bold text-red-600 mb-2">2024</div>
                  <div className="text-lg text-gray-600 font-medium">Founded with a Vision</div>
                </div>
          </motion.div>

              {/* Story Visual */}
              <motion.div variants={itemVariants} className="relative">
                <div className="relative bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 rounded-3xl p-8 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Heart className="h-16 w-16 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Passion-Driven</h4>
                    <p className="text-gray-600">Built by travelers, for travelers</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Mission & Vision - Rich Design */}
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
                  Mission &{' '}
                  <span className="text-emerald-600 relative">
                    Vision
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
                  Driving our commitment to exceptional travel experiences
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-2 gap-6 px-4"
            >
              {[
                {
                  icon: Target,
                title: 'Our Mission',
                content:
                  'Simplify travel planning with budget-friendly options and total pricing transparency.',
                gradient: 'from-blue-500 to-cyan-500',
                  features: ['Budget-friendly options', 'Transparent pricing', 'Easy planning']
              },
              {
                  icon: Compass,
                title: 'Our Vision',
                content:
                  'To be the first choice for seamless travel experiences across the Arab world.',
                gradient: 'from-indigo-500 to-purple-500',
                  features: ['Regional leader', 'Seamless experiences', 'Trusted choice']
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                  variants={itemVariants}
                whileHover={{ scale: 1.02, y: -3 }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden transition-all duration-300 border border-gray-200 hover:border-blue-500"
                >
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div
                        className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-lg transition-all duration-300`}
                      >
                        <item.icon className="w-10 h-10" />
                      </div>
                      <h3
                        className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-200"
                        style={{
                          fontFamily:
                            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                    {item.title}
                  </h3>
                      <p className="text-gray-600 leading-relaxed text-base mb-6">
                    {item.content}
                  </p>
                    </div>
                    
                    <div className="space-y-3">
                      {item.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-gray-600">
                          <div className={`w-2 h-2 bg-gradient-to-r ${item.gradient} rounded-full`}></div>
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          </section>

          {/* Core Values - Rich Design */}
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
                  Core{' '}
                  <span className="text-emerald-600 relative">
                    Values
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
                  The principles that guide everything we do
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
            >
              {[
                {
                  title: 'Perseverance',
                  desc: 'We conquer obstacles to serve you better.',
                  icon: Shield,
                  color: 'from-blue-500 to-blue-600',
                  bg: 'from-blue-50 to-blue-100'
                },
                {
                  title: 'Transparency',
                  desc: 'No hidden fees. No surprises.',
                  icon: CheckCircle,
                  color: 'from-emerald-500 to-emerald-600',
                  bg: 'from-emerald-50 to-emerald-100'
                },
                {
                  title: 'Human-Centered',
                  desc: "You're our priority, not a transaction.",
                  icon: Heart,
                  color: 'from-purple-500 to-purple-600',
                  bg: 'from-purple-50 to-purple-100'
                },
                {
                  title: 'Integrity',
                  desc: 'Honest recommendations, accountable service.',
                  icon: Award,
                  color: 'from-orange-500 to-orange-600',
                  bg: 'from-orange-50 to-orange-100'
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden transition-all duration-300 border border-gray-200 hover:border-blue-500"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative p-6 text-center">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-lg transition-all duration-300`}
                    >
                      <value.icon className="w-10 h-10" />
                    </div>
                    <h4
                      className="font-bold text-xl text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      {value.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {value.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>


          {/* Enhanced Journey Section */}
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
                  <span className="text-purple-600 relative">
                    Journey
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
                  From a crazy idea to revolutionizing travel
                </p>
              </motion.div>
            </motion.div>

            {/* Enhanced Journey Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
            >
              {[
                {
                  phase: 'Step 1',
                  year: '2024',
                  title: 'The Idea 💡',
                  description: 'The idea of Trektoo came into my mind. A vision to make travel accessible and effortless for everyone.',
                  details: ['Initial concept development', 'Market research', 'Planning the platform structure'],
                  color: 'from-blue-500 to-blue-600',
                  bgColor: 'from-blue-50 to-blue-100',
                  icon: '💡',
                  progress: '15%'
                },
                {
                  phase: 'Step 2',
                  year: '2024',
                  title: 'Company Registration 🏢',
                  description: 'Officially registered Trektoo as a company and started building the foundation for our travel platform.',
                  details: ['Legal registration', 'Team formation', 'Initial funding'],
                  color: 'from-purple-500 to-purple-600',
                  bgColor: 'from-purple-50 to-purple-100',
                  icon: '🏢',
                  progress: '30%'
                },
                {
                  phase: 'Step 3',
                  year: '2025',
                  title: 'Activities Launch 🎯',
                  description: 'Started with activities booking - our first service to help travelers discover amazing experiences.',
                  details: ['Activities integration', 'Partner agreements', 'User interface development'],
                  color: 'from-green-500 to-green-600',
                  bgColor: 'from-green-50 to-green-100',
                  icon: '🎯',
                  progress: '60%'
                },
                {
                  phase: 'Step 4',
                  year: '2025',
                  title: 'Car Rentals 🚗',
                  description: 'Next step: Adding car rental services to provide complete transportation solutions for travelers.',
                  details: ['Car rental partnerships', 'Booking system integration', 'Fleet management'],
                  color: 'from-orange-500 to-orange-600',
                  bgColor: 'from-orange-50 to-orange-100',
                  icon: '🚗',
                  progress: '80%'
                },
                {
                  phase: 'Step 5',
                  year: '2025',
                  title: 'Hotel Booking 🏨',
                  description: 'Final milestone: Hotel booking integration to offer complete travel planning in one platform.',
                  details: ['Hotel partnerships', 'Room availability system', 'Complete travel packages'],
                  color: 'from-indigo-500 to-indigo-600',
                  bgColor: 'from-indigo-50 to-indigo-100',
                  icon: '🏨',
                  progress: '100%'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden transition-all duration-300 border border-gray-200 hover:border-blue-500"
                >
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: item.progress }}
                      transition={{ duration: 1.5, delay: index * 0.2 }}
                    />
                  </div>
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-500">{item.phase}</div>
                          <div className="text-lg font-bold text-gray-900">{item.year}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${item.color} text-white`}>
                        {item.progress}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2">
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className={`w-1.5 h-1.5 bg-gradient-to-r ${item.color} rounded-full`}></div>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                </motion.div>
              ))}
            </motion.div>

            {/* Journey Summary */}
            <motion.div
              variants={itemVariants}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
                <div className="text-6xl mb-4">
                  🎯
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  The Journey Continues...
                </h3>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Every day brings new challenges, new opportunities, and new ways to make travel 
                  more accessible and enjoyable for everyone. We're not just building a platform – 
                  we're building a community of dreamers and adventurers.
                </p>
              </div>
            </motion.div>
          </section>

          {/* Fun Stats with Animations */}
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
                  We're{' '}
                  <span className="text-green-600 relative">
                    Crushing It!
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
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { emoji: '🏆', number: '98%', label: 'Success Rate', color: 'from-yellow-400 to-yellow-600' },
                { emoji: '⚡', number: '<2s', label: 'Loading Time', color: 'from-blue-400 to-blue-600' },
                { emoji: '🎯', number: '99.9%', label: 'Uptime', color: 'from-green-400 to-green-600' },
                { emoji: '🔥', number: '24/7', label: 'Support', color: 'from-red-400 to-red-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="text-center group"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                    className="text-6xl mb-4"
                  >
                    {stat.emoji}
                  </motion.div>
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </section>

        </div>
      </motion.div>
    </main>
  );
};

export default AboutUsPage;
