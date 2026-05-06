"use client";

import React, { useState } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

export default function ReferWorkerPage() {
    const [formData, setFormData] = useState({
        referrerName: '',
        referrerPhone: '',
        workerName: '',
        workerPhone: '',
        profession: ''
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
                    type: 'Worker Referral',
                    name: formData.referrerName,
                    phone: formData.referrerPhone,
                    details: {
                        workerName: formData.workerName,
                        workerPhone: formData.workerPhone,
                        profession: formData.profession
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Referral submitted successfully! Thank you.');
                setFormData({ referrerName: '', referrerPhone: '', workerName: '', workerPhone: '', profession: '' });
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
                                Referral Program
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 leading-tight">
                                Refer a Helper & <br />
                                <span className="text-sky-500">Earn Rewards</span>
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Know someone looking for work? Refer them to Safely Hands. Help them find a respectful job and earn rewards for every successful placement.
                            </p>
                        </div>

                        <div className="flex-1 w-full max-w-md">
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                                <h3 className="text-2xl font-bold mb-6 text-slate-800">Refer Now</h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Your Name (Referrer)</label>
                                        <input
                                            name="referrerName"
                                            required
                                            value={formData.referrerName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Your Phone</label>
                                        <input
                                            name="referrerPhone"
                                            required
                                            type="tel"
                                            value={formData.referrerPhone}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                            placeholder="9876543210"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/60">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Worker Details</h4>
                                        <div className="space-y-3">
                                            <input
                                                name="workerName"
                                                required
                                                value={formData.workerName}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                                placeholder="Worker's Name"
                                            />
                                            <input
                                                name="workerPhone"
                                                required
                                                type="tel"
                                                value={formData.workerPhone}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                                                placeholder="Worker's Phone"
                                            />
                                            <select
                                                name="profession"
                                                value={formData.profession}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-medium"
                                            >
                                                <option value="">Job Type</option>
                                                <option value="Maid">Maid</option>
                                                <option value="Cook">Cook</option>
                                                <option value="Babysitter">Babysitter</option>
                                                <option value="Elderly Care">Elderly Care</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-sky-500 text-white font-bold h-12 rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Submit Referral <ArrowRight size={18} /></>}
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
