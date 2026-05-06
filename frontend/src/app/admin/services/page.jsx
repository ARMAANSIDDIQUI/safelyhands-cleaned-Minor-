"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from "@/components/ui/confirm-dialog";

import { getToken } from '@/lib/auth';

export default function AdminServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${deletingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (res.ok) {
                toast.success("Service and all associated data deleted");
                fetchServices();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete service");
            }
        } catch (error) {
            toast.error("Error deleting service");
        }
    };

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Services Management</h1>
                    <p className="text-slate-500">Manage all services, subcategories, and dynamic forms</p>
                </div>
                <Link href="/admin/services/new" className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors">
                    <Plus size={20} />
                    Add New Service
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
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
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Price Range</th>
                                <th className="px-6 py-4">Subcats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-500">Loading...</td>
                                </tr>
                            ) : filteredServices.map((service) => (
                                <tr key={service._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {service.imageUrl ? (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                                                    <img src={service.imageUrl} alt="" className="object-cover w-full h-full" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <span className="text-xs font-bold">IMG</span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-800">{service.title}</div>
                                                <div className="text-xs text-slate-400 font-mono">{service.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-700">
                                            {service.minPrice > 0 ? `₹${service.minPrice.toLocaleString()} - ₹${service.maxPrice.toLocaleString()}` : `₹${service.basePrice?.toLocaleString() || 0}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold">
                                            {service.subcategories?.length || 0} items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/services/${service._id}`} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setDeletingId(service._id);
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
                title="Delete Service"
                description="CAUTION: This will PERMANENTLY delete this service along with ALL associated subcategories, bookings, and attendance records. This action cannot be undone."
                confirmText="Delete Everything"
                loading={loading}
            />
        </div>
    );
}