"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import HeroIntro from "@/components/sections/hero-intro";
import Link from 'next/link';
import Footer from '@/components/sections/footer';
import ChatWidget from '@/components/sections/chat-widget';
import ServiceStats from "@/components/sections/service-stats";
import TestimonialCarousel from "@/components/sections/testimonial-carousel";
import TrustMarkers from "@/components/sections/trust-markers";
import CredibilityLogos from "@/components/sections/credibility-logos";

// Real service data from broomees.com
const FALLBACK_FEATURES = {
    'domestic-help': [
        "Deep floor cleaning & mopping",
        "Thorough dusting & cobweb removal",
        "Kitchen cleaning & sanitization",
        "Bathroom deep cleaning",
        "Window & balcony cleaning",
        "Cabinet & drawer cleaning"
    ],
    'cooks': [
        "Authentic home-style cooking",
        "Expert in multiple cuisines",
        "Vegetarian & Non-vegetarian options",
        "Kitchen hygiene maintenance",
        "Grocery management assistance",
        "Customized meal planning"
    ],
    'babysitter': [
        "Infant & child care specialized",
        "Diapering & feeding assistance",
        "Safe & engaging play activities",
        "Nap schedule management",
        "Basic baby food preparation",
        "Safety first supervision"
    ],
    'all-rounder': [
        "Brooming & mopping support",
        "Dishwashing & kitchen help",
        "Basic home-style cooking",
        "Laundry & folding clothes",
        "General home organization",
        "Multi-tasking household help"
    ],
    'elderly-care': [
        "Medication management & reminders",
        "Mobility & walking assistance",
        "Vital signs monitoring support",
        "Companionship & emotional care",
        "Personal hygiene assistance",
        "Nutritious meal preparation"
    ],
    '24-hour-live-in': [
        "Round-the-clock live-in support",
        "All household chores included",
        "Continuous availability & safety",
        "Flexible work arrangements",
        "Experienced live-in staff",
        "Complete peace of mind"
    ],
    'patient-care': [
        "Post-operative recovery support",
        "Proper wound care assistance",
        "Feeding & medication help",
        "Dedicated nursing assistance",
        "Hygiene & grooming care",
        "Continuous patient monitoring"
    ],
    'peon': [
        "Office cleaning & maintenance",
        "Pantry & beverage management",
        "Document filing & management",
        "Errands & courier help",
        "Professional guest reception",
        "General office support"
    ],
    'japa': [
        "Expert newborn baby massage",
        "Post-delivery mother massage",
        "Newborn bathing & hygiene",
        "Lactation support & guidance",
        "Healthy postpartum diet prep",
        "Dedicated mother & baby care"
    ]
};

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
    return 180 + Math.floor(random * 41); // 41 is the range (220 - 180 + 1)
};

const getStaticRating = (slug) => {
    if (STATIC_RATINGS[slug]) return STATIC_RATINGS[slug];

    // Generate deterministic random number between 4.6 and 4.8
    const random = getSeededRandom((slug || 'default') + '_rating');
    const steps = [4.6, 4.7, 4.8];
    const index = Math.floor(random * 3);
    return steps[index];
};

export default function ServicePage() {
    const params = useParams();
    const router = useRouter();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                setLoading(true);
                // Fetch from backend API using slug endpoint
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/slug/${params.slug}`);

                if (res.ok) {
                    const data = await res.json();
                    setService(data);
                } else {
                    toast.error('Service not found');
                    router.push('/services');
                }
            } catch (error) {
                console.error('Error fetching service:', error);
                toast.error('Failed to load service details');
                router.push('/services');
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchService();
        }
    }, [params.slug, router]);

    const handleBookNow = () => {
        router.push(`/booking?service=${service.slug}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!service) {
        return null;
    }

    // Determine which features to show
    const displayFeatures = (service.features && service.features.length > 0)
        ? service.features
        : (FALLBACK_FEATURES[service.slug] || ["Professional & verified staff", "Quality service guarantee", "Punctual & reliable", "Safety-first approach", "Customized as per your needs"]);

    const staticReviewCount = getStaticReviewCount(service.slug);
    const staticRating = getStaticRating(service.slug);

    return (
        <main className="min-h-screen bg-transparent">
            <div className="min-h-screen bg-transparent">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    {/* Background gradient removed to match Home bg */}

                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Content */}
                            <div>
                                {service.badge && (
                                    <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                                        {service.badge}
                                    </span>
                                )}

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                                    {service.title}
                                </h1>

                                <p className="text-xl text-slate-600 mb-4 leading-relaxed">
                                    {service.description}
                                </p>

                                {/* Price Range */}
                                {service.minPrice > 0 && service.maxPrice > 0 && (
                                    <div className="mb-8">
                                        <span className="text-3xl font-bold text-blue-600">
                                            {`₹${service.minPrice.toLocaleString()} - ₹${service.maxPrice.toLocaleString()}`}
                                        </span>
                                        <span className="text-slate-500 ml-2">per month</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-2xl font-bold text-slate-900">{staticRating}</span>
                                        <span className="text-slate-600">({staticReviewCount}+ reviews)</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBookNow}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                >
                                    Book Now <ArrowRight size={20} />
                                </button>
                            </div>

                            {/* Video or Image */}
                            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                                {service.video ? (
                                    <video
                                        src={service.video}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover pointer-events-none"
                                    />
                                ) : (
                                    <Image
                                        src={service.imageUrl || "/placeholder.jpg"}
                                        alt={service.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white/10 backdrop-blur-[2px]">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center font-display">
                            What&apos;s Included
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {displayFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-4 rounded-xl hover:bg-white/20 transition-all border border-transparent hover:border-white/30 backdrop-blur-[1px]"
                                >
                                    <div className="w-6 h-6 rounded-full bg-blue-100/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                        <Check className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 1. Stats Section */}
                <ServiceStats />

                {/* 2. Testimonials */}
                <TestimonialCarousel />

                {/* 3. Trust Markers */}
                <TrustMarkers />

                {/* 4. Credibility Logos */}
                <CredibilityLogos />

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Book {service.title} today and experience professional, verified service at your doorstep.
                        </p>
                        <button
                            onClick={handleBookNow}
                            className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            Book This Service
                        </button>
                    </div>
                </section>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
