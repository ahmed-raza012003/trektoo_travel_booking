import { useState, useEffect, useCallback } from 'react';
import API_BASE from '@/lib/api/klookApi';

// Cache key for localStorage
const CACHE_KEY = 'activity_images_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Custom hook to fetch and manage activity images
 * @param {Array} activities - Array of activities to fetch images for
 * @returns {Object} - { activityImages, loadingImages, errorImages, fetchImageForActivity }
 */
export const useActivityImages = (activities = []) => {
  const [activityImages, setActivityImages] = useState(new Map());
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [errorImages, setErrorImages] = useState(new Set());

  // Load cached images from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_EXPIRY) {
          setActivityImages(new Map(data));
        } else {
          // Cache expired, clear it
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load cached activity images:', error);
      localStorage.removeItem(CACHE_KEY);
    }
  }, []);

  // Save images to localStorage when they change
  useEffect(() => {
    if (activityImages.size > 0) {
      try {
        const cacheData = {
          data: Array.from(activityImages.entries()),
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to cache activity images:', error);
      }
    }
  }, [activityImages]);

  // Function to get the best image from activity detail response
  const getBestImage = (activityData) => {
    if (!activityData?.images || !Array.isArray(activityData.images)) {
      return null;
    }

    // Priority: BANNER -> IMAGE -> first available
    const bannerImage = activityData.images.find(img => img.image_type === 'BANNER');
    if (bannerImage?.image_url_host) {
      return bannerImage.image_url_host;
    }

    const regularImage = activityData.images.find(img => img.image_type === 'IMAGE');
    if (regularImage?.image_url_host) {
      return regularImage.image_url_host;
    }

    // Fallback to first available image
    const firstImage = activityData.images[0];
    if (firstImage?.image_url_host) {
      return firstImage.image_url_host;
    }

    return null;
  };

  // Function to fetch image for a specific activity
  const fetchImageForActivity = useCallback(async (activityId) => {
    // Skip if already loading, has image, or has error
    if (loadingImages.has(activityId) || 
        activityImages.has(activityId) || 
        errorImages.has(activityId)) {
      return;
    }

    setLoadingImages(prev => new Set([...prev, activityId]));

    try {
      const response = await fetch(`${API_BASE}/klook/activities/${activityId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity ${activityId}: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.activity) {
        const imageUrl = getBestImage(data.data.activity);
        
        if (imageUrl) {
          setActivityImages(prev => new Map(prev.set(activityId, imageUrl)));
        } else {
          setErrorImages(prev => new Set([...prev, activityId]));
        }
      } else {
        setErrorImages(prev => new Set([...prev, activityId]));
      }
    } catch (error) {
      console.warn(`Failed to fetch image for activity ${activityId}:`, error);
      setErrorImages(prev => new Set([...prev, activityId]));
    } finally {
      setLoadingImages(prev => {
        const next = new Set(prev);
        next.delete(activityId);
        return next;
      });
    }
  }, [loadingImages, activityImages, errorImages]);

  // Function to get image URL for an activity
  const getImageUrl = useCallback((activityId) => {
    return activityImages.get(activityId) || null;
  }, [activityImages]);

  // Function to check if image is loading
  const isImageLoading = useCallback((activityId) => {
    return loadingImages.has(activityId);
  }, [loadingImages]);

  // Function to check if image has error
  const hasImageError = useCallback((activityId) => {
    return errorImages.has(activityId);
  }, [errorImages]);

  // Auto-fetch images for activities that don't have them
  useEffect(() => {
    if (!activities.length) return;

    // Batch fetch images with staggered delays to avoid overwhelming the API
    const activitiesToFetch = activities.filter(activity => {
      const activityId = activity.activity_id;
      return activityId && 
             !activityImages.has(activityId) && 
             !loadingImages.has(activityId) && 
             !errorImages.has(activityId);
    });

    // Fetch images with staggered delays (100ms between each)
    activitiesToFetch.forEach((activity, index) => {
      setTimeout(() => {
        fetchImageForActivity(activity.activity_id);
      }, index * 100); // 100ms delay between each request
    });
  }, [activities, activityImages, loadingImages, errorImages, fetchImageForActivity]);

  return {
    activityImages,
    loadingImages,
    errorImages,
    fetchImageForActivity,
    getImageUrl,
    isImageLoading,
    hasImageError,
  };
};
