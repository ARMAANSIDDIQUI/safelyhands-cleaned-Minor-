"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const FeaturedServices = () => {
  // Static mappings for review counts and ratings
  const STATIC_REVIEW_COUNTS = {
    'domestic-help': 215,
    'cooks': 198,
    'babysitter': 204,
    'all-rounder': 189,
    'elderly-care': 212,
    '24-hour-live-in': 195,
    'patient-care': 182,
    'peon': 185,
    'japa': 208
  };

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

  // Seeded random number generator for consistency
  const getSeededRandom = (seed) => {
    let value = 0;
    for (let i = 0; i < seed.length; i++) {
      value += seed.charCodeAt(i);
    }
    const x = Math.sin(value) * 10000;
    return x - Math.floor(x);
  };

  const getStaticReviewCount = (slug) => {
    if (STATIC_REVIEW_COUNTS[slug]) return STATIC_REVIEW_COUNTS[slug];

    // Generate deterministic random number between 180 and 220
    const random = getSeededRandom(slug || 'default');
    return 180 + Math.floor(random * 41);
  };

  const getStaticRating = (slug) => {
    if (STATIC_RATINGS[slug]) return STATIC_RATINGS[slug];

    // Generate deterministic random number between 4.6 and 4.8
    const random = getSeededRandom((slug || 'default') + '_rating');
    const steps = [4.6, 4.7, 4.8];
    const index = Math.floor(random * 3);
    return steps[index];
  };

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setServices(data.slice(0, 8).map(s => ({
            title: s.title,
            slug: s.slug,
            rating: getStaticRating(s.slug),
            reviews: `${getStaticReviewCount(s.slug)}+`,
            image: s.imageUrl || 'https://placehold.co/600x400/e0f2fe/0ea5e9?text=Service',
            badge: s.badge || undefined,
            minPrice: s.minPrice || 0,
            maxPrice: s.maxPrice || 0
          })));
        }
      } catch (error) {
        console.warn("Using fallback colors/placeholders (Backend unreachable)");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return null;
  if (services.length === 0) return null;

  return (
    <section className="bg-transparent pt-10 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-blue-900 mb-4">
              Our Featured <span className="text-blue-600">Services</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Safely Hands offers completely verified workers with a replacement policy. Choose from our range of trusted domestic help services.
            </p>
          </div>
          <Link
            href="/services"
            className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group bg-blue-50 px-6 py-3 rounded-full"
          >
            View all services <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="overflow-hidden px-1" ref={emblaRef}>
          <div className="flex">
            {services.map((service, index) => (
              <div key={index} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] px-3 min-w-0">
                <Link
                  href={`/services/${service.slug}`}
                  className="block h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 group cursor-pointer border border-slate-100 hover:border-blue-200"
                >
                  <div className="relative w-full h-[240px] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {service.badge && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {service.badge}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-bold mb-1 leading-tight group-hover:text-blue-100 transition-colors">
                        {service.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2 text-xs mb-2">
                        {service.minPrice > 0 && service.maxPrice > 0 && (
                          <span className="text-sm font-bold text-blue-100">
                            {`₹${service.minPrice.toLocaleString()} - ₹${service.maxPrice.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white font-semibold">
                          <Star size={12} fill="currentColor" className="text-yellow-400" /> {service.rating}
                        </span>
                        <span className="opacity-80">{service.reviews} reviews</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            View all services <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;