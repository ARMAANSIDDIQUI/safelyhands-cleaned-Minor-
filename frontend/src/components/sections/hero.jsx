"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Clock, Heart } from 'lucide-react';
import HeroRevolver from './hero-revolver';

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-2 md:pt-12 md:pb-4 lg:pt-16 lg:pb-8 xl:pt-20 xl:pb-12 overflow-hidden bg-transparent">
      {/* Dynamic Background Elements - Handled by GlobalBackground */}

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20">

          {/* Content */}
          <div className="flex-1 text-center lg:text-left z-10 w-full lg:w-auto">

            <h1 id="hero-title" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display tracking-tight text-slate-900 mb-4 md:mb-6 leading-[1.1] md:leading-[1.05]">
              India&apos;s trusted care and <br className="hidden sm:block" />
              <span className="text-gradient">staffing services</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-6 md:mb-8 max-w-xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              From Domestic help to office support staff - Hire Trained, Background Verified professionals on demand
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                id="hero-book-btn"
                href="/booking"
                className="w-full sm:w-auto px-8 py-3 md:py-4 bg-gradient-primary text-white rounded-full font-bold text-base md:text-lg hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
              >
                Book Now <ArrowRight size={20} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 mt-8 md:mt-12 text-slate-500 text-xs md:text-sm font-medium">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-500 md:w-[18px] md:h-[18px]" /> Verified Pros
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500 md:w-[18px] md:h-[18px]" /> Fast Booking
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-blue-500 md:w-[18px] md:h-[18px]" /> Top Rated
              </div>
            </div>
          </div>

          {/* Visuals - Hero Revolver Implementation - Visible on MD and up */}
          <div className="hidden md:block flex-1 w-full relative h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px]">
            <HeroRevolver />
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-zoom {
          animation: zoom 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
