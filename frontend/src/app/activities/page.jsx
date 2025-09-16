'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
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
  ArrowLeft,
  Filter,
  SortAsc,
  Calendar,
  DollarSign,
  Award,
  Navigation,
} from 'lucide-react';
import Link from 'next/link';
import API_BASE from "@/lib/api/klookApi";


const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(m => ({ default: m.LoadingSpinner })));
const EmptyState = lazy(() => import('@/components/ui/EmptyState'));

const ActivitiesPage = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category_id'); // Fixed: Changed from 'category' to 'category_id'
  const limit = searchParams.get('limit') || '20';
  const page = searchParams.get('page') || '1';

  const [activitiesData, setActivitiesData] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activities and category data
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build API URL with proper parameters
        const apiUrl = new URL(`${API_BASE}/activities`);
        apiUrl.searchParams.append('limit', limit);
        apiUrl.searchParams.append('page', page);
        if (categoryId) {
          apiUrl.searchParams.append('category_id', categoryId);
        }

        console.log('Fetching activities from:', apiUrl.toString());

        const res = await fetch(apiUrl.toString(), {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

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
            const categoryRes = await fetch(`http://127.0.0.1:8000/api/klook/categories`);
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

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching activities:', err);
          setError(`Failed to load activities: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [categoryId, limit, page]);

  const handleFavoriteToggle = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="h-8 w-8 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/categories">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              Back to Categories
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Floating background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-10">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="text-white"
          >
            {/* Back Button */}
            <Link href="/categories">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Categories
              </motion.button>
            </Link>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {categoryData?.name ? `${categoryData.name} Activities` : 'Activities'}
                </h1>
                <p className="text-xl text-blue-100 mb-2">
                  {categoryData?.description || 'Discover amazing experiences and create unforgettable memories'}
                </p>
                <p className="text-blue-200/80">
                  {sortedActivities.length} activities found
                </p>
              </div>

              {/* View and Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* View Mode Toggle */}
                <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid'
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'list'
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="popular" className="text-gray-900">Most Popular</option>
                    <option value="rating" className="text-gray-900">Highest Rated</option>
                    <option value="price_low" className="text-gray-900">Price: Low to High</option>
                    <option value="price_high" className="text-gray-900">Price: High to Low</option>
                    <option value="reviews" className="text-gray-900">Most Reviews</option>
                  </select>
                  <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          {isLoading && (
            <div className="py-20">
              <LoadingSpinner size="lg" />
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
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                    : 'space-y-6'
                }
              >
                {sortedActivities.map((activity, index) => (
                  <motion.div
                    key={activity.activity_id}
                    variants={itemVariants}
                    custom={index}
                    className={`group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200/50 relative cursor-pointer backdrop-blur-sm ${viewMode === 'list' ? 'flex' : ''
                      }`}
                  >
                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFavoriteToggle(activity.activity_id)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/50 hover:bg-white transition-all shadow-lg"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${favorites.has(activity.activity_id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-400'
                          }`}
                      />
                    </motion.button>

                    {/* Activity Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-blue-500" />
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-lg">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{activity.rating}</span>
                          <span className="text-gray-500">({activity.review_count})</span>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{activity.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Info */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-1 text-green-600 font-bold text-lg flex-shrink-0">
                          <DollarSign className="h-5 w-5" />
                          {activity.price}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {activity.sub_title}
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{activity.location}</span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2 mb-6">
                        {activity.highlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <Award className="h-3 w-3 text-blue-500" />
                            {highlight}
                          </div>
                        ))}
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          Available: {activity.available_dates[0]}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link href={`/activity/${activity.activity_id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
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
              <EmptyState
                icon={Sparkles}
                title="No activities found"
                subtitle={categoryData?.name
                  ? `No activities found in ${categoryData.name} category.`
                  : "No activities match your current filters."
                }
                action={
                  <Link href="/categories">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl"
                    >
                      Browse All Categories
                    </motion.button>
                  </Link>
                }
              />
            )}
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
};

export default ActivitiesPage;