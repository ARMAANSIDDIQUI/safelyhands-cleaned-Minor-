"use client";

import React, { useEffect } from 'react';
import Link from "next/link";
import Image from 'next/image';
import { Star, ArrowUpRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchServices, selectAllServices, selectServiceStatus, selectServiceError } from '@/store/slices/serviceSlice';

const ServicesGrid = () => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const status = useAppSelector(selectServiceStatus);
  const error = useAppSelector(selectServiceError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchServices());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (status === 'failed') {
    return (
      <section className="py-20 bg-white text-center">
        <p className="text-red-500">Failed to load services: {error}</p>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">No services available. Please seed the database from Admin Maintenance.</p>
      </div>
    );
  }

  return (
    <section className="bg-transparent py-[40px] md:py-[80px]">
      <div className="container mx-auto px-[15px] max-w-[1140px]">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-[30px] gap-y-[30px] justify-items-center">
          {services.map((service) => (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className="group relative w-full max-w-[540px] overflow-hidden rounded-[20px] transition-transform duration-200 hover:scale-[1.02] shadow-[0_4px_15px_rgba(0,0,0,0.08)] cursor-pointer"
            >
              <div className="relative aspect-[16/9] w-full">
                {/* Service Image */}
                <Image
                  src={service.imageUrl || 'https://placehold.co/800x450/e0f2fe/0ea5e9?text=Service'}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"
                />

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-[5px] flex items-center shadow-sm z-10">
                  <Star size={14} fill="#fbbf24" className="text-[#fbbf24] mr-1" />
                  <span className="text-[14px] font-bold text-[#212529]">
                    {(() => {
                      const STATIC_RATINGS = {
                        'domestic-help': 4.8,
                        'cooks': 4.7,
                        'babysitter': 4.8,
                        'all-rounder': 4.6,
                        'elderly-care': 4.8,
                        '24-hour-live-in': 4.7,
                        'patient-care': 4.8,
                        'peon': 4.6,
                        'japa': 4.8
                      };
                      const slug = service.slug || 'default';
                      if (STATIC_RATINGS[slug]) return STATIC_RATINGS[slug];

                      let value = 0;
                      for (let i = 0; i < slug.length; i++) value += slug.charCodeAt(i);
                      const x = Math.sin(value + 123) * 10000; // Offset seed for variety
                      const random = x - Math.floor(x);
                      return [4.6, 4.7, 4.8][Math.floor(random * 3)];
                    })()}
                  </span>
                </div>

                {/* Book Now Button Overlay */}
                <div className="absolute top-[50%] left-0 transform -translate-y-1/2 z-10">
                  <div className="bg-[#212529] text-white px-4 py-2 font-bold text-[14px] uppercase tracking-wide rounded-r-[5px] shadow-lg">
                    Book Now !
                  </div>
                </div>

                {/* Service Name Banner */}
                <div className="absolute bottom-0 left-0 w-full z-10 px-4 pb-4">
                  <div className="inline-block bg-[#72bcd4] text-[#212529] px-6 py-2 rounded-lg font-bold text-[18px] shadow-md">
                    {service.title}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;