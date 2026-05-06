"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from "@/components/ui/confirm-dialog";

import { getToken } from '@/lib/auth';

export default function AdminCitiesPage() {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCity, setCurrentCity] = useState(null); // null for new, object for edit
    const [formData, setFormData] = useState({ name: '', slug: '', icon: '', isActive: true });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities`);
            if (res.ok) {
                const data = await res.json();
                setCities(data);
            }
        } catch (error) {
            toast.error("Failed to load cities");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = currentCity
            ? `${process.env.NEXT_PUBLIC_API_URL}/cities/${currentCity._id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/cities`;

        const method = currentCity ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(currentCity ? "City updated" : "City created");
                fetchCities();
                closeModal();
            } else {
                const err = await res.json();
                toast.error(err.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Error saving city");
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities/${deletingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (res.ok) {
                toast.success("City deleted");
                fetchCities();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting city");
        }
    };

    const openModal = (city = null) => {
        if (city) {
            setCurrentCity(city);
            setFormData({ name: city.name, slug: city.slug, icon: city.icon || '', isActive: city.isActive });
        } else {
            setCurrentCity(null);
            setFormData({ name: '', slug: '', icon: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCity(null);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">City Management</h1>
                    <p className="text-slate-500">Manage available cities for services</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    <Plus size={20} />
                    Add New City
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-500">Loading...</td>
                                </tr>
                            ) : cities.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-500">No cities found. Add one to get started.</td>
                                </tr>
                            ) : cities.map((city) => (
                                <tr key={city._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                            <MapPin size={16} />
                                        </div>
                                        {city.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-sm">{city.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${city.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {city.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(city)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeletingId(city._id);
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {currentCity ? 'Edit City' : 'Add New City'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">City Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. New Delhi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono text-sm"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="e.g. new-delhi (auto-generated if empty)"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.isActive ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300'}`}>
                                        {formData.isActive && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="font-bold text-slate-700">Active</span>
                                </label>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                                >
                                    {currentCity ? 'Update City' : 'Create City'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Delete City"
                description="Are you sure you want to delete this city? This action cannot be undone."
                confirmText="Delete"
                loading={loading}
            />
        </div>
    );
}
