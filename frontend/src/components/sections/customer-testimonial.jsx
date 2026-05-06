"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const fallbackTestimonials = [];

const CustomerTestimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    // Failsafe: if fetch takes too long, stop loading anyway after 5s
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials([]);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
        setTestimonials([]);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    fetchTestimonials();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  if (!isMounted || loading) return null;
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-transparent py-24 text-slate-900 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600 rounded-full blur-[100px] opacity-20 transform -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left: Heading & Controls */}
          <div className="lg:w-1/3 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Star size={12} fill="currentColor" />
              Success Stories
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold font-display leading-tight text-slate-900">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-600">thousands</span> of families.
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center hover:bg-sky-400 transition-colors text-white"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Right: Card Slider */}
          <div className="lg:w-2/3 w-full">
            <div className="relative h-[400px] md:h-[300px]">
              {testimonials.map((item, index) => (
                <div
                  key={item._id || index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === activeIndex
                    ? 'opacity-100 translate-x-0 scale-100 z-20'
                    : 'opacity-0 translate-x-10 scale-95 z-10'
                    }`}
                >
                  <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-8 md:p-10 h-full flex flex-col justify-center shadow-sm">
                    <Quote size={40} className="text-sky-500 mb-6 opacity-50" />
                    <div className="mb-8">
                      <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-light line-clamp-4">
                        &quot;{item.message || item.review}&quot;
                      </p>
                      {(item.message || item.review).length > 200 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-sky-600 hover:text-sky-700 font-medium mt-2 text-sm">
                              Read full story
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sky-500 bg-slate-100 shrink-0">
                                  {item.imageUrl || item.image ? (
                                    <Image src={item.imageUrl || item.image} alt={item.name} fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                      {item.name[0]}
                                    </div>
                                  )}
                                </div>
                                <div className="text-left">
                                  <DialogTitle>{item.name}</DialogTitle>
                                  <DialogDescription>{item.role} {item.location && `• ${item.location}`}</DialogDescription>
                                </div>
                              </div>
                            </DialogHeader>
                            <div className="text-slate-600 leading-relaxed">
                              &quot;{item.message || item.review}&quot;
                            </div>
                            <div className="flex gap-1 mt-4">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${i < item.rating ? 'text-blue-400' : 'text-slate-600'}`}
                                  fill={i < item.rating ? "currentColor" : "none"}
                                />
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-auto">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sky-500 bg-slate-100">
                        {item.imageUrl || item.image ? (
                          <Image src={item.imageUrl || item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                            {item.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          {item.location && <span>{item.location}</span>}
                          {item.location && <span className="w-1 h-1 bg-slate-500 rounded-full" />}
                          <span>{item.role}</span>
                        </div>
                      </div>
                      <div className="ml-auto flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${i < item.rating ? 'text-blue-400' : 'text-slate-600'}`}
                            fill={i < item.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonial;
