"use client";

import React, { useEffect, useState } from "react";
import { Users, CalendarCheck, TrendingUp, DollarSign, Activity, PieChart as PieIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

import { getToken } from "@/lib/auth";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAnalytics, selectAnalyticsData, selectAnalyticsStatus } from "@/store/slices/analyticsSlice";

// ... (charts imports)

export default function AdminOverview() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectAnalyticsData);
    const status = useAppSelector(selectAnalyticsStatus);
    const loading = status === 'loading' || status === 'idle';

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAnalytics());
        }
    }, [status, dispatch]);

    if (loading && !data) return <div className="p-8">Loading analytics...</div>;
    if (!data) return <div className="p-8">Failed to load data.</div>;

    const { stats, charts, recentActivity } = data;

    return (
        // ... (rest of the component remains same)
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={<CalendarCheck className="text-blue-600" size={24} />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="text-purple-600" size={24} />}
                    color="bg-purple-50"
                />
                <StatCard
                    title="Active Workers"
                    value={stats.totalWorkers}
                    icon={<Users className="text-green-600" size={24} />}
                    color="bg-green-50"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Activity className="text-blue-600" size={24} />}
                    color="bg-blue-50"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} /> Revenue Overview
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <PieIcon size={18} /> Service Distribution
                    </h3>
                    <div className="h-[300px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.bookingsByService}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {charts.bookingsByService.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">User</th>
                                <th className="px-4 py-3">Service</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 rounded-r-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((item) => (
                                <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{item.user?.name || 'Unknown'}</td>
                                    <td className="px-4 py-3 capitalize">{item.serviceType}</td>
                                    <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {item.status}
                                        </span>
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

function StatCard({ title, value, icon, trend, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-slate-500 mb-3">{title}</p>
            {trend && (
                <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <TrendingUp size={14} />
                    {trend}
                </div>
            )}
        </div>
    );
}
