"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, Filter } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminBookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setBookings(await res.json());
        } catch (error) {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const filtered = bookings.filter(b => {
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        // Check for items array support, fallback to serviceType
        const serviceName = b.items?.[0]?.subCategory?.name || b.serviceType || "";
        const matchesSearch =
            b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            b._id.includes(search) ||
            serviceName.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'approved': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Bookings</h1>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search user, ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all",
                                    statusFilter === status ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((booking) => (
                                <tr key={booking._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{booking._id.slice(-6)}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{booking.user?.name || "Unknown"}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {booking.items?.length > 0 ? (
                                            <span className="flex flex-col">
                                                {booking.items.map((item, i) => (
                                                    <span key={i} className="text-slate-700">• {item.subCategory?.name || "Item"}</span>
                                                ))}
                                            </span>
                                        ) : (
                                            booking.serviceType
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(booking.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/dashboard/admin/bookings/${booking._id}`} className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Eye size={18} />
                                        </Link>
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
