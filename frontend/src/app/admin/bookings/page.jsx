"use client";

import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, X, Eye, Loader2, Calendar as CalendarIcon, MapPin, Search, Pencil, Trash2, Clock, History, FileText, RefreshCcw, Download, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { isSameDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ConfirmDialog from "@/components/ui/confirm-dialog";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchAllBookings,
    selectAdminBookings,
    selectAdminBookingStatus,
    invalidateAdminBookings
} from "@/store/slices/bookingSlice";

export default function AdminBookings() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const bookings = useAppSelector(selectAdminBookings);
    const status = useAppSelector(selectAdminBookingStatus);
    const isLoading = status === 'loading';

    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState({});
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [workersWithAvailability, setWorkersWithAvailability] = useState({});
    const [editingBooking, setEditingBooking] = useState(null);
    const [viewingBooking, setViewingBooking] = useState(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        serviceType: "",
        frequency: "",
        date: "",
        address: "",
        notes: "",
        totalAmount: 0
    });

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllBookings());
        }
    }, [status, dispatch]);

    const fetchWorkers = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setWorkers(data);
            }
        } catch (err) {
            toast.error("Failed to fetch workers");
        }
    };

    const fetchAvailability = async (booking) => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers/availability?date=${booking.date}&time=${booking.time}&frequency=${booking.frequency}&t=${Date.now()}`, {
                headers: { "Authorization": `Bearer ${token}` },
                cache: 'no-store'
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setWorkersWithAvailability(prev => ({ ...prev, [booking._id]: data }));
            }
        } catch (err) {
            console.error("Failed to fetch availability", err);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${deletingId}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Booking deleted permanently");
                dispatch(invalidateAdminBookings());
                dispatch(fetchAllBookings());
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete booking");
            }
        } catch (error) {
            toast.error("Error deleting booking");
        }
    };

    const handleOpenEdit = (booking) => {
        setEditingBooking(booking);
        setEditFormData({
            serviceType: booking.serviceType,
            frequency: booking.frequency,
            date: booking.date ? new Date(booking.date).toISOString().split('T')[0] : "",
            address: booking.address,
            notes: booking.notes || "",
            totalAmount: booking.totalAmount || 0
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${editingBooking._id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                toast.success("Booking updated!");
                setIsEditDialogOpen(false);
                dispatch(invalidateAdminBookings());
                dispatch(fetchAllBookings());
            } else {
                toast.error("Update failed");
            }
        } catch (error) {
            toast.error("Failed to update booking");
        }
    };

    useEffect(() => {
        if (user) {
            fetchWorkers();
        }
    }, [user]);

    const handleAssignWorker = async (bookingId) => {
        const workerId = selectedWorker[bookingId];
        if (!workerId) {
            toast.error("Please select a worker first");
            return;
        }

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/assign`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ workerId })
            });

            if (res.ok) {
                toast.success("Worker assigned & booking approved!");
                dispatch(invalidateAdminBookings());
                dispatch(fetchAllBookings());
            } else {
                throw new Error("Failed to assign");
            }
        } catch (error) {
            toast.error("Assignment failed");
        }
    };

    const handleStatusUpdate = async (bookingId, status, paymentStatus) => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status, paymentStatus })
            });

            if (res.ok) {
                // If the only thing changed was paymentStatus, show a payment specific toast
                const booking = bookings.find(b => b._id === bookingId);
                if (booking && booking.status === status && booking.paymentStatus !== paymentStatus) {
                    toast.success(`Payment status updated to ${paymentStatus}`);
                } else {
                    toast.success(`Booking marked as ${status}`);
                }
                dispatch(invalidateAdminBookings());
                dispatch(fetchAllBookings());
            } else {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAttendanceUpdate = async (bookingId, attendanceStatus, date) => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/attendance`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ attendanceStatus, date }),
                cache: 'no-store'
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Attendance marked`);

                // 1. Optimistic/Immediate update in Redux
                if (data.booking) {
                    dispatch({ type: 'bookings/updateBookingInAdmin', payload: data.booking });
                }

                // 2. Background refresh
                dispatch(invalidateAdminBookings());
                dispatch(fetchAllBookings());
            } else {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update attendance");
            }
        } catch (error) {
            console.error(`[DEBUG] Attendance Error:`, error);
            toast.error(error.message || "Failed to update attendance");
        }
    };

    const handleDownloadBill = async (bookingId) => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/download-bill`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to download bill");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Bill_${bookingId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success("Bill downloaded!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download bill");
        }
    };

    const handleDownloadAttendance = async (bookingId, type) => {
        try {
            const token = getToken();
            const endpoint = type === 'pdf' ? 'download-pdf' : 'download-csv';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/booking/${bookingId}/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`Failed to download attendance ${type}`);

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Attendance_${bookingId}.${type}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success(`Attendance ${type.toUpperCase()} downloaded!`);
        } catch (error) {
            console.error("Download error:", error);
            toast.error(`Failed to download attendance ${type}`);
        }
    };

    const getDailyAttendanceStatus = (booking) => {
        if (!booking.attendanceLogs || booking.attendanceLogs.length === 0) return 'not_marked';

        // Use IST (+5:30) for robust comparison across timezones
        const nowIST = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        const todayStr = nowIST.toISOString().split('T')[0];

        const todayLog = booking.attendanceLogs.find(log => {
            const logDateStr = new Date(log.date).toISOString().split('T')[0];
            return logDateStr === todayStr;
        });

        return todayLog?.status || 'not_marked';
    };


    const filteredBookings = bookings.filter(b => {
        if (filter === 'new') return b.status === 'pending';
        if (filter === 'active') return ['approved', 'in_progress'].includes(b.status);
        if (filter === 'history') return ['completed', 'cancelled', 'rejected'].includes(b.status);
        return true; // 'all'
    });

    if (isLoading && bookings.length === 0) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Bookings Management</h1>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            toast.info("Refreshing...");
                            dispatch(invalidateAdminBookings());
                            dispatch(fetchAllBookings());
                        }}
                        className="gap-2"
                    >
                        <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filter Tabs - Inserted below header */}
            <div className="flex bg-white border border-slate-200 p-1 rounded-lg w-fit mb-4">
                <button
                    onClick={() => setFilter('new')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'new'
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    New Requests
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'active'
                        ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilter('history')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'history'
                        ? 'bg-slate-100 text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    History
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all'
                        ? 'bg-slate-100 text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    All
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-700">Booking ID</th>
                                <th className="p-4 font-semibold text-slate-700">Service & Date</th>
                                <th className="p-4 font-semibold text-slate-700">Customer</th>
                                <th className="p-4 font-semibold text-slate-700">Status</th>
                                <th className="p-4 font-semibold text-slate-700">Payment</th>
                                <th className="p-4 font-semibold text-slate-700">Price</th>
                                <th className="p-4 font-semibold text-slate-700">Assigned Professional</th>
                                <th className="p-4 font-semibold text-slate-700 text-center">Attendance</th>
                                <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-slate-500">No bookings found</td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-slate-500">#{booking._id.slice(-6)}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 capitalize mb-1">{(booking.serviceType || booking.items?.[0]?.subCategory?.service?.title || booking.items?.[0]?.subCategory?.name || 'Unknown Service').replace('-', ' ')}</div>

                                            {/* Sub-items list */}
                                            {booking.items && booking.items.length > 0 && (
                                                <div className="flex flex-col gap-0.5 mb-2">
                                                    {booking.items.map((item, idx) => (
                                                        <div key={idx} className="text-[11px] text-slate-600 flex justify-between bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                            <span>• {item.subCategory?.name || 'Service'}</span>
                                                            <span className="font-mono text-slate-500">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <CalendarIcon size={12} />
                                                {formatDate(booking.date)}
                                            </div>
                                            {booking.time && (
                                                <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-0.5">
                                                    <Clock size={10} />
                                                    {booking.time}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{booking.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-slate-500">{booking.address?.slice(0, 20)}...</div>
                                            <div className="text-xs text-slate-500 mt-1 font-mono">{booking.phone || booking.user?.phone || 'No phone'}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                        booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-amber-100 text-amber-800'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                        ${booking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {booking.paymentStatus || 'unpaid'}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, booking.status, 'paid')}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${booking.paymentStatus === 'paid' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 hover:border-emerald-500 hover:text-emerald-500'}`}
                                                    >
                                                        Paid
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, booking.status, 'unpaid')}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${booking.paymentStatus === 'unpaid' || !booking.paymentStatus ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 hover:border-red-500 hover:text-red-500'}`}
                                                    >
                                                        Unp
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-slate-700">₹{booking.totalAmount || 0}</div>
                                        </td>
                                        <td className="p-4">
                                            {booking.assignedWorker || booking.worker ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{(booking.assignedWorker || booking.worker).name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {(booking.assignedWorker || booking.worker) ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    {/* Today's Quick Status */}
                                                    {(() => {
                                                        const status = getDailyAttendanceStatus(booking);
                                                        return (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase
                                                                        ${status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                                                        status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {status.replace('_', ' ')}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleAttendanceUpdate(booking._id, 'present')}
                                                                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${status === 'present' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 hover:border-emerald-500 hover:text-emerald-500'}`}
                                                                    >
                                                                        P
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAttendanceUpdate(booking._id, 'absent')}
                                                                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${status === 'absent' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-400 hover:border-rose-500 hover:text-rose-500'}`}
                                                                    >
                                                                        A
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* History Popover */}
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="text-[10px] text-blue-500 hover:underline mt-1 flex items-center gap-1">
                                                                <History size={10} /> History
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-4 bg-white border border-slate-200 shadow-xl rounded-lg">
                                                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                                                <h4 className="text-sm font-bold flex items-center gap-2">
                                                                    <CalendarIcon size={14} /> Attendance History
                                                                </h4>
                                                            </div>
                                                            <Calendar
                                                                mode="single"
                                                                selected={new Date()}
                                                                className="rounded-md border shadow-sm mx-auto"
                                                                modifiers={{
                                                                    present: (date) => {
                                                                        const dStr = date.toLocaleDateString('en-CA');
                                                                        return booking.attendanceLogs?.some(l =>
                                                                            new Date(l.date).toISOString().split('T')[0] === dStr && l.status === 'present'
                                                                        );
                                                                    },
                                                                    absent: (date) => {
                                                                        const dStr = date.toLocaleDateString('en-CA');
                                                                        return booking.attendanceLogs?.some(l =>
                                                                            new Date(l.date).toISOString().split('T')[0] === dStr && l.status === 'absent'
                                                                        );
                                                                    }
                                                                }}
                                                                modifiersStyles={{
                                                                    present: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
                                                                    absent: { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }
                                                                }}
                                                            />
                                                            <div className="mt-4 flex gap-4 text-xs justify-center">
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-3 h-3 rounded-full bg-green-100 border border-green-600"></div>
                                                                    <span>Present</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-600"></div>
                                                                    <span>Absent</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 pt-2 border-t flex flex-col gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-[10px] text-red-600 border-red-100 hover:bg-red-50"
                                                                    onClick={() => handleDownloadAttendance(booking._id, 'pdf')}
                                                                >
                                                                    <FileText size={10} className="mr-1" /> PDF Report
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-[10px] text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                                                    onClick={() => handleDownloadAttendance(booking._id, 'csv')}
                                                                >
                                                                    <FileSpreadsheet size={10} className="mr-1" /> CSV Data
                                                                </Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            ) : (
                                                <div className="text-center text-xs text-slate-400">-</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end items-center">
                                                {/* Assignment UI */}
                                                {booking.status === 'pending' && (
                                                    <div className="flex items-center gap-2">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={`w-36 justify-between text-xs font-normal
                                                                            ${workersWithAvailability[booking._id]?.find(w => w._id === selectedWorker[booking._id])?.isAvailable === false ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200'}`}
                                                                    onMouseEnter={() => !workersWithAvailability[booking._id] && fetchAvailability(booking)}
                                                                >
                                                                    <div className="flex items-center truncate">
                                                                        {selectedWorker[booking._id] ?
                                                                            (workersWithAvailability[booking._id] || workers).find(w => w._id === selectedWorker[booking._id])?.name || "Select Professional"
                                                                            : "Select Prof"}
                                                                    </div>
                                                                    <Search className="ml-2 h-3 w-3 opacity-50 shrink-0" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-64 p-0 bg-white" align="end shadow-xl border-slate-200">
                                                                <div className="p-2 border-b">
                                                                    <div className="flex items-center px-2 py-1 bg-slate-50 rounded-md border">
                                                                        <Search size={14} className="text-slate-400 mr-2" />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search professional..."
                                                                            value={searchTerm}
                                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                                            className="bg-transparent border-none outline-none text-xs w-full"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-60 overflow-y-auto p-1">
                                                                    {(workersWithAvailability[booking._id] || workers)
                                                                        .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                                        .map((w) => (
                                                                            <button
                                                                                key={w._id}
                                                                                onClick={() => {
                                                                                    setSelectedWorker({ ...selectedWorker, [booking._id]: w._id });
                                                                                    setSearchTerm("");
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-slate-50 flex items-center justify-between
                                                                                        ${selectedWorker[booking._id] === w._id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'}
                                                                                        ${w.isAvailable === false ? 'opacity-60 bg-red-50/20' : ''}`}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <span className="truncate">{w.name}</span>
                                                                                    <span className="text-[10px] text-slate-500">{w.profession || 'Professional'}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    {w.isAvailable === false && (
                                                                                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 rounded" title={w.conflict ? `${w.conflict.serviceType} at ${w.conflict.time}` : 'Busy'}>BUSY</span>
                                                                                    )}
                                                                                    {selectedWorker[booking._id] === w._id && <Check size={12} className="text-blue-600" />}
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    {(workersWithAvailability[booking._id] || workers)
                                                                        .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                                                            <p className="p-4 text-center text-xs text-slate-500">No professionals found</p>
                                                                        )}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>

                                                        <button
                                                            onClick={() => handleAssignWorker(booking._id)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100"
                                                            title="Approve & Assign"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Reject Button */}
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'rejected', 'unpaid')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100"
                                                        title="Reject"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}

                                                {/* Mark Completed */}
                                                {booking.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'completed', booking.paymentStatus)}
                                                        className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs font-bold border border-green-100"
                                                    >
                                                        Mark Done
                                                    </button>
                                                )}

                                                {/* View Details Button */}
                                                <button
                                                    onClick={() => {
                                                        setViewingBooking(booking);
                                                        setIsDetailsDialogOpen(true);
                                                    }}
                                                    className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 border border-sky-100"
                                                    title="View Full Details"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Download Bill */}
                                                {booking.paymentStatus === 'paid' && (
                                                    <button
                                                        onClick={() => handleDownloadBill(booking._id)}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-100"
                                                        title="Download Bill"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                )}

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleOpenEdit(booking)}
                                                    className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-100"
                                                    title="Edit Details"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => {
                                                        setDeletingId(booking._id);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Booking Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Booking (Admin)</DialogTitle>
                        <DialogDescription>
                            Override booking details for #{editingBooking?._id?.slice(-6)}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 pt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="serviceType">Service Type</Label>
                            <Select
                                value={editFormData.serviceType}
                                onValueChange={(v) => setEditFormData({ ...editFormData, serviceType: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cleaning">Cleaning</SelectItem>
                                    <SelectItem value="cooking">Cooking</SelectItem>
                                    <SelectItem value="babysitting">Babysitting</SelectItem>
                                    <SelectItem value="elderly-care">Elderly Care</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                                value={editFormData.frequency}
                                onValueChange={(v) => setEditFormData({ ...editFormData, frequency: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one-time">One Time</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="alternate-days">Alternate Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date">Service Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={editFormData.date}
                                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={editFormData.address}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                            <Input
                                id="totalAmount"
                                type="number"
                                value={editFormData.totalAmount}
                                onChange={(e) => setEditFormData({ ...editFormData, totalAmount: Number(e.target.value) })}
                                placeholder="Enter total bill amount"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Internal)</Label>
                            <Textarea
                                id="notes"
                                value={editFormData.notes}
                                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                placeholder="Add notes for this booking"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Update Booking</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-sky-500" />
                            Booking #{viewingBooking?._id?.slice(-6)} Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete information for this booking request.
                        </DialogDescription>
                    </DialogHeader>

                    {viewingBooking && (
                        <div className="space-y-6 pt-4">
                            {/* Customer & Status */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Customer</h4>
                                    <p className="font-medium text-slate-900">{viewingBooking.user?.name || 'Guest'}</p>
                                    <p className="text-sm text-slate-500">{viewingBooking.user?.email}</p>
                                    <p className="text-sm text-slate-500">{viewingBooking.user?.phone}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Status</h4>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold capitalize
                                            ${viewingBooking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                viewingBooking.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                    viewingBooking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'}`}>
                                            {viewingBooking.status}
                                        </span>
                                        <span className={`text-xs font-medium ${viewingBooking.paymentStatus === 'paid' ? 'text-green-600' : 'text-slate-500'}`}>
                                            Payment: {viewingBooking.paymentStatus || 'unpaid'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule & Address */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <CalendarIcon size={14} className="text-sky-500" /> Schedule
                                    </h4>
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg text-sm">
                                        <div className="flex justify-between py-1 border-b border-slate-50">
                                            <span className="text-slate-500">Date:</span>
                                            <span className="font-medium">{formatDate(viewingBooking.date)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-50">
                                            <span className="text-slate-500">Time:</span>
                                            <span className="font-medium">{viewingBooking.time}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-slate-500">Frequency:</span>
                                            <span className="font-medium">{viewingBooking.frequency}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <MapPin size={14} className="text-red-500" /> Address
                                    </h4>
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg text-sm h-full">
                                        <p className="text-slate-600 leading-relaxed">{viewingBooking.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Items (The Core Detail) */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Check size={14} className="text-emerald-500" /> Selected Services
                                </h4>
                                <div className="space-y-3">
                                    {viewingBooking.items?.map((item, idx) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                                <span className="font-bold text-sm text-slate-800">{item.subCategory?.name || viewingBooking.serviceType}</span>
                                                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">Price: ₹{item.price}</span>
                                            </div>
                                            <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                {item.answers && Object.entries(item.answers).length > 0 ? (
                                                    Object.entries(item.answers).map(([key, value]) => (
                                                        <div key={key} className="flex flex-col border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                            <span className="text-slate-700 font-medium">{value}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-slate-400 italic text-xs">No specific details provided</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Fallback for legacy bookings without items */}
                                    {(!viewingBooking.items || viewingBooking.items.length === 0) && (
                                        <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-sm italic">
                                            Legacy booking format. No itemized details available.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {viewingBooking.notes && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-1">Customer Notes</h4>
                                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-sm text-amber-800">
                                        {viewingBooking.notes}
                                    </div>
                                </div>
                            )}

                            {/* Payment Proof */}
                            {viewingBooking.paymentProofUrl && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <FileText size={14} className="text-indigo-500" /> Payment Proof
                                    </h4>
                                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex justify-center">
                                        {viewingBooking.paymentProofUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                            <a href={viewingBooking.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={viewingBooking.paymentProofUrl}
                                                    alt="Payment Proof"
                                                    className="max-h-60 rounded border border-slate-200 object-contain hover:opacity-90 transition-opacity cursor-zoom-in"
                                                />
                                            </a>
                                        ) : viewingBooking.paymentProofUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                            <video
                                                controls
                                                className="max-h-60 w-full rounded border border-slate-200 bg-black"
                                                src={viewingBooking.paymentProofUrl}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <a
                                                href={viewingBooking.paymentProofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center justify-center p-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors rounded-lg w-full"
                                            >
                                                <FileText className="h-10 w-10 mb-2" />
                                                <span className="text-sm font-medium underline">View Uploaded Document</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Total Footer */}
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <span className="text-slate-500 font-medium">Total Amount</span>
                                <span className="text-2xl font-bold text-slate-900">₹{viewingBooking.totalAmount || 0}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Permanently Delete Booking?"
                description="This action cannot be undone. The booking will be removed from the system forever."
                confirmText="Delete Permanently"
                loading={isLoading}
            />
        </div>
    );
}
