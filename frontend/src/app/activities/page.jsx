'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Star,
  Users,
  Clock,
  Grid,
  List,
  Heart,
  Eye,
  Filter,
  SortAsc,
  Calendar,
  DollarSign,
  Award,
  Navigation,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import API_BASE from '@/lib/api/klookApi';

const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(m => ({ default: m.LoadingSpinner })));
const { ActivityGridSkeleton, CardSkeleton } = require('@/components/ui/LoadingSkeleton');

const ActivitiesPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get('category_id');
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');

  const [activitiesData, setActivitiesData] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [categoryData, setCategoryData] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activities and category data
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add minimum loading time to prevent flash of empty state
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 500));

        // Build API URL with proper parameters
        const apiUrl = new URL(`${API_BASE}/klook/activities`);
        apiUrl.searchParams.append('limit', limit.toString());
        apiUrl.searchParams.append('page', page.toString());
        if (categoryId) {
          apiUrl.searchParams.append('category_id', categoryId);
        }

        console.log('Fetching activities from:', apiUrl.toString());

        // Wait for both API call and minimum loading time
        const [res] = await Promise.all([
          fetch(apiUrl.toString(), {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }),
          minLoadingTime
        ]);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();

        console.log("Activities API Response:", json);

        // Extract activities data with multiple fallbacks
        let activities = [];
        if (json?.success && json?.data?.activity?.activity_list && Array.isArray(json.data.activity.activity_list)) {
          activities = json.data.activity.activity_list;
        } else if (json?.data?.activities && Array.isArray(json.data.activities)) {
          activities = json.data.activities;
        } else if (json?.activities && Array.isArray(json.activities)) {
          activities = json.activities;
        } else if (Array.isArray(json)) {
          activities = json;
        }

        console.log("Extracted activities:", activities.length);

        // Extract total count
        let total = 0;
        if (json?.data?.activity?.total) {
          total = json.data.activity.total;
        } else if (json?.data?.total) {
          total = json.data.total;
        } else if (json?.total) {
          total = json.total;
        }

        setTotalActivities(total);

        // Enhance activities with mock data for better display
        const enhancedActivities = activities.map(activity => ({
          ...activity,
          // Ensure required fields exist
          activity_id: activity.activity_id || activity.id || Math.random().toString(36),
          title: activity.title || activity.name || 'Untitled Activity',
          sub_title: activity.sub_title || activity.description || 'Amazing experience awaits',
          price: activity.price || (Math.floor(Math.random() * 200) + 50),
          currency: activity.currency || 'USD',
          rating: activity.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          review_count: activity.review_count || Math.floor(Math.random() * 500) + 10,
          duration: activity.duration || `${Math.floor(Math.random() * 8) + 1} hours`,
          location: activity.location || 'Various Locations',
          image: activity.image || `/images/activities/${activity.activity_id || 'default'}.jpg`,
          highlights: activity.highlights || [
            'Professional guide included',
            'Small group experience',
            'Instant confirmation',
            'Free cancellation available'
          ],
          available_dates: activity.available_dates || ['Today', 'Tomorrow', 'This Weekend'],
        }));

        setActivitiesData(enhancedActivities);

        // If we have a category ID, fetch category info (optional)
        if (categoryId) {
          try {
            const categoryRes = await fetch(`${API_BASE}/klook/categories`);
            if (categoryRes.ok) {
              const categoryJson = await categoryRes.json();
              let categories = [];
              if (categoryJson?.success && categoryJson?.data?.categories) {
                categories = categoryJson.data.categories;
              }
              const foundCategory = categories.find(cat => cat.id == categoryId);
              if (foundCategory) {
                setCategoryData(foundCategory);
              }
            }
          } catch (err) {
            console.log('Could not fetch category data:', err);
          }
        }

        // Only set loading to false after successful data fetch
        setIsLoading(false);

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching activities:', err);
          setError(`Failed to load activities: ${err.message}`);
        }
        // Set loading to false even on error so user can see error state
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [categoryId, limit, page]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/activities?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalActivities / limit);

  const handleFavoriteToggle = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Handle click outside for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSortOpen && !event.target.closest('[data-sort-dropdown]')) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSortOpen]);

  // Sort activities based on selected criteria
  const sortedActivities = React.useMemo(() => {
    const sorted = [...activitiesData];
    switch (sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price_high':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'rating':
        return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      case 'reviews':
        return sorted.sort((a, b) => b.review_count - a.review_count);
      case 'popular':
      default:
        return sorted; // Keep original order for popular
    }
  }, [activitiesData, sortBy]);

  // Animation variants matching landing page
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
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

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="h-8 w-8 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Pattern - Matching Landing Page */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-activities"
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
          <rect width="100" height="100" fill="url(#grid-activities)" />
        </svg>
      </div>

      {/* Decorative Elements - Matching Landing Page */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-300/10 to-blue-500/10 rounded-full blur-lg"></div>

      {/* Enhanced Header Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-40">
          <motion.div
          variants={containerVariants}
            initial="hidden"
            animate="visible"
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight mb-6"
              style={{
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              Discover Amazing{' '}
              <span className="text-blue-500 relative">
                Activities
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
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse max-w-4xl mx-auto"></div>
            ) : (
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                {categoryData?.description || 'Create unforgettable memories with our curated selection of amazing experiences'}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Controls Section - Single Line */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-center mb-12"
        >
          {/* Left side - Activities count */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-lg text-gray-500 font-medium">
                {totalActivities} activities found
              </p>
            )}
          </motion.div>

          {/* Right side - Controls */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center">
                {/* View Mode Toggle */}
            <div className="flex bg-white rounded-3xl p-2 border border-gray-200 shadow-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                className={`p-3 rounded-2xl transition-all ${viewMode === 'grid'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-50'
                      }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                className={`p-3 rounded-2xl transition-all ${viewMode === 'list'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-50'
                      }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

            {/* Custom Sort Dropdown */}
            <div className="relative" data-sort-dropdown>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-3xl px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="font-medium">
                  {sortBy === 'popular' ? 'Most Popular' :
                   sortBy === 'rating' ? 'Highest Rated' :
                   sortBy === 'price_low' ? 'Price: Low to High' :
                   sortBy === 'price_high' ? 'Price: High to Low' :
                   sortBy === 'reviews' ? 'Most Reviews' : 'Sort by'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-blue-100 transition-all duration-200 ease-in-out ${
                  isSortOpen ? 'block' : 'hidden'
                }`}
                role="menu"
              >
                <button
                  onClick={() => {
                    setSortBy('popular');
                    setIsSortOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === 'popular' 
                      ? 'bg-blue-100 text-blue-600 font-medium' 
                      : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  Most Popular
                </button>
                <button
                  onClick={() => {
                    setSortBy('rating');
                    setIsSortOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === 'rating' 
                      ? 'bg-blue-100 text-blue-600 font-medium' 
                      : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  Highest Rated
                </button>
                <button
                  onClick={() => {
                    setSortBy('price_low');
                    setIsSortOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === 'price_low' 
                      ? 'bg-blue-100 text-blue-600 font-medium' 
                      : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  Price: Low to High
                </button>
                <button
                  onClick={() => {
                    setSortBy('price_high');
                    setIsSortOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === 'price_high' 
                      ? 'bg-blue-100 text-blue-600 font-medium' 
                      : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  Price: High to Low
                </button>
                <button
                  onClick={() => {
                    setSortBy('reviews');
                    setIsSortOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === 'reviews' 
                      ? 'bg-blue-100 text-blue-600 font-medium' 
                      : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  Most Reviews
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          {isLoading && (
            <div className="py-8">
              {viewMode === 'grid' ? (
                <ActivityGridSkeleton items={6} />
              ) : (
                <div className="space-y-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-row h-64">
                      <div className="w-64 flex-shrink-0 h-64 bg-gray-200 animate-pulse"></div>
                      <div className="p-6 flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-full mt-4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isLoading && sortedActivities.length > 0 && (
              <motion.div
                key="activities"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-6'
                }
              >
                {sortedActivities.map((activity, index) => (
                  <motion.div
                    key={activity.activity_id}
                    variants={itemVariants}
                    custom={index}
                    className={`group bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-gray-200 relative cursor-pointer flex flex-col h-full ${viewMode === 'list' ? 'flex-row' : ''
                      }`}
                  >
                    {/* Activity Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-64 flex-shrink-0 h-64' : 'h-56'}`}>
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Ticket className="h-24 w-24 text-blue-500" />
                      </div>

                      {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFavoriteToggle(activity.activity_id)}
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/50 hover:bg-white transition-all shadow-lg"
                    >
                      <Heart
                          className={`h-4 w-4 transition-colors ${favorites.has(activity.activity_id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-400'
                          }`}
                      />
                    </motion.button>

                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-lg">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-800">{activity.rating}</span>
                          <span className="text-gray-500">({activity.review_count})</span>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{activity.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-500 transition-colors line-clamp-2 flex-1">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-1 text-green-600 font-bold text-lg flex-shrink-0">
                          <DollarSign className="h-5 w-5" />
                          <span>{activity.price}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                        {activity.sub_title}
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{activity.location}</span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1 mb-4 flex-1">
                        {activity.highlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <Award className="h-3 w-3 text-blue-500 flex-shrink-0" />
                            <span className="line-clamp-1">{highlight}</span>
                          </div>
                        ))}
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          Available: {activity.available_dates[0]}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link href={`/activity/${activity.activity_id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-sm"
                        >
                          View Details & Book
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!isLoading && sortedActivities.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No activities found</h2>
                <p className="text-gray-600 mb-6">
                  {categoryData?.name
                    ? `No activities found in ${categoryData.name} category.`
                    : "No activities match your current filters."}
                </p>
                <Link href="/categories">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl"
                  >
                    Browse All Categories
                  </motion.button>
                </Link>
              </div>
            )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {!isLoading && totalActivities > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center gap-4 mt-12"
            >
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium text-gray-800"
              >
                Previous
              </button>
              <span className="text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium text-gray-800"
              >
                Next
              </button>
            </motion.div>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default ActivitiesPage;