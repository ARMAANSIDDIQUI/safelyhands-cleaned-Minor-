"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, MessageSquare, CheckCircle, XCircle, User, Briefcase, Calendar, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { format } from "date-fns";

export default function AdminReviews() {
    const { user, loading: authLoading } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ id: null, status: null });
    const [filter, setFilter] = useState("all"); // all, pending, approved, declined

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/admin`, {
                headers: { "Authorization": `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
                applyFilter(data, filter);
            }
        } catch (err) {
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (data, currentFilter) => {
        if (currentFilter === "all") {
            setFilteredReviews(data);
        } else if (currentFilter === "approved") {
            setFilteredReviews(data.filter(r => r.isApproved === true));
        } else if (currentFilter === "declined") {
            setFilteredReviews(data.filter(r => r.isApproved === false));
        } else if (currentFilter === "pending") {
            setFilteredReviews(data.filter(r => r.isApproved === undefined || r.isApproved === null));
        }
    };

    useEffect(() => {
        if (!authLoading && user?.token) {
            fetchReviews();
        }
    }, [user, authLoading]);

    useEffect(() => {
        applyFilter(reviews, filter);
    }, [filter, reviews]);

    const handleApprovalToggle = async (id, status) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${id}/approval`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({ isApproved: status })
            });

            if (res.ok) {
                toast.success(status ? "Review approved" : "Review declined");
                fetchReviews();
            } else {
                toast.error("Failed to update review status");
            }
        } catch (err) {
            toast.error("Error updating review");
        } finally {
            setActionLoading(false);
            setIsConfirmOpen(false);
        }
    };

    const openConfirm = (id, status) => {
        setConfirmAction({ id, status });
        setIsConfirmOpen(true);
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Review Moderation</h1>
                    <p className="text-slate-500">Approve or decline customer reviews before they go public.</p>
                </div>

                {/* Filters */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {["all", "pending", "approved", "declined"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <MessageSquare className="h-16 w-16 mb-4 opacity-10" />
                    <h3 className="text-xl font-semibold text-slate-900 capitalize">No {filter !== 'all' ? filter : ''} Reviews</h3>
                    <p className="max-w-xs mx-auto">There are no reviews matching the current filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredReviews.map((review) => (
                        <Card key={review._id} className="overflow-hidden border-slate-200 hover:border-blue-200 transition-colors shadow-sm">
                            <CardHeader className="pb-3 bg-slate-50/50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {review.user?.profilePicture ? (
                                                <img src={review.user.profilePicture} alt={review.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                review.user?.name?.charAt(0).toUpperCase() || "U"
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-slate-800">{review.user?.name || "Unknown User"}</CardTitle>
                                            <CardDescription className="text-[10px] flex items-center gap-1 font-medium">
                                                <User size={10} /> {review.user?.email || "No email"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`capitalize px-2 py-0.5 text-[10px] font-bold ${review.isApproved === true ? "bg-green-100 text-green-700" :
                                            review.isApproved === false ? "bg-red-100 text-red-700" :
                                                "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {review.isApproved === true ? "Approved" : review.isApproved === false ? "Declined" : "Pending"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="py-5 space-y-4">
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Briefcase size={12} className="text-blue-500" />
                                        <span className="font-bold text-slate-700">{review.worker?.name || "Deleted Worker"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-medium">
                                        <Calendar size={12} />
                                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}
                                        />
                                    ))}
                                    <span className="ml-2 font-black text-slate-900 text-sm">{review.rating}.0</span>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-700 text-sm leading-relaxed relative font-medium">
                                    <MessageSquare className="absolute -top-2 -left-2 text-slate-200" size={18} />
                                    "{review.comment}"
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3 border-t bg-white pt-4">
                                {review.isApproved === true ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold rounded-lg"
                                        onClick={() => openConfirm(review._id, false)}
                                        disabled={actionLoading}
                                    >
                                        <XCircle className="mr-2 h-3.5 w-3.5" /> Decline
                                    </Button>
                                ) : review.isApproved === false ? (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-green-100"
                                        onClick={() => openConfirm(review._id, true)}
                                        disabled={actionLoading}
                                    >
                                        <CheckCircle className="mr-2 h-3.5 w-3.5" /> Approve
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg"
                                            onClick={() => openConfirm(review._id, false)}
                                            disabled={actionLoading}
                                        >
                                            <XCircle className="mr-2 h-3.5 w-3.5" /> Decline
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-green-100"
                                            onClick={() => openConfirm(review._id, true)}
                                            disabled={actionLoading}
                                        >
                                            <CheckCircle className="mr-2 h-3.5 w-3.5" /> Approve
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={() => handleApprovalToggle(confirmAction.id, confirmAction.status)}
                title={confirmAction.status ? "Approve Review?" : "Decline Review?"}
                description={confirmAction.status
                    ? "This review will become public and influence the worker's average rating."
                    : "This review will be hidden from the public site."}
                confirmText={confirmAction.status ? "Approve" : "Decline"}
                loading={actionLoading}
            />
        </div>
    );
}
