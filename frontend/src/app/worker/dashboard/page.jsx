"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, MapPin, Calendar, User, Phone, History, Clock, Star, ExternalLink, ChevronRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function WorkerDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks');
    const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
    const [selectedBookingAttendance, setSelectedBookingAttendance] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bookingsRes, reviewsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/worker/tasks`, {
                        headers: { Authorization: `Bearer ${user?.token}` }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/worker/${user?._id}`)
                ]);

                if (bookingsRes.ok) {
                    const data = await bookingsRes.json();
                    setBookings(data);
                }

                if (reviewsRes.ok) {
                    const data = await reviewsRes.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) fetchData();
    }, [user]);

    const handleViewAttendance = async (booking) => {
        setSelectedBookingAttendance(booking);
        setIsAttendanceDialogOpen(true);
        setLoadingAttendance(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/booking/${booking._id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAttendanceHistory(data);
            } else {
                toast.error("Failed to fetch attendance history");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching attendance history");
        } finally {
            setLoadingAttendance(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Worker Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b">
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    My Tasks ({bookings.length})
                </button>

                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    Reviews ({reviews.length})
                </button>
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="space-y-6">
                    {bookings.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">No tasks assigned yet.</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {bookings.map((booking) => (
                                <Card key={booking._id} className="hover:shadow-lg transition-all border-slate-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="capitalize text-lg font-bold">{(booking.serviceType || 'Service').replace('-', ' ')}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(booking.date)}
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                {booking.time && (
                                                    <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                                                        <Clock size={10} /> {booking.time}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Customer Details */}
                                        <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                                            <div className="flex items-start gap-2">
                                                <User className="w-4 h-4 mt-0.5 text-slate-500" />
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                                                    <p className="text-sm font-medium text-slate-900">{booking.user?.name || 'Guest'}</p>
                                                </div>
                                            </div>
                                            {booking.user?.phone && (
                                                <div className="flex items-start gap-2">
                                                    <Phone className="w-4 h-4 mt-0.5 text-slate-500" />
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                                        <a href={`tel:${booking.user.phone}`} className="text-sm text-blue-600 font-medium hover:underline">
                                                            {booking.user.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-2 px-1">
                                            <MapPin className="w-4 h-4 mt-0.5 text-rose-500" />
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                                                <p className="text-sm text-slate-600 leading-tight">{booking.address}</p>
                                            </div>
                                        </div>

                                        {/* Service Details (Items) */}
                                        {booking.items && booking.items.length > 0 && (
                                            <div className="border-t border-slate-100 pt-3 space-y-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Service Details</p>
                                                {booking.items.map((item, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-100 rounded p-2 text-xs">
                                                        <div className="font-bold text-slate-700 mb-1">{item.subCategory?.name || 'Item'}</div>
                                                        {item.answers && Object.entries(item.answers).length > 0 && (
                                                            <div className="grid grid-cols-2 gap-1 text-[11px]">
                                                                {Object.entries(item.answers).map(([key, val]) => (
                                                                    <div key={key} className="text-slate-500">
                                                                        <span className="capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}:</span> {val}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                <span>{booking.frequency}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-[11px] gap-1.5 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                                onClick={() => handleViewAttendance(booking)}
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                Attendance History
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}



            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
                <div>
                    {reviews.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">No reviews yet.</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {reviews.map((review) => (
                                <Card key={review._id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{review.user?.name}</CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-bold">{review.rating}</span>
                                            </div>
                                        </div>
                                        <CardDescription>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* Attendance History Dialog */}
            <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-500" />
                            Attendance History
                        </DialogTitle>
                        <DialogDescription>
                            Service tracking for {selectedBookingAttendance?.serviceType?.replace('-', ' ')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {loadingAttendance ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-blue-500" />
                            </div>
                        ) : attendanceHistory.length === 0 ? (
                            <div className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No attendance records found for this service.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {attendanceHistory.map((record) => (
                                    <div key={record._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{formatDate(record.date)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{record.status}</p>
                                            </div>
                                        </div>
                                        {record.markedBy?.role === 'admin' && (
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">Admin Overlaid</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsAttendanceDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
