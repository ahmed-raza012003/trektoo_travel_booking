'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
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
  Search,
  Zap,
  Globe,
  Compass,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import API_BASE from '@/lib/api/klookApi';

// Lazy load heavy components for better performance
const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(module => ({ default: module.LoadingSpinner })));
const EmptyState = lazy(() => import('@/components/ui/EmptyState'));

const ActivitiesCategoriesPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Optimized state management
  const [categoriesData, setCategoriesData] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Intersection observer with optimized settings
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px 0px', // Start loading before element comes into view
  });

  // Optimized API fetch with AbortController
  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/klook/categories`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        // Optimized data extraction
        let categories = [];
        if (json?.success && json?.data?.categories && Array.isArray(json.data.categories)) {
          categories = json.data.categories;
        } else if (json?.data && Array.isArray(json.data)) {
          categories = json.data;
        } else if (json?.categories && Array.isArray(json.categories)) {
          categories = json.categories;
        } else if (Array.isArray(json)) {
          categories = json;
        }

        setCategoriesData(categories);

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching categories:', err);
          setError(`Failed to load categories: ${err.message}`);
          setCategoriesData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();

    return () => controller.abort(); // Cleanup on unmount
  }, []);

  // Memoized enhanced categories with optimized calculations
  const enhancedCategories = React.useMemo(() => {
    if (!Array.isArray(categoriesData)) {
      return [];
    }

    return categoriesData.map((category) => ({
      ...category,
      id: category.id || Math.random().toString(36),
      name: category.name || 'Unknown Category',
      activityCount: Math.floor(Math.random() * 500) + 50,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      priceRange: {
        min: Math.floor(Math.random() * 50) + 20,
        max: Math.floor(Math.random() * 200) + 100,
      },
      image: `/images/categories/${category.id || 'default'}.jpg`,
      description: category.description || `Discover amazing ${(category.name || 'experiences').toLowerCase()} experiences and create unforgettable memories.`,
      highlights: [
        'Expert local guides',
        'Small group sizes',
        'Instant confirmation',
        'Free cancellation',
      ],
    }));
  }, [categoriesData]);

  // Optimized filter function with debouncing effect through useMemo
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return enhancedCategories;

    const query = searchQuery.toLowerCase();
    return enhancedCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
    );
  }, [enhancedCategories, searchQuery]);

  // Optimized favorite toggle with useCallback
  const handleFavoriteToggle = useCallback((categoryId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(categoryId)) {
        newFavorites.delete(categoryId);
      } else {
        newFavorites.add(categoryId);
      }
      return newFavorites;
    });
  }, []);

  // Optimized animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }, // Reduced delays
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Reduced movement for better performance
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 25 }, // Faster animations
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Enhanced floating elements animation
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Hero Section with Modern Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-[80vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

          {/* Floating Elements */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          />
          <motion.div
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: '2s' }}
            className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl"
          />
          <motion.div
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: '4s' }}
            className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"
          />

          {/* Animated Sparkles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              variants={sparkleVariants}
              animate="animate"
              style={{
                animationDelay: `${i * 0.3}s`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30"

            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="text-center text-white"
          >
            {/* Enhanced Title with Icons */}
            <div className="flex items-center justify-center gap-4 mb-8 mt-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm border border-white/10"
              >
                <Compass className="h-8 w-8 text-blue-300" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Explore Categories
              </h1>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full backdrop-blur-sm border border-white/10"
              >
                <Globe className="h-8 w-8 text-purple-300" />
              </motion.div>
            </div>

            {/* Enhanced Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-3xl text-blue-100 mb-4 max-w-4xl mx-auto font-light"
            >
              Discover <span className="text-yellow-300 font-semibold">extraordinary experiences</span> across different categories
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-blue-200/80 mb-12 max-w-2xl mx-auto"
            >
              Create unforgettable memories with curated activities from around the world
            </motion.p>

            {/* Enhanced Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative max-w-3xl mx-auto mb-16"
            >
              <div className="relative group">
                {/* Search Icon */}
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />

                {/* Input */}
                <input
                  type="text"
                  placeholder="Search for your next adventure..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-20 py-5 rounded-3xl text-lg text-gray-900 placeholder-gray-400 bg-white/95 backdrop-blur-md border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 transition-all shadow-lg group-hover:shadow-xl focus:scale-[1.02] outline-none"
                />

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 
                 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 
                 text-white shadow-md hover:shadow-lg 
                 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 
                 transition-all"
                >
                  <Zap className="h-5 w-5" />
                  <span className="hidden sm:inline">Search</span>
                </motion.button>
              </div>
            </motion.div>


            {/* Enhanced Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap items-center justify-center gap-8 mb-12"
            >
              {[
                { icon: Users, label: '10M+ Explorers', color: 'blue' },
                { icon: MapPin, label: '50+ Countries', color: 'purple' },
                { icon: Star, label: '4.8★ Rating', color: 'yellow' },
                { icon: Zap, label: 'Instant Booking', color: 'green' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20"
                >
                  <div className={`p-2 bg-gradient-to-br from-${stat.color}-500/30 to-${stat.color}-600/30 rounded-xl`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-300`} />
                  </div>
                  <span className="font-semibold text-white">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced View Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-center gap-6"
            >
              <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-4 rounded-xl transition-all ${viewMode === 'grid'
                    ? 'bg-white text-blue-900 shadow-lg'
                    : 'text-white hover:bg-white/20'
                    }`}
                >
                  <Grid className="h-6 w-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-4 rounded-xl transition-all ${viewMode === 'list'
                    ? 'bg-white text-blue-900 shadow-lg'
                    : 'text-white hover:bg-white/20'
                    }`}
                >
                  <List className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Scroll Indicator */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-white/70"
              >
                <span className="text-sm font-medium">Explore Below</span>
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Optimized Main Content */}
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          {/* Loading State */}
          {isLoading && (
            <div className="py-20">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Categories Grid/List - Optimized */}
          <AnimatePresence mode="wait">
            {!isLoading && filteredCategories.length > 0 && (
              <motion.div
                key="categories"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                exit="hidden"
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                    : 'space-y-6'
                }
              >
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    custom={index}
                    className={`group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200/50 relative cursor-pointer backdrop-blur-sm ${viewMode === 'list' ? 'flex' : ''
                      }`}
                  >
                    {/* Optimized Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFavoriteToggle(category.id)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/50 hover:bg-white transition-all"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${favorites.has(category.id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-400'
                          }`}
                      />
                    </motion.button>

                    {/* Optimized Category Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-blue-500" />
                      </div>

                      {/* Stats Overlay */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{category.activityCount}+ activities</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{category.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      {/* Price Range */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">From</span>
                        <span className="text-lg font-bold text-blue-600">
                          ${category.priceRange.min}
                        </span>
                        <span className="text-sm text-gray-500">to</span>
                        <span className="text-lg font-bold text-blue-600">
                          ${category.priceRange.max}
                        </span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2 mb-6">
                        {category.highlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {highlight}
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/activities?limit=20&page=1&category_id=${category.id}`}
                        className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-2xl 
             font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
                      >
                        <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          Explore It
                        </motion.span>
                      </Link>


                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && filteredCategories.length === 0 && (
              <EmptyState
                icon={Sparkles}
                title="No categories found"
                subtitle="We couldn't find any categories matching your search."
                action={
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery('')}
                    className="px-10 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl"
                  >
                    Clear Search
                  </motion.button>
                }
              />
            )}
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
};

export default ActivitiesCategoriesPage;