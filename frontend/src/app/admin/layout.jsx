"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, CalendarCheck, Briefcase, Settings, LogOut, MessageSquareQuote, Home, ShieldCheck, Wrench, Menu, X, MessageSquare, MapPin, Layers, ImageIcon } from "lucide-react";

export default function AdminLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (user.role !== 'admin') {
                router.push("/dashboard");
            }
        }
    }, [user, loading, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    if (loading || !user || user.role !== 'admin') return null;

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Overview" },
        { href: "/admin/bookings", icon: CalendarCheck, label: "Bookings" },
        { href: "/admin/attendance", icon: CalendarCheck, label: "Attendance Reports" },
        { href: "/admin/services", icon: Briefcase, label: "Services" },
        { href: "/admin/subcategories", icon: Briefcase, label: "Subcategories" },
        { href: "/admin/cities", icon: MapPin, label: "Cities" },
        { href: "/admin/workers", icon: Users, label: "Workers" },
        { href: "/admin/users", icon: Users, label: "Users" },
        { href: "/admin/team", icon: ShieldCheck, label: "Team Management" },
        { href: "/admin/testimonials", icon: MessageSquareQuote, label: "Testimonials" },
        { href: "/admin/credibility", icon: Layers, label: "Credibility Badges" },
        { href: "/admin/reviews", icon: MessageSquare, label: "Review Moderation" },

        { href: "/admin/carousel", icon: LayoutDashboard, label: "Carousel" },
        { href: "/admin/inquiries", icon: Briefcase, label: "Inquiries" },
        { href: "/admin/media", icon: ImageIcon, label: "Media Library" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
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
                    <Link href="/admin" className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                        Safely Hands <span className="text-blue-500">Admin</span>
                    </Link>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <Link
                        href="/"
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors mb-2"
                    >
                        <Home size={20} />
                        <span className="font-medium">Back to Site</span>
                    </Link>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:block shrink-0 h-screen sticky top-0 overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/admin" className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                        Safely Hands <span className="text-blue-500">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <Link
                        href="/"
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors mb-2"
                    >
                        <Home size={20} />
                        <span className="font-medium">Back to Site</span>
                    </Link>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-800">Admin Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-sm font-medium text-slate-600 hidden sm:block">{user?.name}</span>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

