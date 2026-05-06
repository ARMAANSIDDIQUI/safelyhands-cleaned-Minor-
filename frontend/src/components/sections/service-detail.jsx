"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, CheckCircle2, Clock, Star } from 'lucide-react';

// Static mappings for review counts and ratings - Duplicated for component self-containment
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

const getSeededRandom = (seed) => {
    let value = 0;
    for (let i = 0; i < seed.length; i++) {
        value += seed.charCodeAt(i);
    }
    const x = Math.sin(value) * 10000;
    return x - Math.floor(x);
};

const getStaticRating = (slug) => {
    if (STATIC_RATINGS[slug]) return STATIC_RATINGS[slug];
    const random = getSeededRandom((slug || 'default') + '_rating');
    const steps = [4.6, 4.7, 4.8];
    const index = Math.floor(random * 3);
    return steps[index];
};

export default function ServiceDetail({ initialData, slug }) {
    const [data, setData] = React.useState(initialData || null);
    const [loading, setLoading] = React.useState(!initialData);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!initialData && slug) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    // Use backend port from enviroment variable
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/slug/${slug}`);
                    if (!res.ok) {
                        throw new Error('Service not found');
                    }
                    const result = await res.json();
                    setData(result);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [initialData, slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="text-xl text-slate-600 animate-pulse">Loading service specific details...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
                <div className="text-xl text-red-500">Service not found</div>
                <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
            </div>
        );
    }

    const staticRating = getStaticRating(data.slug);

    return (
        <div className="font-sans">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center text-white">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <ShieldCheck className="text-blue-400" size={24} />
                        <span className="font-semibold text-blue-100 tracking-wide uppercase text-sm">Premium Certified Service</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">{data.title}</h1>
                    <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
                        {data.description}
                    </p>
                    <div className="mt-10">
                        <Link
                            href="/booking"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-all hover:scale-105 shadow-lg shadow-blue-900/50"
                        >
                            Book {data.title} <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Details Section */}
            <section className="py-20 bg-transparent">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        {/* Content */}
                        <div className="order-2 md:order-1">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Choose Our {data.title}?</h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                Experience top-tier service with our {data.title.toLowerCase()}. We ensure quality, reliability, and professionalism in every engagement.
                            </p>

                            <ul className="space-y-4">
                                {data.features && data.features.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="text-green-500 shrink-0 mt-1" />
                                        <span className="text-slate-800 font-medium text-lg">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Feature Cards */}
                        <div className="order-1 md:order-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="font-bold text-slate-900 mb-2">Verified Staff</h3>
                                <p className="text-sm text-slate-500">Every professional undergoes rigorous background checks.</p>
                            </div>
                            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <Clock className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="font-bold text-slate-900 mb-2">Replacements</h3>
                                <p className="text-sm text-slate-500">Unlimited replacements during your subscription period.</p>
                            </div>
                            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <Star className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="font-bold text-slate-900 mb-2">Top Rated</h3>
                                <p className="text-sm text-slate-500">{staticRating}/5 average rating from happy customers.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 bg-transparent border-t border-slate-200">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
                    <Link href="/booking" className="text-blue-600 font-bold hover:underline text-lg">
                        Book your {data.title.toLowerCase()} today &rarr;
                    </Link>
                </div>
            </section>
        </div>
    );
}
