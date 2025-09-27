// components/feature/InspirationSection/InspirationSection.jsx
import React from 'react';
import Link from 'next/link';
import {
  Bed,
  Mountain,
  Car,
  MapPin,
  ArrowRight,
  Star
} from 'lucide-react';

const InspirationSection = () => {
  const inspirationItems = [
    {
      id: 1,
      title: "Best staycation deals",
      description: "Enjoy these cool staycation promotions in Singapore",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cta: "See activities",
      link: "/staycations",
      icon: Bed,
      overlayColor: "from-none-800/70 to-gray-700/70"
    },
    {
      id: 2,
      title: "All Time Favourite Activities in Dubai",
      description: "Don't forget to check out these activities while you're here",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cta: "See activities",
      link: "/adventures",
      icon: Mountain,
      overlayColor: "from-none-800/70 to-gray-700/70"
    },
    {
      id: 3,
      title: "Premium Car Rentals",
      description: "Travel in style with our luxury vehicle collection",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cta: "View Cars",
      link: "/car-rentals",
      icon: Car,
      overlayColor: "from-none-800/70 to-gray-700/70"
    },
    {
      id: 4,
      title: "Cultural Experiences",
      description: "Immerse yourself in local traditions and heritage",
      image: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cta: "Discover Culture",
      link: "/cultural-tours",
      icon: MapPin,
      overlayColor: "from-none-800/70 to-gray-700/70"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-10 w-[80vw]">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Travel <span className="text-blue-600">Inspiration</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals and experiences for your next journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inspirationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Glossy Overlay for better text visibility */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.overlayColor}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Glossy shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 transition-all duration-1000 -translate-x-full group-hover:translate-x-full" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 h-64 flex flex-col justify-between">
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-white/90 text-base leading-relaxed drop-shadow-md max-w-md">
                        {item.description}
                      </p>
                    </div>


                  </div>

                  {/* Bottom Section - CTA Button and Icon */}
                  <div className="flex justify-between items-end">
                    <Link
                      href={item.link}
                      className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/30 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-white/20 shadow-lg hover:shadow-xl"
                    >
                      {item.cta}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    {/* Icon in bottom right */}
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>

                {/* Premium Badge */}
                <div className="absolute top-6 right-6 flex items-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/30 z-20">
                  <Star className="w-3 h-3 mr-1 text-white fill-white" />
                  <span className="text-xs font-bold text-white">PREMIUM</span>
                </div>
              </div>
            );
          })}
        </div>

        
      </div>
    </section>
  );
};

export default InspirationSection;