"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import Link from "next/link";
import {
    Calendar,
    CreditCard,
    Clock,
    Home,
    ArrowRight,
    Plus,
    MessageSquare,
    LayoutDashboard,
    Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Redux
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyBookings, selectAllBookings, selectBookingStatus } from "@/store/slices/bookingSlice";

export default function DashboardPage() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const bookings = useAppSelector(selectAllBookings);
    const status = useAppSelector(selectBookingStatus);
    const loading = status === 'loading';

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchMyBookings());
        }
    }, [status, dispatch]);

    // Calculate Stats
    const activeBookings = bookings.filter(b => ['approved', 'in_progress'].includes(b.status)).length;
    const pendingActions = bookings.filter(b => b.status === 'pending').length;
    // Mock calculation for total spent based on completed bookings
    const totalSpent = bookings
        .filter(b => b.status === 'completed')
        .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const recentBookings = bookings.slice(0, 3); // Top 3 most recent

    if (loading && bookings.length === 0) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border-2 border-white/20">
                                <span className="text-lg font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        Welcome back, {user?.name?.split(' ')[0]} <Sparkles className="h-6 w-6 text-yellow-300" />
                    </h2>
                    <p className="text-blue-100 max-w-xl">
                        Manage your home services, track bookings, and connect with your professionals all in one place.
                    </p>
                </div>

                <div className="flex gap-3 relative z-10">
                    <Button variant="secondary" className="shadow-md" asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" /> Back to Site
                        </Link>
                    </Button>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3" id="dashboard-stats">
                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Active Services</CardTitle>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{activeBookings}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ongoing subscriptions</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Est. Total Spent</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">₹{totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Actions</CardTitle>
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{pendingActions}</div>
                        <p className="text-xs text-muted-foreground mt-1">Approvals required</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                {/* Recent Activity / Bookings */}
                <Card className="col-span-4 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest booking updates.</CardDescription>
                        </div>
                        <Button id="dashboard-bookings-link" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                            <Link href="/dashboard/bookings">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                        <LayoutDashboard className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-900 font-medium">No activity yet</p>
                                    <p className="text-sm text-slate-500 max-w-xs mt-1">
                                        Book your first service to see updates here.
                                    </p>
                                </div>
                            ) : (
                                recentBookings.map(booking => booking && (
                                    <div key={booking._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                                ${booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-blue-100 text-blue-600'}`}>
                                                {booking.serviceType ? booking.serviceType[0].toUpperCase() : 'S'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 capitalize">
                                                    {booking.serviceType || 'Service'}
                                                    <span className="text-slate-400 font-normal text-xs ml-2">#{booking._id.slice(-4)}</span>
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {booking.date ? new Date(booking.date).toLocaleDateString() : 'Date TBD'} • {booking.frequency}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'}`}>
                                            {booking.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3 border-none shadow-md bg-slate-900 text-white overflow-hidden relative">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                        <CardDescription className="text-slate-400">Manage your account efficiently</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <Button
                            className="w-full justify-start h-auto p-0 bg-blue-600 hover:bg-blue-500 border-none shadow-lg group transition-all transform hover:translate-x-1 overflow-hidden"
                            asChild
                        >
                            <Link href="/booking" className="flex items-center w-full py-4 px-4 sm:px-6">
                                <div className="p-2 bg-blue-500 rounded-lg mr-3 sm:mr-4 group-hover:bg-blue-400 transition-colors shrink-0">
                                    <Plus className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-bold truncate">Book New Service</div>
                                    <div className="text-xs text-blue-200 mt-0.5 truncate">Schedule a professional now</div>
                                </div>
                            </Link>
                        </Button>

                        <Button
                            className="w-full justify-start h-auto p-0 bg-slate-800 hover:bg-slate-700 border-none shadow-sm group transition-all transform hover:translate-x-1 overflow-hidden"
                            asChild
                        >
                            <Link href="/contact" className="flex items-center w-full py-4 px-4 sm:px-6">
                                <div className="p-2 bg-slate-700 rounded-lg mr-3 sm:mr-4 group-hover:bg-slate-600 transition-colors shrink-0">
                                    <MessageSquare className="h-5 w-5 text-slate-300" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-bold text-slate-200 truncate">Contact Support</div>
                                    <div className="text-xs text-slate-400 mt-0.5 truncate">Get help with your bookings</div>
                                </div>
                            </Link>
                        </Button>

                        <Button
                            className="w-full justify-start h-auto p-0 bg-emerald-700 hover:bg-emerald-600 border-none shadow-sm group transition-all transform hover:translate-x-1 overflow-hidden"
                            asChild
                        >
                            <Link href="/payment" className="flex items-center w-full py-4 px-4 sm:px-6">
                                <div className="p-2 bg-emerald-600 rounded-lg mr-3 sm:mr-4 group-hover:bg-emerald-500 transition-colors shrink-0">
                                    <CreditCard className="h-5 w-5 text-emerald-100" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-bold text-emerald-50 truncate">Make a Payment</div>
                                    <div className="text-xs text-emerald-200 mt-0.5 truncate">View QR code and bank details</div>
                                </div>
                            </Link>
                        </Button>
                    </CardContent>

                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full -mr-10 -mt-20 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-[200px] w-full rounded-3xl" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[300px] rounded-xl" />
                <Skeleton className="col-span-3 h-[300px] rounded-xl" />
            </div>
        </div>
    );
}