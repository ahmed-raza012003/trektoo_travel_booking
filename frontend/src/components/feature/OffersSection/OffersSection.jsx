'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Sparkles } from 'lucide-react';

const offers = [
    {
        id: '1',
        title: 'TOP TRENDS SEASON SALE',
        subtitle: 'BIG SALE',
        description: 'Massive discounts on premium travel experiences. Save big on hotels, activities, and transport.',
        discount: '27%',
        discountText: 'OFF',
        promoCode: 'TREND27',
        buttonText: 'Book Now',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        bgColor: 'from-pink-100 to-pink-200',
        cardStyle: 'discount-card',
    },
    {
        id: '2',
        title: 'LIMITED TIME OFFER',
        subtitle: 'For the first 100',
        description: 'Only 23 exclusive booking slots available. Early bird gets the best deals - secure your spot now.',
        discount: '23',
        discountText: 'BOOKINGS LEFT',
        promoCode: 'EARLY100',
        buttonText: 'Grab Your Spot',
        imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        bgColor: 'from-orange-100 to-orange-200',
        cardStyle: 'urgency-card',
    },
    {
        id: '3',
        title: 'COMING SOON',
        subtitle: 'More to come',
        description: 'Exciting new destinations and exclusive deals coming soon. Join our newsletter for early access.',
        discount: 'NEW',
        discountText: 'DEALS',
        promoCode: 'STAYTUNED',
        buttonText: 'Get Notified',
        imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        bgColor: 'from-blue-100 to-blue-200',
        cardStyle: 'coming-soon-card',
    },
];

const OffersSection = () => {
    return (
        <section className="py-12 container mx-auto px-10 w-[90vw] rounded-xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Offers for you</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                    <motion.div
                        key={offer.id}
                        className="relative bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group max-w-lg mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        {/* Card Structure - Elegant Coupon Design */}
                        <div className="flex h-72 relative">
                            {/* Left Section (70% width) */}
                            <div className="flex-1 p-5 bg-white relative">
                                {/* Top Left Header */}
                                <div className={`text-xs font-medium uppercase tracking-wide mb-3 ${
                                    offer.id === '1' ? 'text-pink-400' :
                                    offer.id === '2' ? 'text-gray-600' :
                                    'text-blue-400'
                                }`}>
                                    {offer.title}
                                </div>
                                
                                {/* Main Heading */}
                                <h3 className={`text-5xl font-bold mb-4 font-serif leading-none ${
                                    offer.id === '1' ? 'text-pink-400' :
                                    offer.id === '2' ? 'text-gray-700' :
                                    'text-blue-400'
                                }`}>
                                    {offer.subtitle}
                                </h3>
                                
                                {/* Description */}
                                <p className="text-sm text-gray-600 leading-relaxed mb-6 pr-2">
                                    {offer.description}
                                </p>
                            </div>
                            
                            {/* Right Section (30% width) */}
                            <div className={`w-30 bg-gradient-to-b ${
                                offer.id === '1' ? 'from-pink-50 to-pink-100' :
                                offer.id === '2' ? 'from-orange-50 to-orange-100' :
                                'from-blue-50 to-blue-100'
                            } flex flex-col items-center justify-between p-3 relative`}>
                                {/* Discount Header */}
                                <div className="border border-gray-300 px-2 py-1 mb-2">
                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">DISCOUNT</span>
                                </div>
                                
                                {/* Discount Percentage */}
                                <div className="text-center flex-1 flex flex-col justify-center">
                                    <div className="w-full h-px bg-gray-400 mb-2"></div>
                                    <div className="relative">
                                        <span className="text-3xl font-bold text-gray-700 font-serif">{offer.discount}</span>
                                        {offer.id === '1' && (
                                            <span className="absolute top-0 right-0 text-[4px] font-medium text-gray-600 uppercase">OFF</span>
                                        )}
                                        {offer.id === '2' && (
                                            <div className="text-xs font-medium text-gray-600 uppercase mt-1">
                                                <div>BOOKINGS</div>
                                                <div>LEFT</div>
                                            </div>
                                        )}
                                        {offer.id === '3' && (
                                            <div className="text-xs font-medium text-gray-600 uppercase mt-1">
                                                <div>DEALS</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full h-px bg-gray-400 mt-2"></div>
                                </div>
                                
                            </div>
                            
                            {/* Perforated edge effect */}
                            <div className="absolute right-0 top-0 bottom-0 w-1 flex flex-col justify-center">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-1 h-1 bg-gray-300 rounded-full mb-2 opacity-40"></div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Subtle Button Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-end justify-center pb-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-4 py-2 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 text-sm ${
                                    offer.id === '1' ? 'bg-pink-400 hover:bg-pink-500' :
                                    offer.id === '2' ? 'bg-orange-400 hover:bg-orange-500' :
                                    'bg-blue-400 hover:bg-blue-500'
                                }`}
                            >
                                {offer.buttonText}
                            </motion.button>
                        </div>
                        
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default OffersSection;