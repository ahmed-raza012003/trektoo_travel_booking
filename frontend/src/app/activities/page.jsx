'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Star,
  Clock,
  Grid,
  List,
  Heart,
  Calendar,
  DollarSign,
  Award,
  Ticket,
  Search,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import API_BASE from '@/lib/api/klookApi';

const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(m => ({ default: m.LoadingSpinner })));
const { ActivityGridSkeleton, CardSkeleton } = require('@/components/ui/LoadingSkeleton');

const ActivitiesPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get('category_id');
  const searchParam = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = 20; // Show 20 activities per page

  const [allActivities, setAllActivities] = useState([]); // Store ALL activities
  const [filteredActivities, setFilteredActivities] = useState([]); // Filtered activities
  const [currentPageActivities, setCurrentPageActivities] = useState([]); // Activities for current page
  const [totalActivities, setTotalActivities] = useState(0);
  const [categoryData, setCategoryData] = useState(null);
  const [allCategories, setAllCategories] = useState([]); // Store all categories for filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(categoryId || ''); // Category filter state
  const [searchQuery, setSearchQuery] = useState(searchParam); // Search input value
  const [activeSearchQuery, setActiveSearchQuery] = useState(searchParam); // Actual search term used in filtering
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [totalAvailableActivities, setTotalAvailableActivities] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Fast database fetch function - get all activities at once
  const fetchActivitiesFromDatabase = async (controller) => {
      try {
        setIsLoading(true);
        setError(null);
      setLoadingProgress(0);

      // First, fetch categories
      const categoriesRes = await fetch(`${API_BASE}/klook/categories`, {
        signal: controller.signal,
      });
      
      if (!categoriesRes.ok) throw new Error(`Categories fetch failed: ${categoriesRes.status}`);
      const categoriesJson = await categoriesRes.json();
      const categories = categoriesJson?.data?.categories || [];
      setAllCategories(categories);

      // Fetch all activities from database (fast!)
      const activitiesRes = await fetch(`${API_BASE}/klook/activities?limit=2000`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
      });

      if (!activitiesRes.ok) throw new Error(`Activities fetch failed: ${activitiesRes.status}`);
      const activitiesData = await activitiesRes.json();
      
      console.log('🔍 DEBUG - API Response:', activitiesData);
      
      if (!activitiesData?.success || !activitiesData?.data?.activity?.activity_list) {
        console.error('❌ Invalid API response format:', activitiesData);
        throw new Error('Invalid API response format');
      }

      const allActivitiesData = activitiesData.data.activity.activity_list;
      const totalCount = activitiesData.data.activity.total || allActivitiesData.length;
      
      console.log(`🚀 Database loaded: ${allActivitiesData.length} activities instantly!`);
      setTotalAvailableActivities(totalCount);
      setAllActivities(allActivitiesData);
      setHasInitialData(true);
      setIsLoading(false);
      setLoadingProgress(100);

      return { activities: allActivitiesData, categories };

    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // Fetch activities and categories from database
  useEffect(() => {
    const controller = new AbortController();

    const initializeData = async () => {
      try {
        const { activities, categories } = await fetchActivitiesFromDatabase(controller);
        
        // Apply initial filtering immediately
        applyFilters(activities, categories, selectedCategoryFilter, searchQuery);

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching activities:', err);
          setError(`Failed to load activities: ${err.message}`);
        }
        setIsLoading(false);
      }
    };

    initializeData();
    return () => controller.abort();
  }, []); // Only run once on mount

  // Enhanced filters function with instant search
  const applyFilters = useCallback((activities, categories, categoryFilter, search) => {
    console.log('🔍 DEBUG - Filter inputs:', { categoryFilter, search, activitiesCount: activities.length });
    
    let filtered = [...activities];

    // Apply category filter
    if (categoryFilter) {
      const targetCategory = categories.find(cat => cat.id == categoryFilter);
        
      if (targetCategory) {
        setCategoryData(targetCategory);

        // Get ALL valid category IDs from this category (including nested ones)
        let validCategoryIds = [parseInt(categoryFilter)]; // Include main category ID
          
        // Recursive function to collect all nested category IDs
        const collectCategoryIds = (category) => {
          if (category.sub_category && Array.isArray(category.sub_category)) {
            category.sub_category.forEach(sub => {
              validCategoryIds.push(parseInt(sub.id));
              
              if (sub.leaf_category && Array.isArray(sub.leaf_category)) {
                sub.leaf_category.forEach(leaf => {
                  validCategoryIds.push(parseInt(leaf.id));
                });
              }
              
              // Recursively collect from nested subcategories if they exist
              collectCategoryIds(sub);
            });
          }
        };

        collectCategoryIds(targetCategory);

        // Remove duplicates
        validCategoryIds = [...new Set(validCategoryIds)];

        console.log('🔍 DEBUG - Valid category IDs for category', categoryFilter, ':', validCategoryIds);
        
        const beforeFilterCount = filtered.length;
        filtered = filtered.filter(activity => {
          const activityCategoryId = parseInt(activity.category_id);
          return validCategoryIds.includes(activityCategoryId);
        });
        
        console.log('🔍 DEBUG - Category filter applied:', {
          targetCategory: targetCategory.name,
          validIds: validCategoryIds,
          before: beforeFilterCount,
          after: filtered.length
        });
      } else {
        console.log('🔍 DEBUG - Category not found:', categoryFilter);
        setCategoryData(null);
      }
    } else {
      setCategoryData(null);
    }

    // Enhanced search filter with multiple fields
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      const beforeSearchCount = filtered.length;
      
      filtered = filtered.filter(activity => {
        const searchableText = [
          activity.title,
          activity.sub_title,
          activity.location,
          // Add more searchable fields if available
        ].join(' ').toLowerCase();
        
        // Check if all search terms are found in the searchable text
        return searchTerms.every(term => searchableText.includes(term));
      });
      
      console.log('🔍 DEBUG - Enhanced search filter applied:', {
        searchTerm: search,
        searchTerms: searchTerms,
        before: beforeSearchCount,
        after: filtered.length
      });
    }

    console.log('🔍 DEBUG - Final filtered count:', filtered.length);
    setFilteredActivities(filtered);
    setTotalActivities(filtered.length);
  }, []);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (categoryId && categoryId !== selectedCategoryFilter) {
      setSelectedCategoryFilter(categoryId);
    }
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam);
      setActiveSearchQuery(searchParam);
    }
  }, [categoryId, selectedCategoryFilter, searchParam]);

  // Re-apply filters when category changes (but NOT when search changes)
  useEffect(() => {
    if (allActivities.length > 0) {
      console.log('🔍 DEBUG - Applying filters:', {
        categoryFilter: selectedCategoryFilter,
        totalActivities: allActivities.length
      });
      applyFilters(allActivities, allCategories, selectedCategoryFilter, activeSearchQuery);
    }
  }, [selectedCategoryFilter, allActivities, allCategories, applyFilters, activeSearchQuery]);

  // Paginate filtered activities when page changes
  useEffect(() => {
    if (filteredActivities.length > 0) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
      
      // Enhance activities with mock data for better display
      const enhancedActivities = paginatedActivities.map(activity => ({
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

      setCurrentPageActivities(enhancedActivities);
    }
  }, [filteredActivities, page]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/activities?${params.toString()}`);
  };

  const handleCategoryFilterChange = (categoryId) => {
    setSelectedCategoryFilter(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set('category_id', categoryId);
    } else {
      params.delete('category_id');
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/activities?${params.toString()}`);
    setIsCategoryFilterOpen(false);
  };


  // Simple search that only works on submit
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Show searching indicator
    setIsSearching(true);
    
    // Set the active search query (this will trigger the useEffect to apply filters)
    setActiveSearchQuery(searchQuery);
    
    // Execute search immediately
    setTimeout(() => {
      if (allActivities.length > 0) {
        applyFilters(allActivities, allCategories, selectedCategoryFilter, searchQuery);
      }
      
      // Hide searching indicator
      setIsSearching(false);
      
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set('search', searchQuery);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.replace(`/activities?${params.toString()}`);
    }, 300); // Small delay for visual feedback
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchQuery('');
    // Apply filters immediately to clear search results
    if (allActivities.length > 0) {
      applyFilters(allActivities, allCategories, selectedCategoryFilter, '');
    }
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.replace(`/activities?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSelectedCategoryFilter('');
    setSearchQuery('');
    setActiveSearchQuery('');
    setSortBy('popular'); // Reset to default sort option
    
    // Apply filters immediately (this will clear search)
    if (allActivities.length > 0) {
      applyFilters(allActivities, allCategories, '', '');
    }
    
    router.push('/activities');
  };

  // No need for load more function - all data loaded from database


  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  const handleFavoriteToggle = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSortOpen && !event.target.closest('[data-sort-dropdown]')) {
        setIsSortOpen(false);
      }
      if (isCategoryFilterOpen && !event.target.closest('[data-category-filter]')) {
        setIsCategoryFilterOpen(false);
      }
    };

    if (isSortOpen || isCategoryFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSortOpen, isCategoryFilterOpen]);

  // Sort activities based on selected criteria
  const sortedActivities = React.useMemo(() => {
    const sorted = [...currentPageActivities];
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
        return sorted;
    }
  }, [currentPageActivities, sortBy]);

  // Animation variants
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
      {/* Background Pattern */}
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

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>

      {/* Header Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight mb-6">
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
              <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse max-w-4xl mx-auto"></div>
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Loading initial activities...</span>
                    <span>Please wait</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                {categoryData?.name 
                  ? `Explore ${totalActivities} activities in ${categoryData.name}${categoryData.sub_category && categoryData.sub_category.length > 0 ? ' and all subcategories' : ''}`
                    : searchQuery
                    ? `Found ${totalActivities} activities matching "${searchQuery}"`
                    : `Discover ${totalActivities} amazing experiences from our curated collection`
                }
              </p>
                {isLoading && (
                  <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
                      <span>Loading activities from database...</span>
                      <span>{loadingProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Simple Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities... (press Enter to search)"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-20 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-800 placeholder-gray-500"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-500 hidden sm:block">Searching...</span>
                  </div>
                )}
                {!isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Clear search"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                      title="Search"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </form>

              {/* Category Filter */}
              <div className="relative" data-category-filter>
                <button
                  onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  <Filter className="h-5 w-5" />
                  <span className="font-medium">
                    {selectedCategoryFilter && categoryData?.name 
                      ? categoryData.name 
                      : 'All Categories'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isCategoryFilterOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isCategoryFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-blue-100 max-h-96 overflow-y-auto">
                    <button
                      onClick={() => handleCategoryFilterChange('')}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        !selectedCategoryFilter 
                          ? 'bg-blue-100 text-blue-600 font-medium' 
                          : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                      }`}
                    >
                      All Categories
                    </button>
                    {allCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryFilterChange(category.id.toString())}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedCategoryFilter === category.id.toString()
                            ? 'bg-blue-100 text-blue-600 font-medium' 
                            : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-500">ID: {category.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategoryFilter || searchQuery) && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                {selectedCategoryFilter && categoryData && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    <span>{categoryData.name}</span>
                    <button
                      onClick={() => handleCategoryFilterChange('')}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    <span>"{searchQuery}" ({totalActivities} results)</span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveSearchQuery('');
                        // Apply filters immediately to clear search results
                        if (allActivities.length > 0) {
                          applyFilters(allActivities, allCategories, selectedCategoryFilter, '');
                        }
                        // Update URL
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('search');
                        params.set('page', '1');
                        router.replace(`/activities?${params.toString()}`);
                      }}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-center mb-12"
        >
          {/* Activities count */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
              <p className="text-lg text-gray-500 font-medium">
                {totalActivities} activities found
                {categoryData && ` in ${categoryData.name}${categoryData.sub_category && categoryData.sub_category.length > 0 ? ' (including subcategories)' : ''}`}
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                  {totalAvailableActivities > 0 && (
                    <p className="text-sm text-gray-400">
                      {allActivities.length.toLocaleString()} activities loaded instantly from database
                    </p>
                  )}
                </div>
                {isFilterLoading && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Filtering...</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Controls */}
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

            {/* Sort Dropdown */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-blue-100">
                  {[
                    { value: 'popular', label: 'Most Popular' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'price_low', label: 'Price: Low to High' },
                    { value: 'price_high', label: 'Price: High to Low' },
                    { value: 'reviews', label: 'Most Reviews' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === option.value 
                          ? 'bg-blue-100 text-blue-600 font-medium' 
                          : 'text-gray-900 hover:bg-blue-100 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
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
                    <CardSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filter Loading Overlay */}
          {isFilterLoading && !isLoading && (
            <div className="relative">
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-600 font-medium">Applying filters...</span>
                </div>
              </div>
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
                <Link href="/activities-categories">
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

          {/* Database Performance Message */}
          {!isLoading && totalAvailableActivities > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8 p-6 bg-green-50 rounded-2xl border border-green-200"
            >
              <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>All {allActivities.length.toLocaleString()} activities loaded instantly from database!</span>
              </div>
            </motion.div>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default ActivitiesPage;