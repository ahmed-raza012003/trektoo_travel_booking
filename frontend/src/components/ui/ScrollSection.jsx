'use client';

import React, { useEffect, useRef, forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollSection Component
 * A wrapper component that registers itself with the scroll flow and provides smooth animations
 */
const ScrollSection = forwardRef(({ 
  id, 
  children, 
  className = "",
  variant = "default",
  delay = 0,
  ...props 
}, ref) => {
  const sectionRef = useRef(null);
  const combinedRef = ref || sectionRef;

  // Animation variants based on the variant prop
  const variants = {
    default: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      }
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      }
    },
    slideRight: {
      hidden: { opacity: 0, x: -50 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      }
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" }
      }
    }
  };

  return (
    <motion.section
      ref={combinedRef}
      id={id}
      className={`scroll-section ${className}`}
      variants={variants[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.section>
  );
});

ScrollSection.displayName = 'ScrollSection';

/**
 * ScrollTrigger Component
 * Triggers scroll to next section when element comes into view
 */
export const ScrollTrigger = ({ 
  onTrigger, 
  threshold = 0.8,
  children,
  className = "" 
}) => {
  const triggerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            onTrigger?.();
          }
        });
      },
      { threshold }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current);
      }
    };
  }, [onTrigger, threshold]);

  return (
    <div ref={triggerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * ScrollToTop Component
 * Smooth scroll to top functionality
 */
export const ScrollToTop = ({ 
  showAfter = 300,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className={`
            fixed bottom-6 left-6 z-50
            bg-gray-800 hover:bg-gray-900 text-white
            p-3 rounded-full shadow-lg hover:shadow-xl
            transition-all duration-300 ease-in-out
            ${className}
          `}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </>
  );
};

export default ScrollSection;

