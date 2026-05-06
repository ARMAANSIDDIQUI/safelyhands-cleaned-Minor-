"use client";

import React, { useState } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

export default function HealthInsurancePage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        workerName: '',
        coverageType: ''
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
                    type: 'Health Insurance',
                    name: formData.name,
                    phone: formData.phone,
                    details: {
                        workerName: formData.workerName,
                        coverageType: formData.coverageType
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Inquiry submitted successfully! We will contact you soon.');
                setFormData({ name: '', phone: '', workerName: '', coverageType: '' });
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

                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <span className="inline-block bg-sky-100 text-sky-600 font-bold px-4 py-2 rounded-full text-sm border border-sky-200">
                                Worker Welfare
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 leading-tight">
                                Protect Their Health with <br />
                                <span className="text-sky-500">Affordable Insurance</span>
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Get your domestic help the security they need with our affordable health insurance plans. Covers hospitalization, critical illness, and more.
                            </p>
                        </div>

                        <div className="flex-1 w-full max-w-md">
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                                <h3 className="text-2xl font-bold mb-6 text-slate-800">Inquire Now</h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Your Name (Employer)</label>
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
                                        <label className="text-sm font-bold text-slate-700 ml-1">Your Phone</label>
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
                                        <label className="text-sm font-bold text-slate-700 ml-1">Worker Name</label>
                                        <input
                                            name="workerName"
                                            value={formData.workerName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="Name of person to insure"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Coverage Type</label>
                                        <select
                                            name="coverageType"
                                            value={formData.coverageType}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-medium"
                                        >
                                            <option value="">Select Plan Type</option>
                                            <option value="Basic">Basic (Hospitalization)</option>
                                            <option value="Comprehensive">Comprehensive (All Inclusive)</option>
                                            <option value="Family Floater">Family Floater</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-sky-500 text-white font-bold h-12 rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Get Quote <ArrowRight size={18} /></>}
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
