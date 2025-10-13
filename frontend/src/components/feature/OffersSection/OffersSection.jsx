'use client';

import React from 'react';
import { motion } from 'framer-motion';

const offers = [
    {
        id: '1',
        title: 'BRAND NEW OFFER',
        subtitle: '27% OFF',
        description: 'ON THINGS TO DO!',
        buttonText: 'BOOK NOW!!',
        imageUrl: '/images/things to do.jpg',
    },
    {
        id: '2',
        title: 'DRIVE & DISCOVER',
        subtitle: '27% OFF',
        description: 'DISCOUNT ON ALL TRANSPORTATION DEALS & CAR RENTALS',
        buttonText: 'Find out more!',
        imageUrl: '/images/car rental.jpg',
    },
    {
        id: '3',
        title: 'DISCOUNT ON CRUISE, ENTERTAINMENT, FOOD & DINING!',
        subtitle: '27% OFF',
        description: 'Culinary Experience',
        buttonText: 'DISCOVER MORE!',
        imageUrl: '/images/others.jpg',
    },
];

const OffersSection = () => {
    return (
        <section className="pt-20 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
            <div className="container mx-auto px-10 w-[90vw] rounded-xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Offers for you</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                    <motion.div
                        key={offer.id}
                        className="relative rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group max-w-lg mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        {/* Main Image */}
                        <div className="relative overflow-hidden rounded-lg">
                            <img 
                                src={offer.imageUrl} 
                                alt={offer.title}
                                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            
                            {/* Hover Button */}
                            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white text-gray-800 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {offer.buttonText}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            </div>
        </section>
    );
};

export default OffersSection;