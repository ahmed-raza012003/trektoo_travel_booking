'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import toast, { Toaster } from 'react-hot-toast';
import {
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Car,
  Building,
  Ticket,
  Star,
  Shield,
  Heart,
  ArrowRight,
  CheckCircle,
  Users2,
  Globe,
} from 'lucide-react';
import DateInput from '@/components/ui/Custom/DateInput';
import { useLocations } from '@/hooks/useHotels';

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const serviceOptions = [
  {
    id: 'hotels',
    label: 'Hotels',
    icon: Building,
    available: true,
    route: '/hotels-list',
    color: 'from-blue-500 to-blue-600',
    description: 'Find the perfect stay',
  },
  {
    id: 'cars',
    label: 'Car Rentals',
    icon: Car,
    available: true,
    route: '/car-rentals',
    color: 'from-blue-500 to-blue-600',
    description: 'Rent your perfect ride',
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: Ticket,
    available: true,
    route: '/activities',
    color: 'from-blue-500 to-blue-600',
    description: 'Discover amazing activities',
  },
];

function HeroContent() {
  const [selectedService, setSelectedService] = useState('hotels');
  const [isGuestsDropdownOpen, setIsGuestsDropdownOpen] = useState(false);
  const [guests, setGuests] = useState({ children: 0, adult: 1 });
  const [selectedDateFrom, setSelectedDateFrom] = useState(null);
  const [selectedDateTo, setSelectedDateTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const dateFromPickerRef = useRef(null);
  const dateToPickerRef = useRef(null);
  const guestsDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);

  const router = useRouter();
  const totalGuests = guests.children + guests.adult;

  const { data: locationsData, isLoading, error } = useLocations(searchQuery);
  const locations = locationsData?.data || [];
  const errorMessage = locationsData?.errorMessage;

  const { ref: contentRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px',
  });

  const filteredLocations = locations.filter((location) =>
    location.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = (ref) =>
        ref.current && !ref.current.contains(event.target);

      if (isOutside(dateFromPickerRef)) setSelectedDateFrom((prev) => prev);
      if (isOutside(dateToPickerRef)) setSelectedDateTo((prev) => prev);
      if (isOutside(guestsDropdownRef)) setIsGuestsDropdownOpen(false);
      if (isOutside(searchDropdownRef) && isOutside(searchInputRef))
        setIsSearchDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleServiceSelect = useCallback(
    (serviceId) => {
      const service = serviceOptions.find((s) => s.id === serviceId);

      if (!service.available) {
        toast.error('Coming Soon!', {
          duration: 3000,
          position: 'top-center',
        });
        return;
      }

      setSelectedService(serviceId);
    },
    [router]
  );

  const handleGuestChange = useCallback((category, increment) => {
    setGuests((prev) => {
      const newValue = Math.max(0, prev[category] + (increment ? 1 : -1));

      if (category === 'adult' && newValue === 0) {
        toast.error('At least one adult is required', {
          duration: 3000,
          position: 'top-center',
        });
        return prev;
      }

      return {
        ...prev,
        [category]: newValue,
      };
    });
  }, []);

  const formatDateToApi = useCallback((date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const handleSearch = useCallback(async () => {
    setSearchError(null);

    if (!selectedCity) {
      setSearchError('Please select a destination city');
      toast.error('Please select a destination city', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    if (!selectedDateFrom) {
      setSearchError('Please select a check-in date');
      toast.error('Please select a check-in date', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    if (!selectedDateTo) {
      setSearchError('Please select a check-out date');
      toast.error('Please select a check-out date', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    if (totalGuests === 0) {
      setSearchError('Please select at least one guest');
      toast.error('Please select at least one guest', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    if (selectedDateTo <= selectedDateFrom) {
      setSearchError('Check-out date must be after check-in date');
      toast.error('Check-out date must be after check-in date', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    setIsSearching(true);

    try {
      const queryParams = new URLSearchParams({
        location_id: selectedCity.id,
        checkin: formatDateToApi(selectedDateFrom),
        checkout: formatDateToApi(selectedDateTo),
        adults: String(guests.adult),
        children: String(guests.children),
      }).toString();

      toast.success('Searching for hotels...', {
        duration: 2000,
        position: 'top-center',
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push(`/hotels-list?${queryParams}`);
    } catch (error) {
      setSearchError('An error occurred while searching. Please try again.');
      toast.error('Search failed. Please try again.', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsSearching(false);
    }
  }, [
    selectedCity,
    selectedDateFrom,
    selectedDateTo,
    guests,
    formatDateToApi,
    router,
  ]);

  const handleCitySelect = useCallback((location) => {
    setSelectedCity(location);
    setSearchQuery(location.title);
    setIsSearchDropdownOpen(false);
    setSearchError(null);

    toast.success(`Selected ${location.title}`, {
      duration: 2000,
      position: 'top-center',
    });
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedCity(null);
    setSearchError(null);

    if (value.length >= 3) {
      setIsSearchDropdownOpen(true);
    } else {
      setIsSearchDropdownOpen(false);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedCity(null);
    setIsSearchDropdownOpen(false);
    setSearchError(null);

    toast.success('Search cleared', {
      duration: 2000,
      position: 'top-center',
    });
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div ref={contentRef} className="w-full mx-auto px-4 sm:px-6">
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-8 text-center"
        >
          <motion.div variants={itemVariants} className="space-y-8">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
              style={{
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              Find your next{' '}
              <span className="text-blue-600 relative">
                adventure
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
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium max-w-3xl mx-auto">
              Book hotels, activities, and car rentals with confidence. 
              Transparent pricing, verified reviews, and 24/7 support.
            </p>
            
            {/* Subtle Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Secure Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>4.8/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-green-500" />
                <span>500K+ Travelers</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="relative w-full max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-wrap justify-center gap-1">
                {serviceOptions.map((service, index) => {
                  const IconComponent = service.icon;
                  const isSelected = selectedService === service.id;

                  return (
                    <motion.button
                      key={service.id}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium text-sm ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {service.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 overflow-visible">
              {selectedService !== 'activities' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-4 mb-6">
                <div
                  className="sm:col-span-2 lg:col-span-3 relative"
                  ref={searchInputRef}
                >
                  <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    Destination
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Where to?"
                    className={`w-full h-12 sm:h-14 px-4 text-base justify-start text-left font-normal border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition rounded-xl ${
                      searchError
                        ? 'border-red-300'
                        : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none bg-gray-50`}
                    onFocus={() =>
                      searchQuery.length >= 3 && setIsSearchDropdownOpen(true)
                    }
                    aria-label="Search for a city"
                  />
                  {searchError && (
                    <p className="text-red-500 text-xs mt-1">{searchError}</p>
                  )}

                  <AnimatePresence>
                    {isSearchDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-[60] w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto"
                      >
                        {isLoading ? (
                          <div className="p-3 text-gray-500 text-sm flex items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
                            <span>Searching cities...</span>
                          </div>
                        ) : errorMessage ? (
                          <div className="p-3 text-red-500 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errorMessage}</span>
                          </div>
                        ) : filteredLocations.length > 0 ? (
                          filteredLocations.map((location) => (
                            <button
                              key={location.id}
                              onClick={() => handleCitySelect(location)}
                              className="w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {location.title}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-gray-500 text-sm">
                            No cities found
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="sm:col-span-1 lg:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    Check-in
                  </label>
                  <DateInput
                    selectedDate={selectedDateFrom}
                    onChange={setSelectedDateFrom}
                    placeholder="Check-in"
                    minDate={today}
                    className="w-full"
                  />
                  {searchError && (
                    <p className="text-red-500 text-xs mt-1">{searchError}</p>
                  )}
                </div>

                <div className="sm:col-span-1 lg:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    Check-out
                  </label>
                  <DateInput
                    selectedDate={selectedDateTo}
                    onChange={setSelectedDateTo}
                    placeholder="Check-out"
                    minDate={selectedDateFrom || today}
                    className="w-full"
                  />
                  {searchError && (
                    <p className="text-red-500 text-xs mt-1">{searchError}</p>
                  )}
                </div>

                <div
                  className="sm:col-span-2 lg:col-span-3 relative"
                  ref={guestsDropdownRef}
                >
                  <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-500" />
                    Guests
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setIsGuestsDropdownOpen(!isGuestsDropdownOpen)
                    }
                    className={`w-full h-12 sm:h-14 px-4 text-base justify-start text-left font-normal border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition rounded-xl ${
                      searchError
                        ? 'border-red-300'
                        : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none bg-gray-50 flex items-center justify-between ${
                      totalGuests === 0 ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    <span className="truncate">
                      {totalGuests > 0
                        ? `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`
                        : 'Select guests'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                        isGuestsDropdownOpen ? 'rotate-180' : ''
                      }`}
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
                  {searchError && (
                    <p className="text-red-500 text-xs mt-1">{searchError}</p>
                  )}

                  <AnimatePresence>
                    {isGuestsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-lg mt-2 shadow-2xl p-4"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          right: '0',
                          zIndex: 9999,
                          minWidth: '300px',
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-800 text-sm">
                                Adults
                              </h4>
                              <p className="text-xs text-gray-500">Ages 13+</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleGuestChange('adult', false)
                                }
                                disabled={guests.adult <= 1}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-50 text-sm font-semibold transition-all duration-200"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900 text-base">
                                {guests.adult}
                              </span>
                              <button
                                onClick={() => handleGuestChange('adult', true)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 text-sm font-semibold transition-all duration-200"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col items-center text-center">
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-800 text-sm">
                                Children
                              </h4>
                              <p className="text-xs text-gray-500">Ages 2-12</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleGuestChange('children', false)
                                }
                                disabled={guests.children <= 0}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-50 text-sm font-semibold transition-all duration-200"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900 text-base">
                                {guests.children}
                              </span>
                              <button
                                onClick={() => handleGuestChange('children', true)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 text-sm font-semibold transition-all duration-200"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              )}

              {selectedService === 'activities' ? (
                <motion.button
                  onClick={() => router.push('/activities')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  <Ticket className="w-5 h-5" />
                  Explore Activities
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSearch}
                  disabled={isSearching || selectedService === 'hotels' || selectedService === 'cars'}
                  whileHover={{ scale: (selectedService === 'hotels' || selectedService === 'cars') ? 1 : 1.02 }}
                  whileTap={{ scale: (selectedService === 'hotels' || selectedService === 'cars') ? 1 : 0.98 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search {selectedService === 'hotels' ? 'Hotels' : selectedService === 'cars' ? 'Cars' : 'Activities'}
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {searchError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 max-w-md mx-auto"
        >
          <AlertCircle className="h-5 w-5" />
          <span>{searchError}</span>
        </motion.div>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#3b82f6',
            color: '#fff',
            border: '1px solid #2563eb',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '16px',
            marginTop: '10px',
          },
          success: {
            icon: null,
            style: {
              background: '#3b82f6',
              color: '#fff',
              border: '1px solid #2563eb',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              marginTop: '10px',
            },
          },
          error: {
            icon: null,
            style: {
              background: '#ef4444',
              color: '#fff',
              border: '1px solid #dc2626',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              marginTop: '10px',
            },
          },
          loading: {
            icon: null,
            style: {
              background: '#3b82f6',
              color: '#fff',
              border: '1px solid #2563eb',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              marginTop: '10px',
            },
          },
        }}
      />
    </div>
  );
}

export default HeroContent;
