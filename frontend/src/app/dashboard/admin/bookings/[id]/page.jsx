"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, User, MapPin, Calendar, Clock, CheckCircle, XCircle, Receipt } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BookingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setBooking(await res.json());
        } catch (error) {
            toast.error("Failed to fetch booking");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Booking ${newStatus}`);
                fetchBooking();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!booking) return <div className="p-10 text-center">Booking not found</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-800">Booking #{id.slice(-6)}</h1>
                    <p className="text-slate-400 text-sm">Created on {new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    {booking.status === 'pending' && (
                        <>
                            <button onClick={() => updateStatus('approved')} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 flex items-center gap-2">
                                <CheckCircle size={18} /> Approve
                            </button>
                            <button onClick={() => updateStatus('rejected')} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 flex items-center gap-2">
                                <XCircle size={18} /> Reject
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left: Booking Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Ordered Items</h2>
                        <div className="space-y-4">
                            {booking.items?.length > 0 ? (
                                booking.items.map((item, i) => (
                                    <div key={i} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900">{item.subCategory?.name || "Unknown Item"}</h3>
                                            <span className="font-bold text-blue-500">₹{item.price}</span>
                                        </div>
                                        {/* Display Answers */}
                                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                            {item.answers && Object.entries(item.answers).map(([key, val]) => (
                                                <div key={key}>
                                                    <span className="text-slate-400 capitalize">{key}: </span>
                                                    <span className="font-medium">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Legacy Booking: {booking.serviceType}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Scheduling</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Start Date</p>
                                    <p className="font-medium text-slate-800">{new Date(booking.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Time</p>
                                    <p className="font-medium text-slate-800">{booking.time || "Not specified"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: User & Status */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Customer</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{booking.user?.name}</p>
                                <p className="text-sm text-slate-500">{booking.user?.email}</p>
                                <p className="text-sm text-slate-500">{booking.user?.phone}</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex gap-3">
                                <MapPin size={18} className="text-slate-400 flex-shrink-0 mt-1" />
                                <p className="text-sm text-slate-600 leading-relaxed">{booking.address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Booking Status</h2>
                        <div className={cn(
                            "p-4 rounded-xl text-center font-bold capitalize text-lg mb-4",
                            booking.status === 'approved' ? "bg-green-100 text-green-700" :
                                booking.status === 'rejected' ? "bg-red-100 text-red-700" :
                                    "bg-yellow-100 text-yellow-700"
                        )}>
                            {booking.status}
                        </div>
                        {booking.notes && (
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic">
                                "{booking.notes}"
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Receipt size={20} className="text-slate-500" />
                            Payment Proof
                        </h2>
                        {booking.paymentProofUrl ? (
                            <div className="mt-2">
                                {booking.paymentProofUrl.match(/\.(mp4|webm|mov|ogg|m4v|avi)$/i) || booking.paymentProofUrl.includes('/video/upload/') ? (
                                    <video src={booking.paymentProofUrl} controls className="w-full rounded-lg border border-slate-200" />
                                ) : (
                                    <a href={booking.paymentProofUrl} target="_blank" rel="noreferrer">
                                        <img src={booking.paymentProofUrl} alt="Payment Proof" className="w-full rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity" />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">No payment proof uploaded.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
