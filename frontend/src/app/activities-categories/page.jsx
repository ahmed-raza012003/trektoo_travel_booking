'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  ChevronDown,
  Car,
  Ship,
  Train,
  Hotel,
  Utensils,
  Luggage,
  Film,
  ShoppingBag,
  Plane,
  Camera,
  Coffee,
  Mountain,
  Palette,
  Zap,
  Navigation,
  Ticket,
  Bus,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import API_BASE from '@/lib/api/klookApi';

const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(m => ({ default: m.LoadingSpinner })));

// Icon mapping function
const getCategoryIcon = (categoryName, categoryId) => {
  const name = categoryName.toLowerCase();

  if (name.includes('transport') || name.includes('mobility')) return Bus;
  if (name.includes('hotel') || name.includes('accommodation')) return Hotel;
  if (name.includes('car') || name.includes('rental')) return Car;
  if (name.includes('cruise') || name.includes('ship')) return Ship;
  if (name.includes('train') || name.includes('rail')) return Train;
  if (name.includes('attraction') || name.includes('ticket')) return Ticket;
  if (name.includes('tour') || name.includes('experience')) return MapPin;
  if (name.includes('food') || name.includes('dining')) return Utensils;
  if (name.includes('luggage') || name.includes('travel')) return Luggage;
  if (name.includes('entertainment') || name.includes('movie')) return Film;
  if (name.includes('shopping')) return ShoppingBag;
  if (name.includes('spa') || name.includes('beauty')) return Heart;
  if (name.includes('activity') || name.includes('sport')) return Zap;
  if (name.includes('culture') || name.includes('museum')) return Palette;
  if (name.includes('photo')) return Camera;
  if (name.includes('cafe')) return Coffee;
  if (name.includes('nature') || name.includes('park')) return Mountain;

  return MapPin;
};

const CategoriesPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = searchParams.get('limit') || '100';
  const page = searchParams.get('page') || '1';

  const [categoriesData, setCategoriesData] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    mainCategories: 0,
    subCategories: 0,
    leafCategories: 0,
    total: 0
  });

  // Filter function to exclude abandoned categories
  const filterAbandonedCategories = useCallback((categories) => {
    return categories.map(category => ({
      ...category,
      sub_category: category.sub_category?.map(subCategory => ({
        ...subCategory,
        leaf_category: subCategory.leaf_category?.filter(leafCategory => 
          !leafCategory.name.toLowerCase().includes('abandoned') &&
          !leafCategory.name.toLowerCase().includes('do not use')
        )
      })).filter(subCategory => 
        !subCategory.name.toLowerCase().includes('abandoned') &&
        !subCategory.name.toLowerCase().includes('do not use')
      )
    })).filter(category => 
      !category.name.toLowerCase().includes('abandoned') &&
      !category.name.toLowerCase().includes('do not use')
    );
  }, []);

  // Calculate category statistics
  const calculateStats = useCallback((categories) => {
    let mainCount = categories.length;
    let subCount = 0;
    let leafCount = 0;

    categories.forEach(category => {
      if (category.sub_category) {
        subCount += category.sub_category.length;
        category.sub_category.forEach(subCategory => {
          if (subCategory.leaf_category) {
            leafCount += subCategory.leaf_category.length;
          }
        });
      }
    });

    return {
      mainCategories: mainCount,
      subCategories: subCount,
      leafCategories: leafCount,
      total: mainCount + subCount + leafCount
    };
  }, []);

  // Fetch categories data
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const apiUrl = new URL(`${API_BASE}/klook/categories`);
        apiUrl.searchParams.append('limit', limit);
        apiUrl.searchParams.append('page', page);

        const [res] = await Promise.all([
          fetch(apiUrl.toString(), {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }),
          new Promise(resolve => setTimeout(resolve, 500))
        ]);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();

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

        // Filter out abandoned categories
        const filteredCategories = filterAbandonedCategories(categories);

        // Calculate statistics
        const categoryStats = calculateStats(filteredCategories);
        setStats(categoryStats);

        setCategoriesData(filteredCategories);
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
  }, [limit, page, calculateStats, filterAbandonedCategories]);

  const handleSubCategoryClick = (categoryId) => {
    router.push(`/activities?category_id=${categoryId}`);
  };

  const toggleCategoryExpansion = (categoryId, event) => {
    if (event) event.stopPropagation();
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleMainCategoryClick = (category) => {
    if (!category.sub_category || category.sub_category.length === 0) {
      handleSubCategoryClick(category.id);
    } else {
      toggleCategoryExpansion(category.id);
    }
  };

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

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>

      {/* Enhanced Header Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight mb-6">
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
                Discover {stats.total} categories organized across {stats.mainCategories} main categories
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-2xl">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.mainCategories}</div>
              <div className="text-xs md:text-sm text-gray-600">Main Categories</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.subCategories}</div>
              <div className="text-xs md:text-sm text-gray-600">Sub Categories</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.leafCategories}</div>
              <div className="text-xs md:text-sm text-gray-600">Leaf Categories</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-orange-600">{stats.total}</div>
              <div className="text-xs md:text-sm text-gray-600">Total Categories</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          {isLoading && (
            <div className="flex flex-col lg:flex-row h-96 bg-white rounded-2xl shadow-lg">
              {/* Desktop skeleton */}
              <div className="hidden lg:block w-1/3 border-r border-gray-200 py-6">
                <div className="space-y-2 px-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block w-2/3 py-6 px-8">
                <div className="grid grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-1">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile skeleton */}
              <div className="lg:hidden p-4">
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isLoading && categoriesData.length > 0 && (
              <motion.div
                key="categories"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Desktop Layout - Single Column (Same as mobile but with better styling) */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {categoriesData.map((category) => {
                        const IconComponent = getCategoryIcon(category.name, category.id);
                        const isExpanded = expandedCategories.has(category.id);

                        return (
                          <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleMainCategoryClick(category)}
                              className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <IconComponent size={20} className="flex-shrink-0 text-blue-500" />
                              <div className="flex-1">
                                <span className="text-sm font-medium block">{category.name}</span>
                                <span className="text-xs text-gray-500">ID: {category.id}</span>
                              </div>
                              {category.sub_category && category.sub_category.length > 0 && (
                                <ChevronDown
                                  size={16}
                                  className={`transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </button>

                            {isExpanded && category.sub_category && (
                              <div className="border-t border-gray-200 bg-gray-50">
                                <div className="p-4 space-y-4">
                                  {category.sub_category.map((subCategory) => (
                                    <div key={subCategory.id}>
                                      <div className="mb-2">
                                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                          {subCategory.name}
                                        </h4>
                                        <span className="text-xs text-gray-400">ID: {subCategory.id}</span>
                                      </div>
                                      <div className="space-y-1">
                                        {subCategory.leaf_category?.map((leafCategory) => (
                                          <button
                                            key={leafCategory.id}
                                            onClick={() => handleSubCategoryClick(leafCategory.id)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors group"
                                          >
                                            <div className="flex justify-between items-center">
                                              <span>{leafCategory.name}</span>
                                              <span className="text-xs text-gray-400 group-hover:text-blue-400">ID: {leafCategory.id}</span>
                                            </div>
                                          </button>
                                        ))}
                                        {(!subCategory.leaf_category || subCategory.leaf_category.length === 0) && (
                                          <button
                                            onClick={() => handleSubCategoryClick(subCategory.id)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors group"
                                          >
                                            <div className="flex justify-between items-center">
                                              <span>Explore {subCategory.name}</span>
                                              <span className="text-xs text-gray-400 group-hover:text-blue-400">ID: {subCategory.id}</span>
                                            </div>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile Layout - Single Column */}
                <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mt-6">
                  <div className="space-y-2">
                    {categoriesData.map((category) => {
                      const IconComponent = getCategoryIcon(category.name, category.id);
                      const isExpanded = expandedCategories.has(category.id);

                      return (
                        <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                          <button
                            onClick={() => handleMainCategoryClick(category)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left text-gray-700 hover:bg-gray-50"
                          >
                            <IconComponent size={18} className="flex-shrink-0 text-blue-500" />
                            <div className="flex-1">
                              <span className="text-sm font-medium block">{category.name}</span>
                              <span className="text-xs text-gray-500">ID: {category.id}</span>
                            </div>
                            {category.sub_category && category.sub_category.length > 0 && (
                              <ChevronDown
                                size={14}
                                onClick={(e) => toggleCategoryExpansion(category.id, e)}
                                className={`transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </button>

                          {isExpanded && category.sub_category && (
                            <div className="ml-6 mt-1 space-y-2 pb-2">
                              {category.sub_category.map((subCategory) => (
                                <div key={subCategory.id}>
                                  <div className="mb-1">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                      {subCategory.name}
                                    </h4>
                                    <span className="text-xs text-gray-400">ID: {subCategory.id}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {subCategory.leaf_category?.map((leafCategory) => (
                                      <button
                                        key={leafCategory.id}
                                        onClick={() => handleSubCategoryClick(leafCategory.id)}
                                        className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors group"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="flex-1 pr-2">{leafCategory.name}</span>
                                          <span className="text-xs text-gray-400 group-hover:text-blue-400 flex-shrink-0">ID: {leafCategory.id}</span>
                                        </div>
                                      </button>
                                    ))}
                                    {(!subCategory.leaf_category || subCategory.leaf_category.length === 0) && (
                                      <button
                                        onClick={() => handleSubCategoryClick(subCategory.id)}
                                        className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors group"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="flex-1 pr-2">Explore {subCategory.name}</span>
                                          <span className="text-xs text-gray-400 group-hover:text-blue-400 flex-shrink-0">ID: {subCategory.id}</span>
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {!isLoading && categoriesData.length === 0 && (
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