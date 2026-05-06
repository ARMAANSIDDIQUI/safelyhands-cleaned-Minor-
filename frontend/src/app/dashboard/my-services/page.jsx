"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star, MapPin, Calendar, User, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MyServicesPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/mybookings`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setBookings(data);
            } else if (data.bookings && Array.isArray(data.bookings)) {
                setBookings(data.bookings);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };



    const submitReview = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    bookingId: reviewModal._id,
                    workerId: reviewModal.assignedWorker?._id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            });

            if (res.ok) {
                toast.success('Review submitted successfully!');
                setReviewModal(null);
                setReviewForm({ rating: 5, comment: '' });
                fetchBookings();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">My Services</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No services booked yet. <a href="/services" className="text-blue-600 hover:underline">Browse services</a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <Card key={booking._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="capitalize text-xl">{booking.serviceType}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                                        <div>
                                            <p className="font-medium text-sm">Location</p>
                                            <p className="text-sm text-gray-600">{booking.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                                        <div>
                                            <p className="font-medium text-sm">Schedule</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(booking.date).toLocaleDateString()} • {booking.frequency}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {booking.assignedWorker && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{booking.assignedWorker.name}</p>
                                                    <p className="text-sm text-gray-600">{booking.assignedWorker.profession}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-medium">{booking.assignedWorker.rating || '4.8'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.status === 'approved' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setReviewModal(booking)}
                                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <MessageSquare size={18} />
                                                    Add Review
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Review {reviewModal?.assignedWorker?.name}</h3>
                        <form onSubmit={submitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= reviewForm.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Comment</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReviewModal(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
