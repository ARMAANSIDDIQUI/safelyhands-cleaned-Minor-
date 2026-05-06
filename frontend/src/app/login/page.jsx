"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm from "@/components/sections/login-form";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";
import { toast } from "sonner";
import { saveSession } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Google authentication failed. Please try again.');
            return;
        }

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                // Save session using centralized utility
                saveSession(user, token);

                toast.success(`Welcome, ${user.name}!`);

                // Redirect based on role - use window.location for full page reload
                // This ensures AuthContext properly loads the user state
                setTimeout(() => {
                    if (user.role === 'worker') {
                        window.location.href = '/worker/dashboard';
                    } else if (user.role === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/dashboard';
                    }
                }, 300);
            } catch (err) {
                console.error('Error parsing OAuth data:', err);
                toast.error('Authentication error. Please try logging in again.');
            }
        }
    }, [searchParams, router]);

    // Auto-redirect if already logged in
    // Auto-redirect if already logged in
    useEffect(() => {
        const token = searchParams.get('token');
        // Only redirect if not currently processing a login (no token in URL)
        if (!loading && user && !token) {
            toast.info("You are already logged in");
            if (user.role === 'worker') {
                router.replace('/worker/dashboard'); // Use replace to prevent back navigation
            } else if (user.role === 'admin') {
                router.replace('/admin');
            } else {
                router.replace('/dashboard');
            }
        }
    }, [user, loading, router, searchParams]);

    return (
        <div className="pt-[100px] pb-12 relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />

            <LoginForm />
        </div>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen">
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
                <LoginContent />
            </Suspense>
            <Footer />
            <ChatWidget />
        </main>
    );
}
