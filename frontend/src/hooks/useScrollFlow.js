'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing smooth scroll flow between sections
 * Provides scroll-to-section functionality with smooth animations
 */
export const useScrollFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [sections, setSections] = useState([]);
  const sectionRefs = useRef({});
  const scrollTimeoutRef = useRef(null);

  // Register a section with the scroll flow
  const registerSection = useCallback((id, element) => {
    if (element) {
      sectionRefs.current[id] = element;
      setSections(prev => {
        const newSections = [...prev];
        const existingIndex = newSections.findIndex(section => section.id === id);
        if (existingIndex >= 0) {
          newSections[existingIndex] = { id, element };
        } else {
          newSections.push({ id, element });
        }
        return newSections.sort((a, b) => {
          const aRect = a.element.getBoundingClientRect();
          const bRect = b.element.getBoundingClientRect();
          return aRect.top - bRect.top;
        });
      });
    }
  }, []);

  // Scroll to a specific section
  const scrollToSection = useCallback((sectionId, options = {}) => {
    const element = sectionRefs.current[sectionId];
    if (!element) return;

    setIsScrolling(true);
    
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    };

    element.scrollIntoView(defaultOptions);

    // Update current step based on section order
    const sectionIndex = sections.findIndex(section => section.id === sectionId);
    if (sectionIndex >= 0) {
      setCurrentStep(sectionIndex);
    }

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to mark scrolling as complete
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, [sections]);

  // Scroll to next section
  const scrollToNext = useCallback(() => {
    const nextIndex = currentStep + 1;
    if (nextIndex < sections.length) {
      const nextSection = sections[nextIndex];
      scrollToSection(nextSection.id);
    }
  }, [currentStep, sections, scrollToSection]);

  // Scroll to previous section
  const scrollToPrevious = useCallback(() => {
    const prevIndex = currentStep - 1;
    if (prevIndex >= 0) {
      const prevSection = sections[prevIndex];
      scrollToSection(prevSection.id);
    }
  }, [currentStep, sections, scrollToSection]);

  // Auto-scroll based on user scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Find the section that's most visible
      let mostVisibleIndex = 0;
      let maxVisibility = 0;

      sections.forEach((section, index) => {
        const rect = section.element.getBoundingClientRect();
        const visibility = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleIndex = index;
        }
      });

      if (mostVisibleIndex !== currentStep) {
        setCurrentStep(mostVisibleIndex);
      }
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [sections, currentStep, isScrolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentStep,
    isScrolling,
    sections,
    registerSection,
    scrollToSection,
    scrollToNext,
    scrollToPrevious,
    canGoNext: currentStep < sections.length - 1,
    canGoPrevious: currentStep > 0,
    progress: sections.length > 0 ? (currentStep + 1) / sections.length : 0
  };
};

// Throttle function for performance
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

