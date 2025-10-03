import { useState, useEffect, useCallback, useRef } from 'react';
import API_BASE from '@/lib/api/klookApi';

// Cache key for localStorage
const CACHE_KEY = 'activity_images_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Ultra-optimized hook for activity images with intersection observer and batch loading
 * @param {Array} activities - Array of activities to fetch images for
 * @returns {Object} - { activityImages, loadingImages, errorImages, fetchImageForActivity, getObserverRef }
 */
export const useActivityImagesOptimized = (activities = []) => {
  const [activityImages, setActivityImages] = useState(new Map());
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [errorImages, setErrorImages] = useState(new Set());
  const [visibleActivities, setVisibleActivities] = useState(new Set());
  const [activityCountries, setActivityCountries] = useState(new Map());
  const observerRef = useRef(null);
  const batchQueueRef = useRef([]);
  const processingRef = useRef(false);

  // Load cached images from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        if (now - timestamp < CACHE_EXPIRY) {
          setActivityImages(new Map(data));
        } else {
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

    const firstImage = activityData.images[0];
    if (firstImage?.image_url_host) {
      return firstImage.image_url_host;
    }

    return null;
  };

  // Function to extract country name from activity detail response
  const extractCountryName = (activityData) => {
    if (!activityData?.city_info || !Array.isArray(activityData.city_info)) {
      return null;
    }

    // Get country name from city_info
    const cityInfo = activityData.city_info[0];
    if (cityInfo?.country_name) {
      return cityInfo.country_name;
    }

    return null;
  };

  // Ultra-fast batch fetch with Promise.allSettled
  const fetchImagesBatch = useCallback(async (activityIds) => {
    if (!activityIds.length || processingRef.current) return;

    processingRef.current = true;
    
    // Mark activities as loading
    setLoadingImages(prev => {
      const next = new Set(prev);
      activityIds.forEach(id => next.add(id));
      return next;
    });

    try {
      // Create all promises at once for maximum parallelization
      const promises = activityIds.map(async (activityId) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(`${API_BASE}/klook/activities/${activityId}`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success && data.data?.activity) {
            const imageUrl = getBestImage(data.data.activity);
            const countryName = extractCountryName(data.data.activity);
            return { activityId, imageUrl, countryName, success: !!imageUrl };
          }
          
          return { activityId, imageUrl: null, success: false };
        } catch (error) {
          return { activityId, imageUrl: null, success: false, error: error.message };
        }
      });

      // Wait for all requests to complete
      const results = await Promise.allSettled(promises);
      
      // Process results efficiently
      const newImages = new Map();
      const newCountries = new Map();
      const newErrors = new Set();

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { activityId, imageUrl, countryName, success } = result.value;
          if (success && imageUrl) {
            newImages.set(activityId, imageUrl);
            if (countryName) {
              newCountries.set(activityId, countryName);
            }
          } else {
            newErrors.add(activityId);
          }
        } else {
          // Handle rejected promises
          console.warn('Promise rejected:', result.reason);
        }
      });

      // Batch update state
      setActivityImages(prev => new Map([...prev, ...newImages]));
      setActivityCountries(prev => new Map([...prev, ...newCountries]));
      setErrorImages(prev => new Set([...prev, ...newErrors]));

    } catch (error) {
      console.error('Batch fetch error:', error);
      setErrorImages(prev => new Set([...prev, ...activityIds]));
    } finally {
      // Remove from loading
      setLoadingImages(prev => {
        const next = new Set(prev);
        activityIds.forEach(id => next.delete(id));
        return next;
      });
      processingRef.current = false;
    }
  }, []);

  // Intersection Observer for ultra-lazy loading
  useEffect(() => {
    if (!activities.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const newVisibleIds = new Set();
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activityId = parseInt(entry.target.dataset.activityId);
            if (activityId) {
              newVisibleIds.add(activityId);
            }
          }
        });

        if (newVisibleIds.size > 0) {
          setVisibleActivities(prev => new Set([...prev, ...newVisibleIds]));
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before element is visible
        threshold: 0.01 // Trigger as soon as any part is visible
      }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [activities]);

  // Process visible activities with smart batching
  useEffect(() => {
    if (!visibleActivities.size) return;

    const activitiesToFetch = Array.from(visibleActivities).filter(activityId => 
      !activityImages.has(activityId) && 
      !loadingImages.has(activityId) && 
      !errorImages.has(activityId)
    );

    if (activitiesToFetch.length > 0) {
      // Add to batch queue
      batchQueueRef.current.push(...activitiesToFetch);
      
      // Process queue with debouncing
      const processQueue = () => {
        if (batchQueueRef.current.length === 0 || processingRef.current) return;
        
        const batch = batchQueueRef.current.splice(0, 8); // Process 8 at a time
        if (batch.length > 0) {
          fetchImagesBatch(batch);
        }
      };

      // Debounce queue processing
      const timeoutId = setTimeout(processQueue, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [visibleActivities, activityImages, loadingImages, errorImages, fetchImagesBatch]);

  // Preload critical images (first 6) immediately
  useEffect(() => {
    if (!activities.length) return;

    const criticalActivities = activities.slice(0, 6);
    const criticalIds = criticalActivities
      .map(activity => activity.activity_id)
      .filter(id => id && !activityImages.has(id) && !loadingImages.has(id) && !errorImages.has(id));
    
    if (criticalIds.length > 0) {
      // Immediate fetch for critical images
      fetchImagesBatch(criticalIds);
    }
  }, [activities, activityImages, loadingImages, errorImages, fetchImagesBatch]);

  // Function to get image URL for an activity
  const getImageUrl = useCallback((activityId) => {
    return activityImages.get(activityId) || null;
  }, [activityImages]);

  // Function to get country name for an activity
  const getCountryName = useCallback((activityId) => {
    return activityCountries.get(activityId) || null;
  }, [activityCountries]);

  // Function to check if image is loading
  const isImageLoading = useCallback((activityId) => {
    return loadingImages.has(activityId);
  }, [loadingImages]);

  // Function to check if image has error
  const hasImageError = useCallback((activityId) => {
    return errorImages.has(activityId);
  }, [errorImages]);

  // Function to manually fetch image for an activity
  const fetchImageForActivity = useCallback((activityId) => {
    if (!activityImages.has(activityId) && !loadingImages.has(activityId) && !errorImages.has(activityId)) {
      fetchImagesBatch([activityId]);
    }
  }, [activityImages, loadingImages, errorImages, fetchImagesBatch]);

  // Function to get intersection observer ref
  const getObserverRef = useCallback(() => {
    return observerRef.current;
  }, []);

  return {
    activityImages,
    loadingImages,
    errorImages,
    fetchImageForActivity,
    getImageUrl,
    getCountryName,
    isImageLoading,
    hasImageError,
    getObserverRef,
  };
};
