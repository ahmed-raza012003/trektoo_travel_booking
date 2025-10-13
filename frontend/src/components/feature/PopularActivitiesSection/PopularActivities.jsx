'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Star, Clock, DollarSign, Award, Calendar, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import API_BASE from '@/lib/api/klookApi';

const PopularActivities = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  // Function to get the best available image for an activity
  const getActivityImage = (activity) => {
    // Use database image if available
    if (activity.primary_image_url) {
      return activity.primary_image_url;
    }
    
    // Fallback to default image
    return `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&crop=center`;
  };

  // Fetch specific activities: SKI, SKY DIVING, DIVING, BALI CRUISE with caching
  useEffect(() => {
    const fetchSpecificActivities = async () => {
      try {
        // Check cache first
        const cacheKey = 'top-picks-activities';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}-timestamp`);
        
        // Check if cache is valid (1 hour = 3600000 ms)
        if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 3600000) {
          setActivities(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        // Predefined activities for Top Picks
        const topPicksActivities = [
          {
            activity_id: 'ski-1',
            title: 'Ski Adventure in the Alps',
            sub_title: 'Experience world-class skiing with professional instructors',
            price: 299,
            currency: 'USD',
            rating: '4.8',
            review_count: 1247,
            duration: '8 hours',
            location: 'Switzerland, France',
            highlights: [
              'Professional ski instructor',
              'All equipment included',
              'Mountain lift passes',
              'Hot chocolate breaks'
            ],
            available_dates: ['Today', 'Tomorrow', 'This Weekend'],
            primary_image_url: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=600&fit=crop&crop=center'
          },
          {
            activity_id: 'skydiving-1',
            title: 'Ultimate Skydiving Experience',
            sub_title: 'Jump from 15,000ft with tandem instructor',
            price: 199,
            currency: 'USD',
            rating: '4.9',
            review_count: 892,
            duration: '3 hours',
            location: 'Dubai, UAE',
            highlights: [
              'Tandem skydiving with instructor',
              'Safety briefing included',
              'Certificate of achievement',
              'Video and photos package'
            ],
            available_dates: ['Today', 'Tomorrow', 'This Weekend'],
            primary_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center'
          },
          {
            activity_id: 'diving-1',
            title: 'Scuba Diving Adventure',
            sub_title: 'Explore underwater world with certified divers',
            price: 149,
            currency: 'USD',
            rating: '4.7',
            review_count: 1563,
            duration: '6 hours',
            location: 'Red Sea, Egypt',
            highlights: [
              'PADI certified instructor',
              'All diving equipment',
              'Underwater photography',
              'Marine life spotting'
            ],
            available_dates: ['Today', 'Tomorrow', 'This Weekend'],
            primary_image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=center'
          },
          {
            activity_id: 'bali-cruise-1',
            title: 'Bali Sunset Cruise Experience',
            sub_title: 'Luxury yacht cruise with dinner and entertainment',
            price: 89,
            currency: 'USD',
            rating: '4.6',
            review_count: 2104,
            duration: '4 hours',
            location: 'Bali, Indonesia',
            highlights: [
              'Luxury yacht experience',
              'Gourmet dinner included',
              'Sunset viewing',
              'Live entertainment'
            ],
            available_dates: ['Today', 'Tomorrow', 'This Weekend'],
            primary_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center'
          }
        ];
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(topPicksActivities));
        localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString());
        
        setActivities(topPicksActivities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Set fallback activities in case of error
        setActivities([
          {
            activity_id: '1',
            title: 'City Walking Tour',
            sub_title: 'Explore the hidden gems of the city with our expert guide',
            price: 89,
            currency: 'USD',
            rating: 4.8,
            review_count: 234,
            duration: '3 hours',
            location: 'Various Locations',
            highlights: ['Professional guide included', 'Small group experience', 'Instant confirmation'],
            available_dates: ['Today', 'Tomorrow', 'This Weekend'],
          },
          {
            activity_id: '2',
            title: 'Adventure Hiking',
            sub_title: 'Discover breathtaking mountain trails and scenic views',
            price: 129,
            currency: 'USD',
            rating: 4.9,
            review_count: 156,
            duration: '6 hours',
            location: 'Mountain Region',
            highlights: ['Equipment provided', 'Safety briefing', 'Photo opportunities'],
            available_dates: ['Today', 'Tomorrow', 'This Weekend'],
          },
          {
            activity_id: '3',
            title: 'Cultural Experience',
            sub_title: 'Immerse yourself in local traditions and authentic cuisine',
            price: 75,
            currency: 'USD',
            rating: 4.7,
            review_count: 189,
            duration: '4 hours',
            location: 'Historic District',
            highlights: ['Local guide', 'Traditional meals', 'Cultural insights'],
            available_dates: ['Today', 'Tomorrow', 'This Weekend'],
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificActivities();
  }, []);

  const handleFavoriteToggle = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  return (
    <section
      ref={ref}
      className="pt-20 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden"
      aria-labelledby="popular-activities-heading"
    >
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

      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-300/10 to-blue-500/10 rounded-full blur-lg"></div>

      <div className="container mx-auto px-10 w-[90vw] relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <h2
              id="popular-activities-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
              style={{
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              Top Picks{' '}
              <span className="text-blue-600 relative">
                for You
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
            </h2>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-gray-200"
              >
                <div className="h-64 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </motion.div>
            ))
          ) : (
            activities.map((activity) => (
              <motion.div
                key={activity.activity_id}
                variants={itemVariants}
                className="group activity-card bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-gray-100 relative cursor-pointer hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Activity Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getActivityImage(activity)}
                    alt={activity.image_alt_text || activity.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                <div className="flex-1 flex flex-col p-6">
                  {/* Top Content */}
                  <div className="flex-1">
                    {/* Title and Category */}
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight text-xl line-clamp-2 mb-2">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-2 text-sm">
                        {activity.sub_title}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-3 text-gray-600 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 text-sm">
                          {activity.location_display || activity.location || 'Various Locations'}
                        </span>
                        {activity.country_name && (
                          <span className="text-blue-600 font-semibold text-xs">
                            {activity.country_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2 mb-5">
                      {activity.highlights.slice(0, 2).map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-gray-600 text-sm">
                          <div className="p-1 bg-blue-50 rounded-md mt-0.5">
                            <Award className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="leading-relaxed line-clamp-1">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex items-center gap-1.5 text-green-600">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          Available: {activity.available_dates[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content - Button */}
                  <div className="mt-auto pt-2">
                    <Link href={`/activity/${activity.activity_id}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group/btn btn-shimmer py-3.5 px-6 text-sm"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          View Details & Book
                          <motion.div
                            className="w-4 h-4 flex items-center justify-center"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            →
                          </motion.div>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* View All Button */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mt-12"
        >
          <Link href="/activities">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              View All Activities
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularActivities;
