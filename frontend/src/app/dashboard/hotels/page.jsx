'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  MapPin,
  Users,
  DollarSign,
  Wifi,
  Car,
  Coffee,
  MoreVertical
} from 'lucide-react';

const HostelsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const hostels = [
    {
      id: 1,
      name: 'Tokyo Central Hostel',
      location: 'Shibuya, Tokyo',
      price: 45,
      currency: 'USD',
      rating: 4.6,
      reviews: 189,
      status: 'Active',
      bookings: 67,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      amenities: ['WiFi', 'Parking', 'Breakfast', 'Laundry']
    },
    {
      id: 2,
      name: 'Bangkok Backpackers',
      location: 'Khao San Road, Bangkok',
      price: 25,
      currency: 'USD',
      rating: 4.4,
      reviews: 234,
      status: 'Active',
      bookings: 89,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
      amenities: ['WiFi', 'Pool', 'Bar', 'Tours']
    },
    {
      id: 3,
      name: 'Singapore Marina Hostel',
      location: 'Marina Bay, Singapore',
      price: 55,
      currency: 'USD',
      rating: 4.8,
      reviews: 156,
      status: 'Pending',
      bookings: 23,
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop',
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Concierge']
    },
    {
      id: 4,
      name: 'Seoul Guesthouse',
      location: 'Gangnam, Seoul',
      price: 38,
      currency: 'USD',
      rating: 4.5,
      reviews: 98,
      status: 'Active',
      bookings: 45,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Tours']
    },
    {
      id: 5,
      name: 'Hanoi Old Quarter Hostel',
      location: 'Old Quarter, Hanoi',
      price: 18,
      currency: 'USD',
      rating: 4.3,
      reviews: 67,
      status: 'Inactive',
      bookings: 12,
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop',
      amenities: ['WiFi', 'Tours', 'Bike Rental', 'Common Room']
    }
  ];

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hostel.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || hostel.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'parking': return <Car className="h-4 w-4" />;
      case 'breakfast': return <Coffee className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostels Management</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor all your hostel accommodations
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Add Hostel
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hostels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Additional Filters */}
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5 mr-2" />
            More Filters
          </button>
        </div>
      </motion.div>

      {/* Hostels Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredHostels.map((hostel) => (
          <div key={hostel.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Hostel Image */}
            <div className="relative h-48">
              <img
                src={hostel.image}
                alt={hostel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  hostel.status === 'Active' ? 'bg-green-100 text-green-800' :
                  hostel.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {hostel.status}
                </span>
              </div>
            </div>

            {/* Hostel Info */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{hostel.name}</h3>
              
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{hostel.location}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">{hostel.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({hostel.reviews})</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ${hostel.price}
                  <span className="text-sm text-gray-500">/night</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {hostel.amenities.slice(0, 3).map((amenity, index) => (
                    <div key={index} className="flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      {getAmenityIcon(amenity)}
                      <span className="ml-1">{amenity}</span>
                    </div>
                  ))}
                  {hostel.amenities.length > 3 && (
                    <div className="flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      +{hostel.amenities.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{hostel.bookings} bookings</span>
                <span>Last updated: 1 day ago</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredHostels.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hostels found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first hostel.'
            }
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Add Hostel
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HostelsPage;
