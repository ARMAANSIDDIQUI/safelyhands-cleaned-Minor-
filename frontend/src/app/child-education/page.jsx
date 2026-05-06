"use client";

import React, { useState } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function ChildEducationPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        childrenCount: '',
        additionalDetails: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'Child Education',
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    details: {
                        childrenCount: formData.childrenCount,
                        additionalDetails: formData.additionalDetails
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Interest registered successfully! We will contact you soon.');
                setFormData({ name: '', email: '', phone: '', childrenCount: '', additionalDetails: '' });
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="pt-[120px] pb-20 px-4 md:px-8 relative">

                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <span className="inline-block bg-sky-100 text-sky-600 font-bold px-4 py-2 rounded-full text-sm border border-sky-200">
                                Worker Welfare Initiative
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 leading-tight">
                                Securing the Future:<br />
                                <span className="text-sky-500">Child Education Support</span>
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                                We believe every child deserves quality education. Join our initiative to support the children of our dedicated workers. Fill the form to enroll or learn more.
                            </p>
                        </div>

                        <div className="flex-1 w-full max-w-lg">
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                                <h3 className="text-2xl font-bold mb-6 text-slate-800">Enrollment / Inquiry</h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Your Name</label>
                                        <input
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                                        <input
                                            name="phone"
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Email (Optional)</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Number of Children</label>
                                        <input
                                            name="childrenCount"
                                            type="number"
                                            value={formData.childrenCount}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="e.g. 2"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Additional Details</label>
                                        <textarea
                                            name="additionalDetails"
                                            rows="3"
                                            value={formData.additionalDetails}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none font-medium"
                                            placeholder="Any specific requirements?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-sky-500 text-white font-bold h-12 rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Submit Inquiry <ArrowRight size={18} /></>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
