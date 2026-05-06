"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Search, Trash2, Layers, ArrowUpRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from "@/components/ui/confirm-dialog";

import { getToken } from '@/lib/auth';

export default function AdminSubCategoriesPage() {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchSubcategories();
    }, []);

    const fetchSubcategories = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subcategories`);
            if (res.ok) {
                const data = await res.json();
                setSubcategories(data);
            }
        } catch (error) {
            toast.error("Failed to load subcategories");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subcategories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                toast.success(`Subcategory marked ${!currentStatus ? 'active' : 'inactive'}`);
                setSubcategories(prev => prev.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s));
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subcategories/${deletingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (res.ok) {
                toast.success("Subcategory deleted");
                fetchSubcategories();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete (Backend implementation needed)");
            }
        } catch (error) {
            toast.error("Error deleting");
        }
    };

    const filteredSubs = subcategories.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.service?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Layers className="text-blue-500" />
                        Subcategories Management
                    </h1>
                    <p className="text-slate-500">Manage all subcategories across services</p>
                </div>
                <Link
                    href="/admin/subcategories/new"
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    <Plus size={20} />
                    Add New Subcategory
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search subcategories or services..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Subcategory</th>
                                <th className="px-6 py-4">Parent Service</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Features</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-500">Loading...</td>
                                </tr>
                            ) : filteredSubs.map((sub) => (
                                <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {sub.image ? (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                                                    <img src={sub.image} alt="" className="object-cover w-full h-full" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400">
                                                    <Layers size={20} />
                                                </div>
                                            )}
                                            <div className="font-bold text-slate-800">{sub.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {sub.service ? (
                                            <Link href={`/admin/services/${sub.service._id}`} className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium">
                                                {sub.service.title} <ArrowUpRight size={12} />
                                            </Link>
                                        ) : (
                                            <span className="text-slate-400 italic">Orphaned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 font-mono text-sm">
                                        ₹{sub.price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(sub._id, sub.isActive !== false)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${sub.isActive !== false
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                        >
                                            {sub.isActive !== false ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {sub.features?.length || 0} features
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/subcategories/${sub._id}`}
                                                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setDeletingId(sub._id);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Delete Subcategory"
                description="Are you sure you want to delete this subcategory? This action cannot be undone."
                confirmText="Delete"
                loading={loading}
            />
        </div>
    );
}
