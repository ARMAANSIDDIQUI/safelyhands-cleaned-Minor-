"use client";

import React, { useState } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

export default function WorkerRegistrationPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        profession: '',
        experience: '',
        location: ''
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
                    type: 'Worker Registration',
                    name: formData.name,
                    phone: formData.phone,
                    details: {
                        profession: formData.profession,
                        experience: formData.experience,
                        location: formData.location
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Registration request sent! We will contact you soon.');
                setFormData({ name: '', phone: '', profession: '', experience: '', location: '' });
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
                                Join Our Family
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 leading-tight">
                                Become a <span className="text-sky-500">Safely Hands Partner</span>
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Are you an experienced helper? Join our platform to find trusted work, get fair pay, and access exclusive benefits like health insurance and child education support.
                            </p>
                        </div>

                        <div className="flex-1 w-full max-w-md">
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                                <h3 className="text-2xl font-bold mb-6 text-slate-800">Worker Registration</h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                        <input
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="Your name"
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Profession</label>
                                            <select
                                                name="profession"
                                                required
                                                value={formData.profession}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-medium"
                                            >
                                                <option value="">Select</option>
                                                <option value="Maid">Maid</option>
                                                <option value="Cook">Cook</option>
                                                <option value="Babysitter">Babysitter</option>
                                                <option value="Elderly Care">Elderly Care</option>
                                                <option value="Driver">Driver</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Experience (Yrs)</label>
                                            <input
                                                name="experience"
                                                type="number"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                                placeholder="e.g. 5"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Preferred Location</label>
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="e.g. South Delhi"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-sky-500 text-white font-bold h-12 rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Register Now <ArrowRight size={18} /></>}
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
