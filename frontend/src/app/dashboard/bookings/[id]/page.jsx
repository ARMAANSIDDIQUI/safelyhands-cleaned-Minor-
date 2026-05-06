"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Loader2,
    MapPin,
    User,
    Star,
    CalendarCheck,
    Receipt,
    CheckCircle,
    XCircle,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

export default function BookingDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");



    // Review State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const fetchBooking = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Booking not found");
            const data = await res.json();
            setBooking(data);
        } catch (error) {
            toast.error("Failed to load booking details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && id) {
            fetchBooking();
        }
    }, [user, id, router]);





    const handleDownloadBill = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/download-bill`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to download bill");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Bill_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success("Bill downloaded!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download bill");
        }
    };

    const handleSubmitReview = async () => {
        if (!booking?.assignedWorker) return;
        setReviewSubmitting(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookingId: booking._id,
                    workerId: booking.assignedWorker?._id,
                    rating: reviewRating,
                    comment: reviewComment
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Review submitted successfully!");
            // Optionally refresh booking to show updated review status
        } catch (error) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    if (!booking) return <div>Booking not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Booking Details</h2>
                <div className="flex items-center gap-2">
                    {booking.paymentStatus === 'paid' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadBill}
                            className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                        >
                            <FileText className="mr-2 h-4 w-4" /> Download Bill
                        </Button>
                    )}
                    <Badge>{booking.status}</Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="capitalize">{booking.serviceType} Service</CardTitle>
                            <CardDescription>Order ID: {booking._id}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CalendarCheck className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="font-medium">Schedule</p>
                                    <p className="text-sm text-gray-500">{booking.frequency}</p>
                                    <p className="text-sm text-gray-500">
                                        Starts: {booking.date ? format(new Date(booking.date), "PPP") : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="font-medium">Location</p>
                                    <p className="text-sm text-gray-500">{booking.address}</p>
                                    <p className="text-sm text-gray-500 mt-1 font-mono">Phone: +91 {booking.phone || booking.user?.phone || 'N/A'}</p>
                                </div>
                            </div>
                            {booking.notes && (
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Notes</p>
                                        <p className="text-sm text-gray-500">{booking.notes}</p>
                                    </div>
                                </div>
                            )}
                            {booking.paymentProofUrl && (
                                <div className="flex items-start gap-3 pt-2">
                                    <Receipt className="w-5 h-5 text-gray-500 mt-0.5" />
                                    <div className="w-full">
                                        <p className="font-medium mb-2">Payment Proof</p>
                                        {booking.paymentProofUrl.match(/\.(mp4|webm|mov|ogg|m4v|avi)$/i) || booking.paymentProofUrl.includes('/video/upload/') ? (
                                            <video src={booking.paymentProofUrl} controls className="max-w-xs h-auto rounded-lg border border-gray-200" />
                                        ) : (
                                            <a href={booking.paymentProofUrl} target="_blank" rel="noreferrer">
                                                <img src={booking.paymentProofUrl} alt="Payment Proof" className="max-w-xs h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Worker Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Worker</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {booking.assignedWorker ? (
                                <div className="text-center space-y-4">
                                    <Avatar className="w-24 h-24 mx-auto">
                                        <AvatarImage src={booking.assignedWorker.imageUrl} />
                                        <AvatarFallback>{booking.assignedWorker.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg">{booking.assignedWorker?.name}</h3>
                                        <p className="text-sm text-gray-500">{booking.assignedWorker?.profession}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                                        <Star className="fill-current w-4 h-4" />
                                        <span className="font-medium text-black">{booking.assignedWorker?.rating}</span>
                                        <span className="text-gray-400 text-xs">({booking.assignedWorker?.numReviews || 0} reviews)</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 italic">
                                    Pending Assignment
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {booking.status === 'completed' && booking.assignedWorker && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Rate Service</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-8 h-8 cursor-pointer transition-colors ${star <= reviewRating ? "text-yellow-400 fill-current" : "text-gray-300"
                                                }`}
                                            onClick={() => setReviewRating(star)}
                                        />
                                    ))}
                                </div>
                                <Textarea
                                    placeholder="Share your experience..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                />
                                <Button
                                    className="w-full"
                                    onClick={handleSubmitReview}
                                    disabled={reviewSubmitting}
                                >
                                    {reviewSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Review
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
