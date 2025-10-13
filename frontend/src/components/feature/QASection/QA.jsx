'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const VideoSection = () => {
  return (
    <motion.div
      className="relative w-full pt-[55%] rounded-3xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)",
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      {/* Video */}
      <video
        className="absolute top-0 left-0 w-full h-full rounded-3xl object-cover"
        src="/images/banner.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
};

const AdventureVideoSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.3 },
    },
  };

  // Enhanced floating box config with blue and purple colors only
  const floatingBoxes = [
    { size: 20, color: "bg-blue-500/30", duration: 8, delay: 0, left: 8 },
    { size: 24, color: "bg-indigo-500/25", duration: 10, delay: 2, left: 18 },
    { size: 16, color: "bg-purple-500/35", duration: 7, delay: 1, left: 28 },
    { size: 28, color: "bg-blue-400/20", duration: 12, delay: 3, left: 38 },
    { size: 18, color: "bg-indigo-400/30", duration: 9, delay: 1.5, left: 48 },
    { size: 22, color: "bg-purple-400/25", duration: 11, delay: 2.5, left: 58 },
    { size: 14, color: "bg-blue-300/35", duration: 6, delay: 4, left: 68 },
    { size: 26, color: "bg-blue-600/20", duration: 13, delay: 0.8, left: 78 },
    { size: 20, color: "bg-violet-500/30", duration: 8.5, delay: 3.2, left: 88 },
  ];

  return (
    <motion.section
      ref={ref}
      className="py-12 md:py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden min-h-screen"
      variants={sectionVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {/* Enhanced floating animated shapes (desktop only) */}
      <div className="absolute inset-0 hidden md:block pointer-events-none">
        {floatingBoxes.map((box, idx) => (
          <motion.div
            key={idx}
            className={`absolute ${box.color} rounded-2xl shadow-lg`}
            style={{
              width: `${box.size}px`,
              height: `${box.size}px`,
              left: `${box.left}%`,
              bottom: '-50px', // Start below the viewport
            }}
            animate={{ 
              y: [0, -window.innerHeight - 100], // Move from bottom to completely off-screen at top
              opacity: [0, 0.8, 0.8, 0],
              rotate: [0, 360],
              scale: [0.8, 1, 1, 0.8]
            }}
            transition={{
              duration: box.duration,
              repeat: Infinity,
              ease: "linear",
              delay: box.delay,
              times: [0, 0.1, 0.9, 1] // Opacity timing: fade in quick, stay visible, fade out quick
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <motion.div className="text-center mb-10 md:mb-16">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
            style={{
              fontFamily:
                "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            Step Into{' '}
            <span className="text-blue-600 relative">
              Adventure
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

        {/* Video */}
        <motion.div className="max-w-4xl mx-auto">
          <VideoSection />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AdventureVideoSection;