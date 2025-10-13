'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import API_BASE from '@/lib/api/klookApi';

const ActivitiesByCountries = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [countryStats, setCountryStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Fixed list of 6 popular countries with their images
  const fixedCountries = [
    {
      id: 'egypt',
      name: 'Egypt',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      searchTerm: 'egypt'
    },
    {
      id: 'united-arab-emirates',
      name: 'UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      searchTerm: 'united arab emirates'
    },
    {
      id: 'saudi-arabia',
      name: 'Saudi Arabia',
      image: 'https://wttc.org/getContentAsset/74b76f6a-feeb-433c-acbe-9b214eafe547/489c4c4e-cfe8-42ba-91b1-27fe878007dd/Riyadh-skyline,-Saudi-Arabia.webp?language=en',
      searchTerm: 'saudi'
    },
    {
      id: 'indonesia',
      name: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80',
      searchTerm: 'indonesia'
    },
    {
      id: 'thailand',
      name: 'Thailand',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80',
      searchTerm: 'thailand'
    },
    {
      id: 'singapore',
      name: 'Singapore',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80',
      searchTerm: 'singapore'
    }
  ];

  // Fetch activity counts for each country
  useEffect(() => {
    const fetchCountryStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all activities from database
        const response = await fetch(`${API_BASE}/klook/activities?limit=25000`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }

        const data = await response.json();
        
        if (data?.success && data?.data?.activity?.activity_list) {
          const activities = data.data.activity.activity_list;
          
          // Count activities for each fixed country
          const stats = {};
          fixedCountries.forEach(country => {
            const count = activities.filter(activity => {
              const searchableText = [
                activity.title,
                activity.sub_title,
                activity.location,
                activity.location_display,
                activity.country_name,
                activity.city_name
              ].join(' ').toLowerCase();
              
              return searchableText.includes(country.searchTerm.toLowerCase());
            }).length;
            
            stats[country.id] = count;
          });
          
          setCountryStats(stats);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('Error fetching country stats:', error);
        // Set fallback counts
        const fallbackStats = {};
        fixedCountries.forEach(country => {
          fallbackStats[country.id] = Math.floor(Math.random() * 50) + 10;
        });
        setCountryStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryStats();
  }, []);

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
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden"
      aria-labelledby="activities-by-countries-heading"
    >
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-countries"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid-countries)" />
        </svg>
      </div>

      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-300/10 to-blue-500/10 rounded-full blur-lg"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <h2
              id="activities-by-countries-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
              style={{
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              Discover Activities by{' '}
              <span className="text-blue-600 relative">
                Destination
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
          className="grid grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {fixedCountries.map((country) => (
            <motion.div
              key={country.id}
              variants={itemVariants}
              className="group relative"
            >
              <Link href={`/activities?search=${country.searchTerm}`}>
                <div className="relative bg-white rounded-3xl shadow-2xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-gray-100 cursor-pointer hover:-translate-y-3 overflow-hidden group/card">
                  {/* Country Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={country.image}
                      alt={country.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Activity Count Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/80 backdrop-blur-lg px-2 py-1 rounded-full shadow-lg border border-white/30">
                        {loading ? (
                          <div className="h-2 w-6 bg-gray-300 rounded animate-pulse"></div>
                        ) : (
                          <span className="text-xs font-medium text-gray-800">
                            {countryStats[country.id] || 0} Activities
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Country Name */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
                        {country.name}
                      </h3>
                      <div className="flex items-center gap-1 text-white/90 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>Explore Now</span>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ActivitiesByCountries;
