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
          {/* 1. HERO SECTION - Introduction */}
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

          </section>

          {/* 2. WHY CHOOSE TREKTOO - Value Proposition Early (Best Practice: Airbnb, Stripe) */}
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
                  Why Choose{' '}
                  <span className="text-blue-600 relative">
                    Trektoo?
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
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium mb-12">
                  We're not just another travel agency. Here's what makes us different
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={itemVariants}>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium">
                  We're not just another travel agency. Born from real travel struggles, we understand the barriers that prevent people from exploring the world. With transparent pricing, budget-conscious deals, and dedicated customer care, we make travel accessible and effortless for everyone.
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* 3. MISSION & VISION - Core Purpose (Best Practice: Booking.com) */}
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
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={itemVariants} className="space-y-8">
                <div>
                  <h3
                    className="text-3xl font-bold text-gray-900 mb-4"
                    style={{
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Our Mission
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    To simplify travel planning with budget-friendly options and complete pricing transparency, making world-class adventures accessible to everyone regardless of their financial situation.
                  </p>
                </div>
                
                <div>
                  <h3
                    className="text-3xl font-bold text-gray-900 mb-4"
                    style={{
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Our Vision
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    To become the leading choice for seamless travel experiences across the world and beyond, building a community where every traveler can turn their dreams into reality.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* 4. OUR STORY - Brand Narrative (Best Practice: Airbnb) */}
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
                  <div className="bg-blue-500 p-4 rounded-2xl shadow-lg mr-6">
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
                <div className="relative flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-48 h-48 flex items-center justify-center mx-auto mb-6">
                      <img 
                        src="/images/logo.png" 
                        alt="Trektoo Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Trektoo</h4>
                    <p className="text-gray-600">Built by travelers, for travelers</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* 5. CORE VALUES - Principles (Best Practice: Shopify, Stripe) */}
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
                    color: 'from-blue-500 to-blue-500',
                  bg: 'from-blue-50 to-blue-100'
                  },
                  {
                    title: 'Transparency',
                    desc: 'No hidden fees. No surprises.',
                  icon: CheckCircle,
                    color: 'from-blue-500 to-blue-500',
                  bg: 'from-blue-50 to-blue-100'
                  },
                  {
                    title: 'Human-Centered',
                    desc: "You're our priority, not a transaction.",
                  icon: Heart,
                    color: 'from-blue-500 to-blue-500',
                  bg: 'from-blue-50 to-blue-100'
                  },
                  {
                    title: 'Integrity',
                    desc: 'Honest recommendations, accountable service.',
                  icon: Award,
                    color: 'from-blue-500 to-blue-500',
                  bg: 'from-blue-50 to-blue-100'
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


          {/* 6. OUR JOURNEY - Timeline (Best Practice: Company storytelling) */}
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
                  title: 'The Idea',
                  description: 'The idea of Trektoo came into my mind. A vision to make travel accessible and effortless for everyone.',
                  details: ['Initial concept development', 'Market research', 'Planning the platform structure'],
                  color: 'from-blue-500 to-blue-500',
                  bgColor: 'from-blue-50 to-blue-100',
                  icon: '💡',
                  progress: '15%'
                },
                {
                  phase: 'Step 2',
                  year: '2024',
                  title: 'Company Registration',
                  description: 'Officially registered Trektoo as a company and started building the foundation for our travel platform.',
                  details: ['Legal registration', 'Team formation', 'Initial funding'],
                  color: 'from-blue-500 to-blue-500',
                  bgColor: 'from-blue-50 to-blue-100',
                  icon: '📋',
                  progress: '30%'
                },
                {
                  phase: 'Step 3',
                  year: '2025',
                  title: 'Activities Launch',
                  description: 'Started with activities booking - our first service to help travelers discover amazing experiences.',
                  details: ['Activities integration', 'Partner agreements', 'User interface development'],
                  color: 'from-blue-500 to-blue-500',
                  bgColor: 'from-blue-50 to-blue-100',
                  icon: '🎫',
                  progress: '60%'
                },
                {
                  phase: 'Step 4',
                  year: '2025',
                  title: 'Car Rentals',
                  description: 'Next step: Adding car rental services to provide complete transportation solutions for travelers.',
                  details: ['Car rental partnerships', 'Booking system integration', 'Fleet management'],
                  color: 'from-blue-500 to-blue-500',
                  bgColor: 'from-blue-50 to-blue-100',
                  icon: '🚙',
                  progress: '80%'
                },
                {
                  phase: 'Step 5',
                  year: '2025',
                  title: 'Hotel Booking',
                  description: 'Final milestone: Hotel booking integration to offer complete travel planning in one platform.',
                  details: ['Hotel partnerships', 'Room availability system', 'Complete travel packages'],
                  color: 'from-blue-500 to-blue-500',
                  bgColor: 'from-blue-50 to-blue-100',
                  icon: '🏨',
                  progress: '100%'
                }
              ].map((item, index) => (
                  <motion.div
                    key={index}
                  variants={itemVariants}
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


        </div>
      </motion.div>
    </main>
  );
};

export default AboutUsPage;
