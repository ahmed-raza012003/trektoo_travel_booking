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
  Shield,
  Star,
  Users2,
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
    available: false,
    route: '/hotels-list',
    color: 'from-blue-500 to-blue-600',
    description: 'Find the perfect stay',
  },
  {
    id: 'cars',
    label: 'Car Rentals',
    icon: Car,
    available: true,
    route: '/activities?category_id=182',
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
  const [selectedService, setSelectedService] = useState('cars');
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
    threshold: 0.2,
    rootMargin: '-50px',
  });

  const filteredLocations = locations.filter((location) =>
    location.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = (ref) => ref.current && !ref.current.contains(event.target);
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

  const handleServiceSelect = useCallback((serviceId) => {
    const service = serviceOptions.find((s) => s.id === serviceId);
    if (!service.available) {
      toast.error('Coming Soon!', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
    setSelectedService(serviceId);
  }, []);

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
      return { ...prev, [category]: newValue };
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
      toast.error('Please select a destination city', { duration: 4000, position: 'top-center' });
      return;
    }
    if (!selectedDateFrom) {
      setSearchError('Please select a check-in date');
      toast.error('Please select a check-in date', { duration: 4000, position: 'top-center' });
      return;
    }
    if (!selectedDateTo) {
      setSearchError('Please select a check-out date');
      toast.error('Please select a check-out date', { duration: 4000, position: 'top-center' });
      return;
    }
    if (totalGuests === 0) {
      setSearchError('Please select at least one guest');
      toast.error('Please select at least one guest', { duration: 4000, position: 'top-center' });
      return;
    }
    if (selectedDateTo <= selectedDateFrom) {
      setSearchError('Check-out date must be after check-in date');
      toast.error('Check-out date must be after check-in date', { duration: 4000, position: 'top-center' });
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
      toast.success('Searching...', { duration: 2000, position: 'top-center' });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push(`/hotels-list?${queryParams}`);
    } catch (error) {
      setSearchError('An error occurred while searching. Please try again.');
      toast.error('Search failed. Please try again.', { duration: 4000, position: 'top-center' });
    } finally {
      setIsSearching(false);
    }
  }, [selectedCity, selectedDateFrom, selectedDateTo, guests, formatDateToApi, router]);

  const handleCitySelect = useCallback((location) => {
    setSelectedCity(location);
    setSearchQuery(location.title);
    setIsSearchDropdownOpen(false);
    setSearchError(null);
    toast.success(`Selected ${location.title}`, { duration: 2000, position: 'top-center' });
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedCity(null);
    setSearchError(null);
    if (value.length >= 2) {
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
    toast.success('Search cleared', { duration: 2000, position: 'top-center' });
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
        ease: 'easeOut',
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 15,
      },
    },
  };

  return (
    <div ref={contentRef} className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10">
        {/* Title and Subtitle */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-6"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-extrabold text-white tracking-tight mt-10"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Discover Your Next{' '}
            <span className="relative text-blue-500">
              Adventure
              <svg
                className="absolute -bottom-3 left-0 w-full h-4"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 2 100 2 198 10"
                  stroke="#ffbc36ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-gray-200 font-medium max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Plan unforgettable trips with premium hotels, exciting activities, and seamless car rentals.
          </motion.p>
          
        </motion.div>

        {/* Search Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="w-full max-w-5xl mx-auto mt-10"
        >
          <div className="bg-white/10 backdrop-blur-none rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Service Tabs */}
            <div className="p-4 border-b border-white/10">
              <div className="flex flex-wrap justify-center gap-2">
                {serviceOptions.map((service, index) => {
                  const IconComponent = service.icon;
                  const isSelected = selectedService === service.id;
                  return (
                    <motion.button
                      key={service.id}
                      variants={itemVariants}
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'text-gray-200 hover:bg-white/10'
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <IconComponent className="w-5 h-5" />
                      {service.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="p-6">
              {selectedService !== 'activities' && selectedService !== 'cars' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-4 mb-6">
                  {/* Destination Input */}
                  <div className="sm:col-span-2 lg:col-span-3 relative" ref={searchInputRef}>
                    <label className="text-xs font-semibold text-gray-200 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      Destination
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder="Where are you going?"
                        className="w-full h-14 px-4 text-base text-gray-900 bg-white/90 rounded-xl border border-gray-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        onFocus={() => searchQuery.length >= 2 && setIsSearchDropdownOpen(true)}
                        aria-label="Search for a city"
                      />
                      {searchQuery && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isSearchDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl mt-2 shadow-xl max-h-60 overflow-y-auto"
                        >
                          {isLoading ? (
                            <div className="p-4 text-gray-500 text-sm flex items-center gap-2">
                              <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                              <span>Searching destinations...</span>
                            </div>
                          ) : errorMessage ? (
                            <div className="p-4 text-red-500 text-sm flex items-center gap-2">
                              <AlertCircle className="h-5 w-5" />
                              <span>{errorMessage}</span>
                            </div>
                          ) : filteredLocations.length > 0 ? (
                            filteredLocations.map((location) => (
                              <button
                                key={location.id}
                                onClick={() => handleCitySelect(location)}
                                className="w-full p-3 text-left hover:bg-blue-50/50 transition-colors border-b border-gray-100/50 last:border-b-0 text-sm text-gray-900"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-400" />
                                  <span className="font-medium">{location.title}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-gray-500 text-sm">No destinations found</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Check-in Date */}
                  <div className="sm:col-span-1 lg:col-span-2">
                    <label className="text-xs font-semibold text-gray-200 mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Check-in
                    </label>
                    <DateInput
                      selectedDate={selectedDateFrom}
                      onChange={setSelectedDateFrom}
                      placeholder="Check-in"
                      minDate={today}
                      className="w-full h-14 bg-white/90 rounded-xl border border-gray-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                  </div>

                  {/* Check-out Date */}
                  <div className="sm:col-span-1 lg:col-span-2">
                    <label className="text-xs font-semibold text-gray-200 mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Check-out
                    </label>
                    <DateInput
                      selectedDate={selectedDateTo}
                      onChange={setSelectedDateTo}
                      placeholder="Check-out"
                      minDate={selectedDateFrom || today}
                      className="w-full h-14 bg-white/90 rounded-xl border border-gray-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                  </div>

                  {/* Guests Dropdown */}
                  <div className="sm:col-span-2 lg:col-span-3 relative" ref={guestsDropdownRef}>
                    <label className="text-xs font-semibold text-gray-200 mb-2 flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      Guests
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsGuestsDropdownOpen(!isGuestsDropdownOpen)}
                      className="w-full h-14 px-4 text-base text-gray-900 bg-white/90 rounded-xl border border-gray-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 shadow-sm flex items-center justify-between"
                    >
                      <span className="truncate font-medium">
                        {totalGuests > 0
                          ? `${totalGuests} Guest${totalGuests !== 1 ? 's' : ''}`
                          : 'Select Guests'}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isGuestsDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {isGuestsDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl mt-2 shadow-xl p-4"
                        >
                          <div className="grid grid-cols-1 md:gap-6">
                            <div className="flex flex-col items-center text-center">
                              <div className="mb-2">
                                <h4 className="font-semibold text-gray-800 text-sm">Adults</h4>
                                <p className="text-xs text-gray-500">Ages 13+</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleGuestChange('adult', false)}
                                  disabled={guests.adult <= 1}
                                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-blue-500 disabled:opacity-50 text-lg font-semibold transition-all bg-white/90"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center font-bold text-gray-900 text-lg">{guests.adult}</span>
                                <button
                                  onClick={() => handleGuestChange('adult', true)}
                                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-blue-500 text-lg font-semibold transition-all bg-white/90"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col items-center text-center mt-4 md:mt-0">
                              <div className="mb-2">
                                <h4 className="font-semibold text-gray-800 text-sm">Children</h4>
                                <p className="text-xs text-gray-500">Ages 2-12</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleGuestChange('children', false)}
                                  disabled={guests.children <= 0}
                                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-blue-500 disabled:opacity-50 text-lg font-semibold transition-all bg-white/90"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center font-bold text-gray-900 text-lg">{guests.children}</span>
                                <button
                                  onClick={() => handleGuestChange('children', true)}
                                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-blue-500 text-lg font-semibold transition-all bg-white/90"
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

              {/* Search Button */}
              {selectedService === 'activities' ? (
                <motion.button
                  onClick={() => router.push('/activities')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  <Ticket className="w-5 h-5" />
                  Explore Activities
                </motion.button>
              ) : selectedService === 'cars' ? (
                <motion.button
                  onClick={() => router.push('/activities?category_id=182')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  <Car className="w-5 h-5" />
                  Explore Car Rentals
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSearch}
                  disabled={isSearching}
                  whileHover={{ scale: isSearching ? 1 : 1.03 }}
                  whileTap={{ scale: isSearching ? 1 : 0.97 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search {selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {searchError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2 max-w-md mx-auto"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{searchError}</span>
          </motion.div>
        )}
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(59, 130, 246, 0.95)',
            color: '#fff',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '16px',
            marginTop: '10px',
            backdropFilter: 'blur(8px)',
          },
          success: {
            icon: null,
            style: {
              background: 'rgba(59, 130, 246, 0.95)',
              color: '#fff',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              marginTop: '10px',
              backdropFilter: 'blur(8px)',
            },
          },
          error: {
            icon: null,
            style: {
              background: 'rgba(239, 68, 68, 0.95)',
              color: '#fff',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              marginTop: '10px',
              backdropFilter: 'blur(8px)',
            },
          },
          loading: {
            icon: null,
            style: {
              background: 'rgba(59, 130, 246, 0.95)',
              color: '#fff',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              marginTop: '10px',
              backdropFilter: 'blur(8px)',
            },
          },
        }}
      />
    </div>
  );
}

export default HeroContent;