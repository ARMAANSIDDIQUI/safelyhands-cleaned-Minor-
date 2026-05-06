"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
            if (res.ok) setServices(await res.json());
        } catch (error) {
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                toast.success("Status updated");
                fetchServices();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filtered = services.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Services</h1>
                <Link href="/dashboard/admin/services/new" className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                    <Plus size={18} /> Add New
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((service) => (
                                <tr key={service._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-bold text-slate-800">{service.title}</td>
                                    <td className="px-6 py-4 text-slate-500">{service.slug}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(service._id, service.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${service.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                        >
                                            {service.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/admin/services/${service._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                <Edit2 size={18} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
