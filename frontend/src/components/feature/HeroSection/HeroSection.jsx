'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import HeroContent from './HeroContent';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px',
  });

  // Premium hero background images
  const backgroundImages = [
    {
      url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=90",
      alt: "Majestic mountain landscape with crystal clear lake"
    },
    {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=90", 
      alt: "Luxury resort pool with tropical paradise view"
    },
    {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=90",
      alt: "Pristine tropical beach with turquoise waters"
    },
    
  ];

  // Auto-carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); // Changes every 6 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Carousel Container */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-2000 ease-in-out transform ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-110'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            
            {/* Dynamic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          </div>
        ))}
      </div>

      {/* Ultra-Premium Glossy Glass Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.08]" />
      
      {/* Premium Glass Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-white/[0.10] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.03] to-white/[0.05] pointer-events-none" />

      {/* Floating Glossy Orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse opacity-60" />
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000 opacity-60" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-400/15 rounded-full blur-2xl animate-pulse delay-500 opacity-40" />

      {/* Premium Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="premium-grid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="4"
                cy="4"
                r="0.5"
                fill="white"
                opacity="0.3"
              />
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="white"
                strokeWidth="0.3"
                opacity="0.2"
              />
            </pattern>
            
            <radialGradient id="shine-gradient" cx="50%" cy="30%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#premium-grid)" />
          <rect width="100" height="100" fill="url(#shine-gradient)" />
        </svg>
      </div>

      {/* Elegant Top Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      
      {/* Premium Content Container */}
      <div className="relative z-20 min-h-screen pt-24 md:pt-28 lg:pt-32 xl:pt-36">
        {/* Subtle Content Backdrop - reduced blur */}
        <div className="absolute inset-x-0 top-24 bottom-0 bg-gradient-to-b from-black/[0.25] via-black/[0.15] to-black/[0.35] pointer-events-none" />
        
        <div className="relative z-30 container mx-auto px-4 pb-16">
          <div className="max-w-6xl mx-auto text-center">
            <HeroContent />
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-500 backdrop-blur-md border border-white/30 ${
              index === currentSlide
                ? 'bg-white/80 shadow-lg shadow-white/30 scale-110'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Premium Floating Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-white/20 to-blue-300/20 rounded-full blur-2xl animate-pulse opacity-60" />
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-purple-300/15 to-pink-300/15 rounded-full blur-2xl animate-pulse delay-1000 opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-xl animate-pulse delay-700 opacity-40" />

      {/* Edge Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

      {/* Ultra-Premium Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      
      {/* Glossy Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </section>
  );
};

export default HeroSection;