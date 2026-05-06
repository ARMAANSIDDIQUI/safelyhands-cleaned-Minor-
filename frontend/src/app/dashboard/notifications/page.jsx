"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Bell, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) fetchNotifications();
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Bell /> Notifications
            </h1>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">No notifications</div>
                ) : (
                    notifications.map((n) => (
                        <Card key={n._id} className={`${n.isRead ? 'bg-white' : 'bg-blue-50'} transition-colors`}>
                            <CardContent className="p-4 flex gap-4">
                                <div className={`w-2 min-w-[8px] rounded-full ${n.isRead ? 'bg-gray-200' : 'bg-blue-500'}`} />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{n.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                        {n.link && (
                                            <Link href={n.link} className="text-blue-600 hover:underline">
                                                View Details
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {!n.isRead && (
                                    <Button variant="ghost" size="icon" onClick={() => markAsRead(n._id)} title="Mark as read">
                                        <CheckCheck className="w-4 h-4" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
