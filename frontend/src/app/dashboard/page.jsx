'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  MapPin,
  Star
} from 'lucide-react';

const DashboardPage = () => {
  const stats = [
    {
      name: 'Total Activities',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Activity,
      color: 'blue'
    },
    {
      name: 'Total Hostels',
      value: '456',
      change: '+8%',
      changeType: 'positive',
      icon: Building2,
      color: 'green'
    },
    {
      name: 'Total Users',
      value: '8,901',
      change: '+23%',
      changeType: 'positive',
      icon: Users,
      color: 'purple'
    },
    {
      name: 'Total Revenue',
      value: '$45,678',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      name: 'Tokyo City Tour',
      type: 'Activity',
      status: 'Active',
      bookings: 23,
      revenue: '$1,234'
    },
    {
      id: 2,
      name: 'Bangkok Hostel',
      type: 'Hostel',
      status: 'Active',
      bookings: 45,
      revenue: '$2,345'
    },
    {
      id: 3,
      name: 'Singapore Adventure',
      type: 'Activity',
      status: 'Pending',
      bookings: 12,
      revenue: '$567'
    },
    {
      id: 4,
      name: 'Seoul Guesthouse',
      type: 'Hostel',
      status: 'Active',
      bookings: 34,
      revenue: '$1,890'
    }
  ];

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your travel platform.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-100' :
                      stat.color === 'green' ? 'bg-green-100' :
                      stat.color === 'purple' ? 'bg-purple-100' :
                      'bg-yellow-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'green' ? 'text-green-600' :
                        stat.color === 'purple' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be implemented here</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'Active' ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                    <p className="text-xs text-gray-500">{activity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{activity.bookings} bookings</p>
                  <p className="text-xs text-gray-500">{activity.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Activity className="h-5 w-5 mr-2" />
            Add Activity
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Building2 className="h-5 w-5 mr-2" />
            Add Hostel
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 mr-2" />
            View Users
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 mr-2" />
            View Bookings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
