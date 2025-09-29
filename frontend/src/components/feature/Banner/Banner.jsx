'use client';
import React from 'react';
import { Plane, Car, Bus, Ship, Cloud, TreePine, Mountain, Sun } from 'lucide-react';

const Banner = () => {
  return (
    <section className="relative w-full bg-gradient-to-br from-white-50 via-white to-white-50 py-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100 rounded-full opacity-30 translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      
      {/* Additional CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slide {
          0% { transform: translateX(0px) rotate(0deg); }
          25% { transform: translateX(10px) rotate(90deg); }
          50% { transform: translateX(0px) rotate(180deg); }
          75% { transform: translateX(-10px) rotate(270deg); }
          100% { transform: translateX(0px) rotate(360deg); }
        }
        
        @keyframes flyAcross {
          0% { transform: translateX(-100px) translateY(0px); }
          25% { transform: translateX(100px) translateY(-10px); }
          50% { transform: translateX(200px) translateY(-5px); }
          75% { transform: translateX(300px) translateY(-15px); }
          100% { transform: translateX(500px) translateY(0px); }
        }
        
        @keyframes driveAcross {
          0% { transform: translateX(-50px); }
          100% { transform: translateX(450px); }
        }
        
        @keyframes cloudFloat {
          0% { transform: translateX(-80px) translateY(0px); }
          50% { transform: translateX(20px) translateY(-8px); }
          100% { transform: translateX(120px) translateY(0px); }
        }
        
        @keyframes treeWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
        
        @keyframes sunRays {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slide {
          animation: slide 8s linear infinite;
        }
        
        .bg-lavender {
          background-color: #e6e6fa;
        }
      `}</style>
      
      <div className="relative container mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          
          {/* Left: Animated Travel Scenery */}
          <div className="w-full lg:w-7/12 relative h-96 lg:h-[500px]">
            {/* Sky and Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-blue-50 to-green-50">
              
              {/* Sun */}
              <div className="absolute top-8 right-8">
                <Sun 
                  className="w-16 h-16 text-yellow-400 opacity-80" 
                  style={{ animation: 'sunRays 15s linear infinite' }}
                />
              </div>
              
              {/* Clouds */}
              <div className="absolute top-12 left-4">
                <Cloud 
                  className="w-12 h-12 text-white opacity-70" 
                  style={{ animation: 'cloudFloat 20s linear infinite', animationDelay: '0s' }}
                />
              </div>
              <div className="absolute top-6 left-1/3">
                <Cloud 
                  className="w-10 h-10 text-gray-100 opacity-60" 
                  style={{ animation: 'cloudFloat 25s linear infinite reverse', animationDelay: '5s' }}
                />
              </div>
              <div className="absolute top-16 right-1/3">
                <Cloud 
                  className="w-14 h-14 text-white opacity-50" 
                  style={{ animation: 'cloudFloat 18s linear infinite', animationDelay: '10s' }}
                />
              </div>
              
              {/* Mountains */}
              <div className="absolute bottom-20 left-8">
                <Mountain className="w-20 h-20 text-gray-400 opacity-60" />
              </div>
              <div className="absolute bottom-16 right-1/4">
                <Mountain className="w-16 h-16 text-slate-500 opacity-50" />
              </div>
              <div className="absolute bottom-24 left-1/3">
                <Mountain className="w-12 h-12 text-gray-500 opacity-40" />
              </div>
              
              {/* Trees */}
              <div className="absolute bottom-8 left-16">
                <TreePine 
                  className="w-14 h-14 text-green-500 opacity-70" 
                  style={{ animation: 'treeWave 4s ease-in-out infinite', animationDelay: '0s' }}
                />
              </div>
              <div className="absolute bottom-12 left-1/2">
                <TreePine 
                  className="w-12 h-12 text-green-600 opacity-60" 
                  style={{ animation: 'treeWave 5s ease-in-out infinite', animationDelay: '2s' }}
                />
              </div>
              <div className="absolute bottom-6 right-20">
                <TreePine 
                  className="w-16 h-16 text-emerald-500 opacity-80" 
                  style={{ animation: 'treeWave 3.5s ease-in-out infinite', animationDelay: '1s' }}
                />
              </div>
              <div className="absolute bottom-10 right-8">
                <TreePine 
                  className="w-10 h-10 text-green-700 opacity-50" 
                  style={{ animation: 'treeWave 4.5s ease-in-out infinite', animationDelay: '3s' }}
                />
              </div>
              
              {/* Flying Vehicles */}
              <div className="absolute top-20 left-0">
                <Plane 
                  className="w-8 h-8 text-blue-600 opacity-70" 
                  style={{ animation: 'flyAcross 12s linear infinite', animationDelay: '0s' }}
                />
              </div>
              <div className="absolute top-32 left-0">
                <Plane 
                  className="w-6 h-6 text-indigo-500 opacity-60" 
                  style={{ animation: 'flyAcross 15s linear infinite', animationDelay: '7s' }}
                />
              </div>
              <div className="absolute top-40 left-0">
                <Plane 
                  className="w-7 h-7 text-sky-600 opacity-80" 
                  style={{ animation: 'flyAcross 18s linear infinite', animationDelay: '3s' }}
                />
              </div>
              
              {/* Ground Vehicles */}
              <div className="absolute bottom-4 left-0">
                <Car 
                  className="w-6 h-6 text-red-500 opacity-70" 
                  style={{ animation: 'driveAcross 8s linear infinite', animationDelay: '1s' }}
                />
              </div>
              <div className="absolute bottom-4 left-0">
                <Bus 
                  className="w-8 h-8 text-yellow-600 opacity-80" 
                  style={{ animation: 'driveAcross 10s linear infinite', animationDelay: '5s' }}
                />
              </div>
              <div className="absolute bottom-4 left-0">
                <Car 
                  className="w-5 h-5 text-blue-600 opacity-60" 
                  style={{ animation: 'driveAcross 7s linear infinite', animationDelay: '8s' }}
                />
              </div>
              
              {/* Water and Ships (bottom section) */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-blue-900 via-blue-900 to-blue-900 opacity-30"></div>
             
              
              
              {/* Floating decorative boxes (keeping some for depth) */}
              <div className="absolute top-24 left-20 w-6 h-6 bg-blue-200 rounded-lg opacity-30" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}></div>
              <div className="absolute top-48 right-16 w-8 h-8 bg-purple-200 rounded-xl opacity-25" style={{ animation: 'float 7s ease-in-out infinite reverse', animationDelay: '3s' }}></div>
              <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-cyan-300 rounded-lg opacity-35" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '2s' }}></div>
              
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="w-full lg:w-5/12 text-center lg:text-left space-y-8">

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 bg-clip-text text-transparent">
                Trektoo
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Your gateway to extraordinary adventures. We provide everything you need 
              for unforgettable journeys — from thrilling activities and seamless 
              transport to comfortable accommodations and expert guidance.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Global Destinations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Secure Booking</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/about"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Explore About Trektoo
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;