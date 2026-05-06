"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, Mail, Phone, Calendar, Loader2, ShieldCheck, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default function UserList() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                toast.error(data.message || "Failed to fetch users");
            }
        } catch (err) {
            toast.error("Error loading users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Registered Users</h1>
                    <p className="text-slate-500 mt-2">View and manage all registered customers and staff.</p>
                </div>
                <div className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-700">User Details</th>
                                <th className="p-4 font-semibold text-slate-700">Contact Info</th>
                                <th className="p-4 font-semibold text-slate-700">Role</th>
                                <th className="p-4 font-semibold text-slate-700">Join Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500 italic">No users found.</td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden border border-blue-100">
                                                    {u.profilePicture ? (
                                                        <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-sm">{u.name?.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{u.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">ID: {u._id.slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {u.email}
                                                </div>
                                                {u.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Phone size={14} className="text-slate-400" />
                                                        {u.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                    u.role === 'worker' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-emerald-100 text-emerald-700'}`}>
                                                {u.role === 'admin' && <ShieldCheck size={12} />}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDate(u.createdAt)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
