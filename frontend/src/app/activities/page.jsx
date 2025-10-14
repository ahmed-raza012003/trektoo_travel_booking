'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

// Full Screen Loader Component
const FullScreenLoader = ({ isVisible, progress = 0 }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 z-[9999] flex items-center justify-center"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sun */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg"
        >
          <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full"></div>
          {/* Sun rays */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-yellow-300 rounded-full"></div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-yellow-300 rounded-full"></div>
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-yellow-300 rounded-full"></div>
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-yellow-300 rounded-full"></div>
          <div className="absolute -top-1 -left-1 w-1 h-3 bg-yellow-300 rounded-full transform rotate-45"></div>
          <div className="absolute -top-1 -right-1 w-1 h-3 bg-yellow-300 rounded-full transform -rotate-45"></div>
          <div className="absolute -bottom-1 -left-1 w-1 h-3 bg-yellow-300 rounded-full transform -rotate-45"></div>
          <div className="absolute -bottom-1 -right-1 w-1 h-3 bg-yellow-300 rounded-full transform rotate-45"></div>
        </motion.div>

        {/* Clouds */}
        <motion.div
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-8 w-12 h-6 bg-white/80 rounded-full"
        >
          <div className="absolute -top-2 left-2 w-8 h-8 bg-white/80 rounded-full"></div>
          <div className="absolute -top-1 right-2 w-6 h-6 bg-white/80 rounded-full"></div>
        </motion.div>

        <motion.div
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 right-16 w-10 h-5 bg-white/70 rounded-full"
        >
          <div className="absolute -top-1 left-1 w-6 h-6 bg-white/70 rounded-full"></div>
          <div className="absolute -top-1 right-1 w-5 h-5 bg-white/70 rounded-full"></div>
        </motion.div>

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-600 to-gray-400">
          {/* Road lines */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400 transform -translate-y-1/2">
            <div className="absolute left-0 top-0 w-8 h-full bg-yellow-400"></div>
            <div className="absolute left-16 top-0 w-8 h-full bg-yellow-400"></div>
            <div className="absolute left-32 top-0 w-8 h-full bg-yellow-400"></div>
            <div className="absolute left-48 top-0 w-8 h-full bg-yellow-400"></div>
            <div className="absolute left-64 top-0 w-8 h-full bg-yellow-400"></div>
            <div className="absolute left-80 top-0 w-8 h-full bg-yellow-400"></div>
            <div className="absolute left-96 top-0 w-8 h-full bg-yellow-400"></div>
          </div>
        </div>
      </div>

      {/* Car Animation */}
      <motion.div
        animate={{ x: [-100, 1200] }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute bottom-20 w-16 h-8"
      >
        {/* Car Body */}
        <div className="relative w-full h-full">
          {/* Car body */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-t-lg shadow-lg">
            <div className="absolute top-1 left-1 right-1 h-2 bg-red-400 rounded-t-sm"></div>
          </div>
          
          {/* Windows */}
          <div className="absolute top-1 left-1 w-3 h-3 bg-blue-200 rounded-sm"></div>
          <div className="absolute top-1 right-1 w-3 h-3 bg-blue-200 rounded-sm"></div>
          
          {/* Wheels */}
          <div className="absolute -bottom-1 left-1 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-600"></div>
          <div className="absolute -bottom-1 right-1 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-600"></div>
          
          {/* Headlights */}
          <div className="absolute top-2 left-0 w-1 h-1 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-2 right-0 w-1 h-1 bg-yellow-300 rounded-full"></div>
        </div>
      </motion.div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
            ></motion.div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          Finding Best Activities for You
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-gray-600 mb-8"
        >
          Discovering amazing experiences...
        </motion.p>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            ></motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-gray-500 mt-2"
          >
            {progress}% Complete
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};
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
import categoriesCache from '@/lib/cache/categoriesCache';
// Images are now loaded directly from database - no complex hook needed

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
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [totalAvailableActivities, setTotalAvailableActivities] = useState(0);
  const [isSearchProcessing, setIsSearchProcessing] = useState(false);
  const [loadingButtonId, setLoadingButtonId] = useState(null); // Track which button is loading

  // Note: Images are now loaded directly from database - no need for complex image loading

  // Function to get the best available image for an activity
  const getActivityImage = (activity) => {
    // Use database image if available
    if (activity.primary_image_url) {
      return activity.primary_image_url;
    }
    
    // Fallback to default image
    return `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&crop=center`;
  };

  // Function to handle button click with loading state
  const handleButtonClick = (activityId) => {
    setLoadingButtonId(activityId);
    // The Link will handle navigation, but we keep the loading state
    // until the page actually changes
  };

  // Clear loading state when component unmounts or when navigation occurs
  useEffect(() => {
    const handleBeforeUnload = () => {
      setLoadingButtonId(null);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setLoadingButtonId(null);
    };
  }, []);

  // Function to get category-specific background image
  const getCategoryBackgroundImage = (categoryData) => {
    if (!categoryData) {
      return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop&crop=center';
    }

    const categoryBackgrounds = {
      // Main Categories
      'THINGS TO DO': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop&crop=center',
      'MOBILITY TRANSPORTATION': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&h=1080&fit=crop&crop=center',
      'CAR SERVICES': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'TRAVEL CONVENIENCE': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&crop=center',
      'FOOD & DINING': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      'HOTEL': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&crop=center',
      'Entertainment': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&crop=center',
      'Transportation Pass': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&h=1080&fit=crop&crop=center',
      'Cruise_': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Spa & Beauty
      'Spa & Beauty': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center',
      'Spa & Massage': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center',
      'Salon & Beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Theme Parks & Water Parks
      'Theme Parks & Water Parks ': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      'Theme park': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      'Water Parks': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Attractions
      'Attractions ': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Museums & Galleries': 'https://images.unsplash.com/photo-1555529902-1a05eb6c1cd2?w=1920&h=1080&fit=crop&crop=center',
      'Aquariums': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Zoos & Animal Parks': 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=1920&h=1080&fit=crop&crop=center',
      'Gardens & Parks': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Observation Decks & Towers': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Castles & Palaces': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Ancient Ruins': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Cathedral & Churches': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Temples & Shrines': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Natural Landscape': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Activities & Experiences
      'Activities & Experiences': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      'Wellness & Health': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center',
      'Fitness & Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center',
      'Dining Experiences': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      'Surfing': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Kayaking': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Other Water Sports': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Biking & Segway & Scooter': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'Go Karting & Racing': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'Sightseeing Cruise': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Boats & Yachts & Catamarans': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Skydiving': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      'Golf': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'Photography': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Cooking Classes': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      'Beverage Tastings': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      'Nightlife & Pub Crawls': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&crop=center',
      'Hot Spring': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center',
      'Diving & Snorkeling': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Hot Air Ballon': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      'Flight & Helicopter': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      'Skiing & Snow Sports': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      'Climbing': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Tours
      'Tours': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Walking Tour': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
      'Bicycle Tours': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'Bus Tour': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&h=1080&fit=crop&crop=center',
      'Car Tour': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'Railway Tour': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&h=1080&fit=crop&crop=center',
      'Cruise Tour': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Boat Tours': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop&crop=center',
      'Food & Drinks Tour': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Transportation
      'Public Transfer - Non-API': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&h=1080&fit=crop&crop=center',
      'Private Transfer - Non-API': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'Car Rental - Non-API': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      'Charter - Non-API': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Travel Convenience
      'Luggage Services': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&crop=center',
      'Travel Equipment Rental': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&crop=center',
      'VIP Fast Ticket Service': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&crop=center',
      'Lounge': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Food & Dining
      'Food Coupon': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      'General Buffet': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      'Fine Dining': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      'Cafe & Dessert': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop&crop=center',
      
      // Sub Categories - Entertainment
      'Recurring Shows': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&crop=center',
      'Exhibition': 'https://images.unsplash.com/photo-1555529902-1a05eb6c1cd2?w=1920&h=1080&fit=crop&crop=center',
      'Movie': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&crop=center',
      'Shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&crop=center',
      'Carnival & Festival': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&crop=center',
      'Events-TTD': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&crop=center'
    };

    return categoryBackgrounds[categoryData.name] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop&crop=center';
  };

  // Function to get dynamic countries based on actual activities in the database
  const getRelatedCountriesForCategory = (categoryId) => {
    if (!allActivities || allActivities.length === 0) {
      // Fallback countries if no activities loaded yet
      return [
        { id: 'egypt', name: 'Egypt', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'egypt', activityCount: 0 },
        { id: 'united-arab-emirates', name: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'united arab emirates', activityCount: 0 },
        { id: 'saudi-arabia', name: 'Saudi Arabia', image: 'https://wttc.org/getContentAsset/74b76f6a-feeb-433c-acbe-9b214eafe547/489c4c4e-cfe8-42ba-91b1-27fe878007dd/Riyadh-skyline,-Saudi-Arabia.webp?language=en', searchTerm: 'saudi', activityCount: 0 },
        { id: 'indonesia', name: 'Indonesia', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'indonesia', activityCount: 0 },
        { id: 'thailand', name: 'Thailand', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'thailand', activityCount: 0 },
        { id: 'singapore', name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'singapore', activityCount: 0 }
      ];
    }

    // Filter activities by category
    const categoryActivities = allActivities.filter(activity => 
      parseInt(activity.category_id) === parseInt(categoryId)
    );

    console.log(`🔍 DEBUG - Category ${categoryId} activities:`, categoryActivities.length);

    // Extract unique countries from actual activities data
    const countryMap = new Map();
    
    categoryActivities.forEach(activity => {
      // Get country from various possible fields
      const countryName = activity.country_name || 
                         activity.location?.split(',')[1]?.trim() || 
                         activity.location_display?.split(',')[1]?.trim() ||
                         activity.city_name?.split(',')[1]?.trim() ||
                         'Unknown';
      
      if (countryName && countryName !== 'Unknown') {
        const normalizedCountry = countryName.toLowerCase().trim();
        
        if (!countryMap.has(normalizedCountry)) {
          // Create country object with image based on country name
          const countryImage = getCountryImage(countryName);
          const searchTerm = getCountrySearchTerm(countryName);
          
          countryMap.set(normalizedCountry, {
            id: normalizedCountry.replace(/\s+/g, '-'),
            name: countryName,
            image: countryImage,
            searchTerm: searchTerm,
            activityCount: 0
          });
        }
        
        // Increment activity count
        countryMap.get(normalizedCountry).activityCount++;
      }
    });

    // Convert map to array and sort by activity count
    const countriesWithActivities = Array.from(countryMap.values())
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 6); // Show top 6 countries

    console.log(`🌍 DEBUG - Dynamic countries for category ${categoryId}:`, countriesWithActivities);

    // If no countries found, return fallback
    if (countriesWithActivities.length === 0) {
      return [
        { id: 'egypt', name: 'Egypt', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'egypt', activityCount: 0 },
        { id: 'united-arab-emirates', name: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'united arab emirates', activityCount: 0 },
        { id: 'saudi-arabia', name: 'Saudi Arabia', image: 'https://wttc.org/getContentAsset/74b76f6a-feeb-433c-acbe-9b214eafe547/489c4c4e-cfe8-42ba-91b1-27fe878007dd/Riyadh-skyline,-Saudi-Arabia.webp?language=en', searchTerm: 'saudi', activityCount: 0 },
        { id: 'indonesia', name: 'Indonesia', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'indonesia', activityCount: 0 },
        { id: 'thailand', name: 'Thailand', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'thailand', activityCount: 0 },
        { id: 'singapore', name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', searchTerm: 'singapore', activityCount: 0 }
      ];
    }

    return countriesWithActivities;
  };

  // Helper function to get country image based on country name
  const getCountryImage = (countryName) => {
    const countryImages = {
      'japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'thailand': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'south korea': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'korea': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'indonesia': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'vietnam': 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'philippines': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'taiwan': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'hong kong': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'china': 'https://magsworldwide.com/wp-content/uploads/2017/07/China-1-1.jpg',
      'india': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'new zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'united states': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'usa': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'united kingdom': 'https://www.universitymagazine.ca/wp-content/uploads/2018/06/London.jpg',
      'uk': 'https://www.universitymagazine.ca/wp-content/uploads/2018/06/London.jpg',
      'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'germany': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'italy': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'spain': 'https://assets.vogue.com/photos/6603d64d13a27b5703522946/4:3/w_4000,h_3000,c_limit/509288876',
      'netherlands': 'https://images.unsplash.com/photo-1512470876302-972faa2aa914?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'switzerland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'austria': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'belgium': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'norway': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'sweden': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'denmark': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'finland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'iceland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'ireland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'portugal': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'greece': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'turkey': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'russia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'brazil': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'argentina': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'chile': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'mexico': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'canada': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'south africa': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'egypt': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'morocco': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'kenya': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'tanzania': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'uganda': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'sri lanka': 'https://i.natgeofe.com/n/6433f87f-9bc2-4ef6-861c-674c61d3d027/srilankacover.jpg',
      'cambodia': 'https://www.eyeonasia.gov.sg/images/asean-countries/Cambodia%20snapshot%20cover.jpg',
      'macau': 'https://welcometochina.com.au/wp-content/uploads/2010/06/macau-1140x646.jpg',
      'rwanda': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'botswana': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'namibia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'zimbabwe': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'zambia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'madagascar': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'mauritius': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'seychelles': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'comoros': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'reunion': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'mayotte': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      // Gulf Countries
      'united arab emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'uae': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'abu dhabi': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'saudi arabia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'qatar': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'kuwait': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'bahrain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'oman': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'iraq': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      'iran': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80'
    };
    
    return countryImages[countryName.toLowerCase()] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&crop=center';
  };

  // Helper function to get country search term
  const getCountrySearchTerm = (countryName) => {
    const searchTerms = {
      'japan': 'japan',
      'thailand': 'thailand',
      'singapore': 'singapore',
      'south korea': 'korea',
      'korea': 'korea',
      'indonesia': 'indonesia',
      'vietnam': 'vietnam',
      'malaysia': 'malaysia',
      'philippines': 'philippines',
      'taiwan': 'taiwan',
      'hong kong': 'hong kong',
      'china': 'china',
      'india': 'india',
      'australia': 'australia',
      'new zealand': 'new zealand',
      'united states': 'united states',
      'usa': 'united states',
      'united kingdom': 'uk',
      'uk': 'uk',
      'france': 'france',
      'germany': 'germany',
      'italy': 'italy',
      'spain': 'spain',
      'netherlands': 'netherlands',
      'switzerland': 'switzerland',
      'austria': 'austria',
      'belgium': 'belgium',
      'norway': 'norway',
      'sweden': 'sweden',
      'denmark': 'denmark',
      'finland': 'finland',
      'iceland': 'iceland',
      'ireland': 'ireland',
      'portugal': 'portugal',
      'greece': 'greece',
      'turkey': 'turkey',
      'russia': 'russia',
      'brazil': 'brazil',
      'argentina': 'argentina',
      'chile': 'chile',
      'mexico': 'mexico',
      'canada': 'canada',
      'south africa': 'south africa',
      'egypt': 'egypt',
      'morocco': 'morocco',
      'kenya': 'kenya',
      'tanzania': 'tanzania',
      'uganda': 'uganda',
      'rwanda': 'rwanda',
      'botswana': 'botswana',
      'namibia': 'namibia',
      'zimbabwe': 'zimbabwe',
      'zambia': 'zambia',
      'madagascar': 'madagascar',
      'mauritius': 'mauritius',
      'seychelles': 'seychelles',
      'comoros': 'comoros',
      'reunion': 'reunion',
      'mayotte': 'mayotte',
      // Gulf Countries
      'united arab emirates': 'united arab emirates',
      'uae': 'united arab emirates',
      'dubai': 'dubai',
      'abu dhabi': 'abu dhabi',
      'saudi arabia': 'saudi arabia',
      'qatar': 'qatar',
      'kuwait': 'kuwait',
      'bahrain': 'bahrain',
      'oman': 'oman',
      'iraq': 'iraq',
      'iran': 'iran'
    };
    
    return searchTerms[countryName.toLowerCase()] || countryName.toLowerCase();
  };


  // Images are now loaded directly from database - no preloading needed

  // Fast database fetch function - get all activities at once
  const fetchActivitiesFromDatabase = async (controller) => {
      try {
        setIsLoading(true);
        setError(null);
      setLoadingProgress(0);

        // Ensure minimum loading time for better UX
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));

      // First, fetch categories from database with caching
      setLoadingProgress(20);
      
      // Check cache first
      const cachedCategories = categoriesCache.getActivitiesPageCategories();
      let filteredCategories;
      
      if (cachedCategories) {
        console.log('📦 Using cached categories for activities page');
        filteredCategories = cachedCategories;
      } else {
        console.log('🌐 Fetching categories from API for activities page');
      const categoriesRes = await fetch(`${API_BASE}/simple-categories`, {
        signal: controller.signal,
      });
      
      if (!categoriesRes.ok) throw new Error(`Categories fetch failed: ${categoriesRes.status}`);
      const categoriesJson = await categoriesRes.json();
        const allCategoriesFromAPI = categoriesJson?.data?.categories || [];
        
        // Cache the raw categories first
        if (allCategoriesFromAPI.length > 0) {
          categoriesCache.setRawCategories(allCategoriesFromAPI);
        }
        
        // Get filtered categories for activities page
        filteredCategories = categoriesCache.getActivitiesPageCategories() || [];
      }
      
      setAllCategories(filteredCategories);
      console.log('🔍 DEBUG - Categories loaded for activities page:', filteredCategories.map(cat => ({ id: cat.id, name: cat.name })));
      setLoadingProgress(40);
      
      // Debug: Log available categories
      console.log('🔍 DEBUG - Available categories from database:', filteredCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        sub_categories: cat.sub_category?.length || 0,
        leaf_categories: cat.sub_category?.reduce((total, sub) => total + (sub.leaf_category?.length || 0), 0) || 0
      })));

      // Fetch ALL activities from database
      setLoadingProgress(60);
      const activitiesRes = await fetch(`${API_BASE}/klook/activities?limit=25000`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
      });

      if (!activitiesRes.ok) throw new Error(`Activities fetch failed: ${activitiesRes.status}`);
      setLoadingProgress(80);
      const activitiesData = await activitiesRes.json();
      
      console.log('🔍 DEBUG - API Response:', activitiesData);
      
      if (!activitiesData?.success || !activitiesData?.data?.activity?.activity_list) {
        console.error('❌ Invalid API response format:', activitiesData);
        throw new Error('Invalid API response format');
      }

      // Debug: Log sample activities to check category_id field
      const sampleActivities = activitiesData.data.activity.activity_list.slice(0, 3);
      console.log('🔍 DEBUG - Sample activities:', sampleActivities.map(activity => ({
        id: activity.activity_id,
        title: activity.title,
        category_id: activity.category_id,
        category_id_type: typeof activity.category_id
      })));

      setLoadingProgress(90);
      const allActivitiesData = activitiesData.data.activity.activity_list;
      const totalCount = activitiesData.data.activity.total || allActivitiesData.length;
      
      console.log(`🚀 Database loaded: ${allActivitiesData.length} activities instantly!`);
      console.log(`📊 Total activities in database: ${totalCount}`);
      setTotalAvailableActivities(totalCount);
      setAllActivities(allActivitiesData);
      setLoadingProgress(100);
      
      // Small delay to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Wait for minimum loading time
      await minLoadingTime;
      
      setHasInitialData(true);
      setIsLoading(false);

      return { activities: allActivitiesData, categories: filteredCategories };

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
        setShowFullScreenLoader(true);
        const { activities, categories } = await fetchActivitiesFromDatabase(controller);
        
        // Apply initial filtering immediately
        applyFilters(activities, categories, selectedCategoryFilter, searchQuery);

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching activities:', err);
          setError(`Failed to load activities: ${err.message}`);
        }
        setHasInitialData(true);
        setIsLoading(false);
      } finally {
        // Hide full screen loader after 20 seconds
        setTimeout(() => {
          setShowFullScreenLoader(false);
        }, 20000);
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
      let targetCategory = null;
      let validCategoryIds = [parseInt(categoryFilter)]; // Always include the clicked category ID
      
      // Search for the category in the hierarchy
      const findCategoryInHierarchy = (categories, targetId) => {
        for (const category of categories) {
          // Check main category
          if (category.id == targetId) {
            return { category, type: 'main' };
          }
          
          // Check sub-categories
          if (category.sub_category && Array.isArray(category.sub_category)) {
            for (const subCategory of category.sub_category) {
              if (subCategory.id == targetId) {
                return { category: subCategory, type: 'sub', parent: category };
              }
              
              // Check leaf categories
              if (subCategory.leaf_category && Array.isArray(subCategory.leaf_category)) {
                for (const leafCategory of subCategory.leaf_category) {
                  if (leafCategory.id == targetId) {
                    return { category: leafCategory, type: 'leaf', parent: subCategory, grandParent: category };
                  }
                }
              }
            }
          }
        }
        return null;
      };

      const foundCategory = findCategoryInHierarchy(categories, categoryFilter);
      
      console.log('🔍 DEBUG - Looking for category ID:', categoryFilter);
      console.log('🔍 DEBUG - Available categories:', categories.map(cat => ({ id: cat.id, name: cat.name })));
      console.log('🔍 DEBUG - Found category:', foundCategory);
      
      if (foundCategory) {
        targetCategory = foundCategory.category;
        
        // If it's a main category, include all its sub and leaf categories
        if (foundCategory.type === 'main') {
          if (targetCategory.sub_category && Array.isArray(targetCategory.sub_category)) {
          targetCategory.sub_category.forEach(sub => {
              validCategoryIds.push(parseInt(sub.id));
              
              if (sub.leaf_category && Array.isArray(sub.leaf_category)) {
              sub.leaf_category.forEach(leaf => {
                  validCategoryIds.push(parseInt(leaf.id));
              });
            }
          });
        }
        }
        // If it's a sub-category, include all its leaf categories
        else if (foundCategory.type === 'sub') {
          if (targetCategory.leaf_category && Array.isArray(targetCategory.leaf_category)) {
            targetCategory.leaf_category.forEach(leaf => {
              validCategoryIds.push(parseInt(leaf.id));
            });
          }
        }
        // If it's a leaf category, only include that specific category (already added above)

        setCategoryData(targetCategory);

        // Remove duplicates
        validCategoryIds = [...new Set(validCategoryIds)];

        console.log('🔍 DEBUG - Category filter applied:', {
          categoryName: targetCategory.name,
          categoryType: foundCategory.type,
          validIds: validCategoryIds,
          totalActivities: filtered.length
        });

        // Debug: Check what category IDs actually exist in activities
        const uniqueCategoryIds = [...new Set(filtered.map(activity => activity.category_id))].sort((a, b) => a - b);
        console.log('🔍 DEBUG - Available category IDs in activities:', uniqueCategoryIds.slice(0, 20), '... (showing first 20)');
        console.log('🔍 DEBUG - Looking for category ID in activities:', categoryFilter, 'Type:', typeof categoryFilter);
        console.log('🔍 DEBUG - Valid category IDs to match:', validCategoryIds);
        
        const beforeFilterCount = filtered.length;
        
        // Debug: Show sample activities before filtering
        const sampleBeforeFilter = filtered.slice(0, 3).map(activity => ({
          id: activity.activity_id,
          title: activity.title,
          category_id: activity.category_id,
          category_id_type: typeof activity.category_id
        }));
        console.log('🔍 DEBUG - Sample activities before filter:', sampleBeforeFilter);
        
        filtered = filtered.filter(activity => {
          const activityCategoryId = parseInt(activity.category_id);
          const isMatch = validCategoryIds.includes(activityCategoryId);
          
          // Debug: Log first few matches/non-matches
          if (sampleBeforeFilter.some(s => s.id === activity.activity_id)) {
            console.log(`🔍 DEBUG - Activity ${activity.activity_id} (${activity.title}): category_id=${activityCategoryId}, validIds=${validCategoryIds}, match=${isMatch}`);
          }
          
          return isMatch;
        });
        
        console.log('🔍 DEBUG - Filter results:', {
          before: beforeFilterCount,
          after: filtered.length,
          categoryId: categoryFilter,
          validCategoryIds: validCategoryIds
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
    console.log('🔍 DEBUG - handleCategoryFilterChange called with:', categoryId);
    setShowFullScreenLoader(true);
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
    
    // Hide loader after 20 seconds
    setTimeout(() => {
      setShowFullScreenLoader(false);
    }, 20000);
  };



  // Dynamic search that works as you type
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Debounced search effect with minimum 3 characters
  useEffect(() => {
    if (searchQuery !== activeSearchQuery) {
      setIsSearchProcessing(true);
    }
    
    const timeoutId = setTimeout(() => {
      // Only search if query has at least 3 characters or is empty (to clear search)
      if (searchQuery.trim().length >= 3 || searchQuery.trim().length === 0) {
    setActiveSearchQuery(searchQuery);
      setIsSearchProcessing(false);
      
      // Update URL without page reload
      const params = new URLSearchParams(searchParams.toString());
        if (searchQuery.trim() && searchQuery.trim().length >= 3) {
        params.set('search', searchQuery);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.replace(`/activities?${params.toString()}`, { scroll: false });
      } else {
        // If less than 3 characters, don't search but stop processing indicator
        setIsSearchProcessing(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeSearchQuery, searchParams, router]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowFullScreenLoader(true);
      // Search is already handled by handleSearchChange
      // Hide loader after 20 seconds
      setTimeout(() => {
        setShowFullScreenLoader(false);
      }, 20000);
    }
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

  // Full page loader for initial data fetching
  if (isLoading && !hasInitialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-md mx-auto px-6"
        >
          {/* Main Loading Spinner */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
            <div className="absolute inset-2 w-20 h-20 border-4 border-blue-100 rounded-full animate-spin border-t-blue-500"></div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-800"
            >
              Fetching Activities
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg"
            >
              Discovering amazing experiences for you...
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm text-blue-600">
                {/* <span>Loading from database...</span> */}
                <span className="font-semibold">{loadingProgress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>
          
          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center space-x-2"
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </motion.div>
          
          {/* Fun Loading Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-white/80 space-y-1 drop-shadow-lg"
          >
            <p>✨ Finding the best activities...</p>
            <p>🌟 Curating amazing experiences...</p>
            <p>🎯 Matching your interests...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Full Screen Loader */}
      <FullScreenLoader 
        isVisible={showFullScreenLoader} 
        progress={loadingProgress} 
      />
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

      {/* Header Section with Dynamic Background */}
      <div className="relative overflow-visible">
        {/* Dynamic Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${getCategoryBackgroundImage(categoryData)})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-purple-900/30"></div>
          
          {/* Bottom Blur Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              {categoryData ? `Discover Amazing ${categoryData.name}` : 'Discover Amazing'}{' '}
              <span className="text-blue-600 relative">
                Activities
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 2 100 2 198 10"
                    stroke="#FCD34D"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </motion.div>
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="space-y-6">
                {/* Animated Loading Spinner */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-500"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-300"></div>
                  </div>
                  
                  {/* Loading Text with Animation */}
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-white animate-pulse drop-shadow-lg">
                      Loading Amazing Activities
                    </h3>
                    <p className="text-sm text-white/90 drop-shadow-lg">
                      Discovering {totalActivities > 0 ? totalActivities : 'thousands of'} experiences for you...
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center justify-between text-sm text-white/90 mb-2 drop-shadow-lg">
                      <span>Loading activities from database...</span>
                      <span className="font-medium">{loadingProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Loading Dots Animation */}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
              {/* Removed the "Explore X activities in Category" text */}
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

        {/* Search and Filter Section - Now Inside Background */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >

          <motion.div variants={itemVariants} className="max-w-7xl mx-auto relative z-10 overflow-visible" style={{ overflow: 'visible' }}>
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
              {/* Simple Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities (min. 3 characters)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-20 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-800 placeholder-gray-500"
                />
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
                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                      <span className="text-xs text-gray-400">
                        {3 - searchQuery.length} more
                      </span>
                    )}
                </div>
              </form>

              {/* Category Filter */}
              <div className="relative" data-category-filter>
                <button
                  onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  <Filter className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">
                    {selectedCategoryFilter && categoryData?.name 
                      ? categoryData.name 
                      : 'All Categories'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${isCategoryFilterOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isCategoryFilterOpen && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-[99999] border border-blue-100 max-h-[500px] overflow-y-auto shadow-2xl" style={{ maxHeight: '500px', minHeight: '200px', position: 'absolute', top: '100%', left: '0' }}>
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
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters - Below Search Bar */}
            {(selectedCategoryFilter || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="text-sm text-white font-medium drop-shadow-lg">Active filters:</span>
                {selectedCategoryFilter && categoryData && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/30">
                    <span>{categoryData.name}</span>
                    <button
                      onClick={() => handleCategoryFilterChange('')}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/30">
                    <span>"{searchQuery}"</span>
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
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-white/90 hover:text-white underline drop-shadow-lg"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Controls - View Mode and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-[9999] border border-blue-100 overflow-visible">
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
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>

      {/* Related Countries Section */}
      <div className="relative mt-8">
        {categoryData && (
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Explore {categoryData.name} in Popular Destinations
              </h2>
              <p className="text-gray-600 text-lg">
                Discover amazing {categoryData.name.toLowerCase()} experiences around the world
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            >
              {getRelatedCountriesForCategory(categoryData.id).map((country, index) => (
                <motion.div
                  key={country.id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    // Navigate to activities with country filter
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('search', country.searchTerm);
                    params.set('page', '1');
                    router.push(`/activities?${params.toString()}`);
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-48">
                    <img
                      src={country.image}
                      alt={country.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg drop-shadow-lg group-hover:text-blue-300 transition-colors">
                        {country.name}
                      </h3>
                      {country.activityCount > 0 && (
                        <p className="text-white/90 text-sm drop-shadow-md mt-1">
                          {country.activityCount} experiences
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10 ${searchQuery ? 'mt-12' : 'mt-8'}`}>
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          {isLoading && (
            <div className="py-8">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <CardSkeleton />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <CardSkeleton />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filter Loading Overlay */}
          {isFilterLoading && !isLoading && (
            <div className="relative">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-white px-6 py-4 rounded-full shadow-xl border border-blue-100"
                >
                  <div className="relative">
                    <div className="w-6 h-6 border-3 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    <div className="absolute inset-0 w-6 h-6 border-3 border-transparent rounded-full animate-ping border-t-blue-400"></div>
                </div>
                  <div className="flex flex-col">
                    <span className="text-blue-600 font-semibold text-sm">Applying filters...</span>
                    <span className="text-blue-500 text-xs">Please wait</span>
                  </div>
                </motion.div>
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
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                    : 'space-y-8'
                }
              >
                {sortedActivities.map((activity, index) => (
                  <motion.div
                    key={activity.activity_id}
                    variants={itemVariants}
                    custom={index}
                    className={`group activity-card bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-gray-100 relative cursor-pointer hover:-translate-y-1 ${
                      viewMode === 'list' 
                        ? 'flex flex-row h-96' 
                        : 'flex flex-col h-full'
                      }`}
                  >
                    {/* Activity Image */}
                    <div 
                      className={`relative overflow-hidden ${
                        viewMode === 'list' 
                          ? 'w-72 flex-shrink-0 h-full' 
                          : 'h-64'
                      }`}
                    >
                      <img
                        src={getActivityImage(activity)}
                        alt={activity.image_alt_text || activity.title}
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                          viewMode === 'list' ? 'object-center' : ''
                        }`}
                        loading="lazy"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFavoriteToggle(activity.activity_id)}
                        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/95 backdrop-blur-md border border-white/20 hover:bg-white transition-all shadow-xl hover:shadow-2xl"
                      >
                        <Heart
                          className={`h-5 w-5 transition-all duration-300 ${favorites.has(activity.activity_id)
                            ? 'text-red-500 fill-current scale-110'
                            : 'text-gray-600 hover:text-red-400'
                            }`}
                        />
                      </motion.button>

                      {/* Rating Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-lg px-4 py-2 rounded-full text-sm shadow-xl border border-white/30">
                          <Star className="h-4 w-4 text-amber-500 fill-current" />
                          <span className="font-bold text-gray-800">{activity.rating}</span>
                          <span className="text-gray-500 text-xs">({activity.review_count})</span>
                        </div>
                      </div>

                      {/* 27% Off Badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-2xl border border-blue-500/30 backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-300">
                          <div className="flex flex-col items-center">
                            <span className="text-xs opacity-90">SAVE</span>
                            <span className="text-lg font-black">27%</span>
                          </div>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm shadow-xl border border-white/20">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{activity.duration}</span>
                        </div>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm shadow-xl border border-white/20">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-bold text-lg">{activity.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Info */}
                    <div className={`flex-1 flex flex-col ${
                      viewMode === 'list' ? 'p-5 pb-6 min-h-0' : 'p-6'
                    }`}>
                      {/* Top Content */}
                      <div className="flex-1">
                        {/* Title and Category */}
                        <div className={`${viewMode === 'list' ? 'mb-4' : 'mb-4'}`}>
                          <h3 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight ${
                            viewMode === 'list' ? 'text-2xl mb-3' : 'text-xl line-clamp-2 mb-2'
                          }`}>
                          {activity.title}
                        </h3>
                          <p className={`text-gray-600 leading-relaxed ${
                            viewMode === 'list' ? 'text-base line-clamp-3' : 'line-clamp-2 text-sm'
                          }`}>
                        {activity.sub_title}
                      </p>
                        </div>

                      {/* Location */}
                        <div className={`flex items-center gap-3 text-gray-600 ${
                          viewMode === 'list' ? 'mb-4' : 'mb-4'
                        }`}>
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-medium text-gray-800 ${
                              viewMode === 'list' ? 'text-base' : 'text-sm'
                            }`}>
                              {activity.location_display || activity.location || 'Various Locations'}
                            </span>
                            {activity.country_name && (
                              <span className={`text-blue-600 font-semibold ${
                                viewMode === 'list' ? 'text-sm' : 'text-xs'
                              }`}>
                                {activity.country_name}
                              </span>
                            )}
                          </div>
                      </div>

                      {/* Highlights */}
                        <div className={`space-y-2 ${
                          viewMode === 'list' ? 'mb-4' : 'mb-5'
                        }`}>
                          {activity.highlights.slice(0, viewMode === 'list' ? 3 : 2).map((highlight, idx) => (
                            <div key={idx} className={`flex items-start gap-3 text-gray-600 ${
                              viewMode === 'list' ? 'text-sm' : 'text-sm'
                            }`}>
                              <div className="p-1 bg-blue-50 rounded-md mt-0.5">
                                <Award className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className={`leading-relaxed ${
                                viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-1'
                              }`}>{highlight}</span>
                          </div>
                        ))}
                      </div>

                      {/* Availability */}
                        <div className={`flex items-center gap-2 ${
                          viewMode === 'list' ? 'mb-4' : 'mb-5'
                        }`}>
                          <div className="flex items-center gap-1.5 text-green-600">
                            <Calendar className="h-4 w-4" />
                            <span className={`font-medium ${
                              viewMode === 'list' ? 'text-base' : 'text-sm'
                            }`}>
                          Available: {activity.available_dates[0]}
                        </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Content - Button */}
                      <div className="mt-auto pt-2">
                      <Link href={`/activity/${activity.activity_id}`}>
                        <motion.button
                          whileHover={loadingButtonId === activity.activity_id ? {} : { scale: 1.02 }}
                          whileTap={loadingButtonId === activity.activity_id ? {} : { scale: 0.98 }}
                          onClick={() => handleButtonClick(activity.activity_id)}
                          disabled={loadingButtonId === activity.activity_id}
                          className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group/btn btn-shimmer ${
                            loadingButtonId === activity.activity_id 
                              ? 'opacity-75 cursor-not-allowed' 
                              : ''
                          } ${
                              viewMode === 'list' 
                                ? 'py-4 px-8 text-base' 
                                : 'py-3.5 px-6 text-sm'
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loadingButtonId === activity.activity_id ? (
                                <>
                                  <motion.div
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                  />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  View Details & Book
                                  <motion.div
                                    className="w-4 h-4"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                  >
                                    →
                                  </motion.div>
                                </>
                              )}
                            </span>
                            {loadingButtonId !== activity.activity_id && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                            )}
                        </motion.button>
                      </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!isLoading && sortedActivities.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No activities found</h2>
                <p className="text-gray-600 mb-6">
                  {searchQuery && categoryData?.name
                    ? `No activities found for "${searchQuery}" in ${categoryData.name} category.`
                    : searchQuery
                    ? `No activities found for "${searchQuery}".`
                    : categoryData?.name
                    ? `No activities found in ${categoryData.name} category.`
                    : "No activities match your current filters."}
                </p>
                <div className="space-y-4">
                  <p className="text-gray-500 text-sm">
                    Try adjusting your search or browse different categories
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                    >
                      Clear All Filters
                    </button>
                    <Link href="/activities-categories">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-lg hover:shadow-xl"
                      >
                        Browse All Categories
                      </motion.button>
                    </Link>
                  </div>
                </div>
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