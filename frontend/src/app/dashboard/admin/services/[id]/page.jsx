"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";

export default function EditServicePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [subCategories, setSubCategories] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        imageUrl: "",
        icon: "",
        isActive: true,
        selectionMode: "single",
        gender: "Both"
    });

    useEffect(() => {
        if (id) {
            fetchService();
            fetchSubCategories();
        }
    }, [id]);

    const fetchService = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    description: data.description,
                    imageUrl: data.imageUrl || "",
                    icon: data.icon || "",
                    isActive: data.isActive,
                    selectionMode: data.selectionMode || "single",
                    gender: data.gender || "Both"
                });
            }
        } catch (error) {
            toast.error("Failed to fetch service");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}/subcategories`);
            if (res.ok) setSubCategories(await res.json());
        } catch (error) {
            console.error("Failed to fetch subcategories");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Service updated");
            } else {
                toast.error("Failed to update");
            }
        } catch (error) {
            toast.error("Error updating service");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Edit Service</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Service Details Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Basic Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    disabled
                                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-32"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Icon (Lucide name)</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                        placeholder="e.g. Home, User"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Service Image</label>
                                    <ImageUpload
                                        value={formData.imageUrl}
                                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Selection Mode</label>
                                    <select
                                        value={formData.selectionMode}
                                        onChange={(e) => setFormData({ ...formData, selectionMode: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="single">Single (Replace)</option>
                                        <option value="multiple">Multiple (Accumulate)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="Both">Both</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right: SubCategories List */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Sub-Categories</h2>
                            <Link href={`/dashboard/admin/services/${id}/subcategories/new`} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg">
                                <Plus size={20} />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {subCategories.map(sub => (
                                <div key={sub._id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{sub.name}</h3>
                                            <p className="text-xs text-slate-500">₹{sub.price}</p>
                                        </div>
                                        <Link href={`/dashboard/admin/services/${id}/subcategories/${sub._id}`} className="text-slate-400 hover:text-blue-600">
                                            <Edit size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {subCategories.length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-4">No sub-categories yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
