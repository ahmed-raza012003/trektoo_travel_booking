'use client';

import React from 'react';
import { motion } from 'framer-motion';

const offers = [
    {
        id: '1',
        title: 'Sunway Splash!',
        subtitle: '20% OFF Malaysia Water Parks',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        buttonText: 'Book Now',
        bgColor: 'bg-gradient-to-r from-orange-500 to-orange-500',
    },
    {
        id: '2',
        title: 'Feel the Rush!',
        subtitle: 'Live the Game - Step into the Ultimate Sports Battles',
        imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        buttonText: 'Find out more',
        bgColor: 'bg-gradient-to-r from-yellow-500 to-yellow-500',
    },
    {
        id: '3',
        title: 'Trektoo Exclusive',
        subtitle: 'Top travel deals - Experiences, transport & more\nAt least 10% off',
        imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        buttonText: 'Explore Deals',
        bgColor: 'bg-gradient-to-r from-purple-500 to-purple-500',
    },
];

const OffersSection = () => {
    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Offers for you</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                    <motion.div
                        key={offer.id}
                        className={`relative rounded-2xl overflow-hidden shadow-lg ${offer.bgColor} text-white`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <img
                            src={offer.imageUrl}
                            alt={offer.title}
                            className="w-full h-48 object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-6">
                            <div>
                                <h3 className="text-xl font-semibold">{offer.title}</h3>
                                <p className="text-sm mt-1">{offer.subtitle}</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/30 text-white font-medium text-sm hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
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