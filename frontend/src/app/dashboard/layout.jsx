"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    CalendarDays,
    Settings,
    LogOut,
    User,
    Home,
    Menu,
    X,
    ClipboardCheck
} from "lucide-react";

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    if (!user) return null;

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Bookings", href: "/dashboard/bookings", icon: CalendarDays },
        { name: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

    if (user?.role === 'admin') {
        // Admin links are now handled in the dedicated Admin Layout
        // navItems.push(...); 
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <Link href="/dashboard" className="text-xl font-bold font-display">
                        <span className="text-primary-600">Safely Hands</span>
                    </Link>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-2 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                id={`nav-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary-50 text-primary-600"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-2">
                    <Link
                        href="/"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Home className="h-5 w-5" />
                        Back to Site
                    </Link>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden w-64 border-r bg-white md:block shrink-0">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/dashboard" className="text-2xl font-bold font-display text-slate-900">
                        <span className="text-primary-600">Safely Hands</span>
                    </Link>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                id={`desktop-nav-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary-50 text-primary-600"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
                <div className="mt-auto p-4 border-t space-y-2">
                    <Link
                        href="/"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Home className="h-4 w-4" />
                        Back to Site
                    </Link>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="h-14 bg-white border-b flex items-center justify-between px-4 md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-gray-800">Dashboard</span>
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

