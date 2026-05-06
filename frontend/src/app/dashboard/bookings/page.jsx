"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyBookings, selectAllBookings, selectBookingStatus } from "@/store/slices/bookingSlice";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Loader2, FileText, Pencil, Trash2, Calendar as CalendarIcon, Star, MessageSquare, Clock, MapPin, ArrowRight, User, CheckCircle2, RefreshCcw, Download, FileSpreadsheet, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";

import { getToken } from "@/lib/auth";
import { invalidateBookings } from "@/store/slices/bookingSlice";

import { Skeleton } from "@/components/ui/skeleton";

export default function MyBookingsPage() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const bookings = useAppSelector(selectAllBookings);
    const status = useAppSelector(selectBookingStatus);
    const loading = status === 'loading';

    // Filter State
    const [activeTab, setActiveTab] = useState('active'); // 'new', 'active', 'history'

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editFormData, setEditFormData] = useState({
        serviceType: "",
        frequency: "",
        weeklyDays: [],
        date: "",
        address: "",
        notes: ""
    });

    // Receipt Modal State
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState(null);

    // Attendance Modal State
    const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
    const [attendanceBooking, setAttendanceBooking] = useState(null);
    const [scheduledDates, setScheduledDates] = useState([]);

    // Review Modal State
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchMyBookings());
        }
    }, [status, dispatch]);

    const getDailyAttendanceStatus = (booking, date) => {
        if (!booking || !booking.attendanceLogs) return null;
        const log = booking.attendanceLogs.find(l =>
            new Date(l.date).toDateString() === date.toDateString()
        );
        return log?.status === 'present' ? 'present' : log?.status === 'absent' ? 'absent' : null;
    };

    // Initial fetch handled by Redux useEffect above
    useEffect(() => {
        const fetchDates = async () => {
            if (attendanceBooking && isAttendanceDialogOpen) {
                try {
                    const token = getToken();
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${attendanceBooking._id}/valid-dates`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setScheduledDates(data.validDates.map(d => new Date(d)));
                    } else {
                        const errorData = await res.json();
                        console.error("Failed to fetch valid dates:", errorData.message);
                        toast.error(errorData.message || "Failed to fetch valid dates");
                    }
                } catch (error) {
                    console.error("Failed to fetch valid dates", error);
                    toast.error("Error fetching valid dates");
                }
            }
        };
        fetchDates();
    }, [attendanceBooking, isAttendanceDialogOpen]);


    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Booking cancelled successfully");
                dispatch(invalidateBookings()); // Force refresh
                dispatch(fetchMyBookings());
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to cancel");
            }
        } catch (error) {
            toast.error("Error cancelling booking");
        }
    };

    const handleOpenEdit = (booking) => {
        setEditingBooking(booking);
        setEditFormData({
            serviceType: booking.serviceType,
            frequency: booking.frequency,
            weeklyDays: booking.weeklyDays || [],
            date: booking.date ? new Date(booking.date).toISOString().split('T')[0] : "",
            address: booking.address,
            notes: booking.notes || ""
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${editingBooking._id}/edit`, {
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
                dispatch(invalidateBookings()); // Force refresh
                dispatch(fetchMyBookings());
            } else {
                toast.error("Update failed");
            }
        } catch (error) {
            toast.error("Failed to update booking");
        }
    };

    const handleOpenReview = (booking) => {
        setReviewBooking(booking);
        setReviewForm({ rating: 5, comment: "" });
        setIsReviewDialogOpen(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            setIsSubmittingReview(true);
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId: reviewBooking._id,
                    workerId: reviewBooking.assignedWorker?._id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Review submitted successfully!");
                setIsReviewDialogOpen(false);
                // We don't need to refresh bookings here since review state isn't shown yet
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (error) {
            toast.error("Error submitting review");
        } finally {
            setIsSubmittingReview(false);
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

    // Filter Logic
    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'new') return booking.status === 'pending';
        if (activeTab === 'active') return booking.status === 'approved' || booking.status === 'in_progress';
        if (activeTab === 'history') return ['completed', 'cancelled', 'rejected'].includes(booking.status);
        return true;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-9 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                </div>

                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-xl p-6 bg-card text-card-foreground shadow-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-2 w-full">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-3 w-64 mt-1" />
                                </div>
                                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-9 w-28" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
                    <p className="text-muted-foreground">Manage your service history and status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            toast.info("Refreshing bookings...");
                            dispatch(invalidateBookings());
                            dispatch(fetchMyBookings());
                        }}
                        className="gap-2"
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                    <Button asChild>
                        <Link href="/booking">Book New</Link>
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'new'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    New Requests
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'active'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    History
                </button>
            </div>

            <div className="grid gap-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} bookings</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {activeTab === 'new' && "You don't have any pending requests."}
                            {activeTab === 'active' && "You don't have any active services."}
                            {activeTab === 'history' && "No past booking history found."}
                        </p>
                        {activeTab !== 'history' && (
                            <Link href="/booking" className="text-primary-600 font-medium hover:underline">
                                Book Now
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <Card key={booking._id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                                <div className="space-y-1">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-semibold text-lg capitalize">{(booking.serviceType || booking.items?.[0]?.subCategory?.service?.title || 'Service').replace('-', ' ')}</h3>
                                        <div className="flex flex-col gap-1 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            {booking.items && booking.items.length > 0 ? (
                                                booking.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                                                        <span>{item.subCategory?.name || 'Service'} (x{item.quantity})</span>
                                                        <span className="font-medium text-slate-800">₹{item.price}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="italic text-slate-400">Standard Service</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                                            {booking.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{format(new Date(booking.date), "PPP")} at {booking.time}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 text-right">
                                    <div className="text-sm font-medium">
                                        Total: <span className="font-bold text-lg">₹{booking.totalAmount || booking.items?.reduce((sum, i) => sum + i.price, 0) || 0}</span>
                                    </div>
                                    <div className="text-sm font-medium">
                                        Payment: <span className={
                                            booking.paymentStatus === 'paid' ? 'text-green-600' :
                                                booking.paymentStatus === 'pending_approval' ? 'text-yellow-600' : 'text-red-600'
                                        }>
                                            {booking.paymentStatus.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2 mt-2 md:mt-0">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/dashboard/bookings/${booking._id}`}>
                                                <Eye className="mr-2 h-3 w-3" /> Details
                                            </Link>
                                        </Button>

                                        {booking.paymentStatus === 'paid' && (
                                            <Button size="sm" variant="outline" onClick={() => handleDownloadBill(booking._id)} className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                                                <Download className="mr-2 h-3 w-3" /> Bill
                                            </Button>
                                        )}

                                        {booking.paymentProofUrl && (
                                            <Button size="sm" variant="outline" onClick={() => {
                                                setReceiptUrl(booking.paymentProofUrl);
                                                setIsReceiptDialogOpen(true);
                                            }}>
                                                <Receipt className="mr-2 h-3 w-3" /> Receipt
                                            </Button>
                                        )}

                                        {booking.status === 'pending' && (
                                            <>
                                                <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(booking)}>
                                                    <Pencil className="mr-2 h-3 w-3" /> Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(booking._id)}>
                                                    <Trash2 className="mr-2 h-3 w-3" /> Cancel
                                                </Button>
                                            </>
                                        )}

                                        {/* Attendance Button */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setAttendanceBooking(booking);
                                                setIsAttendanceDialogOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <CalendarIcon className="mr-2 h-3 w-3" /> Attendance
                                        </Button>

                                        {/* Review Button - Only if worker assigned */}
                                        {booking.assignedWorker && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleOpenReview(booking)}
                                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                            >
                                                <Star className="mr-2 h-3 w-3" /> Review
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Booking</DialogTitle>
                            <DialogDescription>
                                Make changes to your booking here. Click save when you're done.
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
                                    onValueChange={(v) => {
                                        setEditFormData({ ...editFormData, frequency: v });
                                        if (v !== 'Weekly') {
                                            setEditFormData(prev => ({ ...prev, weeklyDays: [] }));
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="One-time">One Time</SelectItem>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Live-in">Live-in</SelectItem>
                                    </SelectContent>
                                </Select>

                                {editFormData.frequency === 'Weekly' && (
                                    <div className="mt-2 text-sm">
                                        <Label className="mb-2 block">Select Days</Label>
                                        <div className="flex gap-1 flex-wrap">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentDays = editFormData.weeklyDays || [];
                                                        const newDays = currentDays.includes(index)
                                                            ? currentDays.filter(d => d !== index)
                                                            : [...currentDays, index];
                                                        setEditFormData({ ...editFormData, weeklyDays: newDays });
                                                    }}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${(editFormData.weeklyDays || []).includes(index)
                                                        ? 'bg-primary-600 text-white border-primary-600'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={editFormData.notes}
                                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    placeholder="Any special instructions?"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Attendance Dialog */}
                <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5" />
                                Attendance History
                            </DialogTitle>
                            <DialogDescription>
                                View attendance record for {attendanceBooking?.serviceType}
                            </DialogDescription>
                        </DialogHeader>

                        {attendanceBooking && (
                            <div className="flex flex-col items-center py-2">
                                <Calendar
                                    mode="single"
                                    selected={new Date()}
                                    className="rounded-md border shadow-sm mx-auto"
                                    modifiers={{
                                        present: (date) => getDailyAttendanceStatus(attendanceBooking, date) === 'present',
                                        absent: (date) => getDailyAttendanceStatus(attendanceBooking, date) === 'absent',
                                        scheduled: (date) => scheduledDates.some(d => d.toDateString() === date.toDateString()) && !getDailyAttendanceStatus(attendanceBooking, date)
                                    }}
                                    modifiersStyles={{
                                        present: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
                                        absent: { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' },
                                        scheduled: { backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 'bold', border: '1px solid #bfdbfe' }
                                    }}
                                />
                                <div className="mt-4 flex gap-4 text-xs font-medium flex-wrap justify-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-100 border border-green-600"></div>
                                        <span>Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-100 border border-red-600"></div>
                                        <span>Absent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-400"></div>
                                        <span>Scheduled</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t w-full flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownloadAttendance(attendanceBooking._id, 'pdf')}
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <FileText className="mr-2 h-4 w-4" /> Download Attendance (PDF)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownloadAttendance(attendanceBooking._id, 'csv')}
                                        className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Attendance (CSV)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Review Dialog */}
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                Rate Service
                            </DialogTitle>
                            <DialogDescription>
                                How was your experience with {reviewBooking?.assignedWorker?.name}?
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitReview} className="space-y-4 pt-4">
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">Your Feedback</Label>
                                <Textarea
                                    id="comment"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="Share your experience..."
                                    required
                                    rows={4}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmittingReview}>
                                    {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Submit Review
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Receipt Dialog */}
                <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-indigo-500" />
                                Payment Receipt
                            </DialogTitle>
                            <DialogDescription>
                                Verified payment proof for this booking.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center p-4 bg-slate-50 border border-slate-100 rounded-lg mt-2">
                            {receiptUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video
                                    controls
                                    className="max-h-[60vh] w-full rounded border border-slate-200 bg-black"
                                    src={receiptUrl}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : receiptUrl?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={receiptUrl}
                                        alt="Payment Receipt"
                                        className="max-h-[60vh] object-contain rounded border border-slate-200 cursor-zoom-in"
                                    />
                                </a>
                            ) : (
                                <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center py-10 px-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors rounded-lg w-full"
                                >
                                    <FileText className="h-12 w-12 mb-3" />
                                    <span className="font-medium underline">View External Document</span>
                                </a>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
