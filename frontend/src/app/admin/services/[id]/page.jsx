"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import ImageUpload from "@/components/ui/image-upload";

import { getToken } from '@/lib/auth';

export default function EditServicePage({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [service, setService] = useState({
        title: '',
        slug: '',
        category: '',
        description: '',
        imageUrl: '',
        icon: '',
        basePrice: 0,
        subcategories: [],
        questions: []
    });

    useEffect(() => {
        fetchService();
    }, [id]);

    const fetchService = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`);
            if (res.ok) {
                const data = await res.json();
                setService(data);
            } else {
                toast.error("Failed to load service");
                router.push('/admin/services');
            }
        } catch (error) {
            toast.error("Error loading service");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(service)
            });

            if (res.ok) {
                toast.success("Service updated successfully");
                router.push('/admin/services');
            } else {
                toast.error("Failed to update service");
            }
        } catch (error) {
            toast.error("Error updating service");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Edit Service</h1>
                        <p className="text-slate-500">Editing {service.title} ({service.slug})</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Basic Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Basic Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={service.title}
                            onChange={(e) => setService({ ...service, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                        <input
                            type="text"
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                            value={service.slug}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Base Price</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={service.basePrice}
                            onChange={(e) => setService({ ...service, basePrice: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={service.category}
                            onChange={(e) => setService({ ...service, category: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Price Range - Min (₹)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={service.minPrice || ''}
                            onChange={(e) => setService({ ...service, minPrice: parseFloat(e.target.value) || 0 })}
                            placeholder="Minimum price"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Price Range - Max (₹)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={service.maxPrice || ''}
                            onChange={(e) => setService({ ...service, maxPrice: parseFloat(e.target.value) || 0 })}
                            placeholder="Maximum price"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 h-24 resize-none"
                            value={service.description}
                            onChange={(e) => setService({ ...service, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Service Icon (Lucide name or URL)</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={service.icon}
                            onChange={(e) => setService({ ...service, icon: e.target.value })}
                            placeholder="e.g. Home, User, Sparkles"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Service Image</label>
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6">
                            <ImageUpload
                                value={service.imageUrl}
                                onChange={(url) => setService({ ...service, imageUrl: url })}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Service Video (Optional)</label>
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6">
                            <ImageUpload
                                value={service.video || ''}
                                onChange={(url) => setService({ ...service, video: url })}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">If provided, video will be shown instead of image on service page</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
