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
  Filter,
  SortAsc,
  Calendar,
  DollarSign,
  Award,
  Navigation,
  Ticket,
  Compass,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import API_BASE from '@/lib/api/klookApi';

const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(m => ({ default: m.LoadingSpinner })));
const { ActivityGridSkeleton, CardSkeleton } = require('@/components/ui/LoadingSkeleton');

const CategoriesPage = () => {
  const searchParams = useSearchParams();
  const limit = searchParams.get('limit') || '20';
  const page = searchParams.get('page') || '1';

  const [categoriesData, setCategoriesData] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories data
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add minimum loading time to prevent flash of empty state
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 500));

        // Build API URL with proper parameters
        const apiUrl = new URL(`${API_BASE}/klook/categories`);
        apiUrl.searchParams.append('limit', limit);
        apiUrl.searchParams.append('page', page);

        console.log('Fetching categories from:', apiUrl.toString());

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

        console.log("Categories API Response:", json);

        // Extract categories data with multiple fallbacks
        let categories = [];
        if (json?.success && json?.data?.categories && Array.isArray(json.data.categories)) {
          categories = json.data.categories;
        } else if (json?.data?.categories && Array.isArray(json.data.categories)) {
          categories = json.data.categories;
        } else if (json?.categories && Array.isArray(json.categories)) {
          categories = json.categories;
        } else if (Array.isArray(json)) {
          categories = json;
        }

        console.log("Extracted categories:", categories.length);

        // Enhance categories with mock data for better display
        const enhancedCategories = categories.map(category => ({
          ...category,
          // Ensure required fields exist
          category_id: category.category_id || category.id || Math.random().toString(36),
          name: category.name || category.title || 'Untitled Category',
          description: category.description || 'Amazing experiences await in this category',
          activity_count: category.activity_count || Math.floor(Math.random() * 500) + 50,
          rating: category.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          price_range: category.price_range || {
            min: Math.floor(Math.random() * 50) + 20,
            max: Math.floor(Math.random() * 200) + 100,
          },
          image: category.image || `/images/categories/${category.category_id || 'default'}.jpg`,
          highlights: category.highlights || [
            'Professional guides included',
            'Small group experiences',
            'Instant confirmation',
            'Free cancellation available'
          ],
          popular_locations: category.popular_locations || ['Bangkok', 'Tokyo', 'Paris', 'New York'],
        }));

        setCategoriesData(enhancedCategories);
        setIsLoading(false);

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching categories:', err);
          setError(`Failed to load categories: ${err.message}`);
        }
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [limit, page]);

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

  // Sort categories based on selected criteria
  const sortedCategories = React.useMemo(() => {
    const sorted = [...categoriesData];
    switch (sortBy) {
      case 'activities_low':
        return sorted.sort((a, b) => a.activity_count - b.activity_count);
      case 'activities_high':
        return sorted.sort((a, b) => b.activity_count - a.activity_count);
      case 'rating':
        return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      case 'price_low':
        return sorted.sort((a, b) => a.price_range.min - b.price_range.min);
      case 'price_high':
        return sorted.sort((a, b) => b.price_range.max - a.price_range.max);
      case 'popular':
      default:
        return sorted; // Keep original order for popular
    }
  }, [categoriesData, sortBy]);

  // Animation variants matching activities page
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
      {/* Background Pattern - Matching Activities Page */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-categories"
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
          <rect width="100" height="100" fill="url(#grid-categories)" />
        </svg>
      </div>

      {/* Decorative Elements - Matching Activities Page */}
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
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              Explore Amazing{' '}
              <span className="text-blue-500 relative">
                Categories
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
                Discover unforgettable experiences organized by category to find exactly what you're looking for
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
          {/* Left side - Categories count */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-lg text-gray-500 font-medium">
                {sortedCategories.length} categories found
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
                   sortBy === 'activities_low' ? 'Activities: Low to High' :
                   sortBy === 'activities_high' ? 'Activities: High to Low' :
                   sortBy === 'price_low' ? 'Price: Low to High' :
                   sortBy === 'price_high' ? 'Price: High to Low' : 'Sort by'}
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
                    setSortBy('activities_high');
                    setIsSortOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === 'activities_high' 
                      ? 'bg-blue-100 text-blue-600 font-medium' 
                      : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  Most Activities
                </button>
                <button
                  onClick={() => {
                    setSortBy('activities_low');
                    setIsSortOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === 'activities_low' 
                      ? 'bg-blue-100 text-blue-600 font-medium' 
                      : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  Fewest Activities
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
            {!isLoading && sortedCategories.length > 0 && (
              <motion.div
                key="categories"
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
                {sortedCategories.map((category, index) => (
                  <motion.div
                    key={category.category_id}
                    variants={itemVariants}
                    custom={index}
                    className={`group bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-gray-200 relative cursor-pointer flex flex-col h-full ${viewMode === 'list' ? 'flex-row' : ''
                      }`}
                  >
                    {/* Category Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-64 flex-shrink-0 h-64' : 'h-56'}`}>
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Compass className="h-24 w-24 text-blue-500" />
                      </div>

                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFavoriteToggle(category.category_id)}
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/50 hover:bg-white transition-all shadow-lg"
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${favorites.has(category.category_id)
                            ? 'text-red-500 fill-current'
                            : 'text-gray-400'
                            }`}
                        />
                      </motion.button>

                      {/* Activity Count Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-lg">
                          <Ticket className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-gray-800">{category.activity_count}+ activities</span>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          <Star className="h-4 w-4" />
                          <span>{category.rating} Rating</span>
                        </div>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-500 transition-colors line-clamp-2 flex-1">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-1 text-green-600 font-bold text-lg flex-shrink-0">
                          <span>${category.price_range.min}</span>
                          <span className="text-gray-400">-</span>
                          <span>${category.price_range.max}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                        {category.description}
                      </p>

                      {/* Popular Locations */}
                      <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">
                          Popular: {category.popular_locations.slice(0, 2).join(', ')}
                        </span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1 mb-4 flex-1">
                        {category.highlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <Award className="h-3 w-3 text-blue-500 flex-shrink-0" />
                            <span className="line-clamp-1">{highlight}</span>
                          </div>
                        ))}
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          Worldwide destinations
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link href={`/activities?category_id=${category.category_id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-sm"
                        >
                          Explore Activities
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!isLoading && sortedCategories.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No categories found</h2>
                <p className="text-gray-600 mb-6">
                  No categories are currently available. Please check back later.
                </p>
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl"
                  >
                    Return Home
                  </motion.button>
                </Link>
              </div>
            )}
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
};

export default CategoriesPage;