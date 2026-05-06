"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to home after 3 seconds
        const timer = setTimeout(() => {
            router.push("/");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
                {/* 404 Animation */}
                <div className="mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 leading-none">
                        404
                    </h1>
                </div>

                {/* Message */}
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                    Oops! The page you're looking for doesn't exist. You'll be redirected to the home page in a few seconds.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                    >
                        <Home size={20} />
                        Go to Home
                        <ArrowRight size={20} />
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                    >
                        Go Back
                    </button>
                </div>

                {/* Auto-redirect indicator */}
                <p className="mt-8 text-sm text-slate-500">
                    Redirecting automatically in 3 seconds...
                </p>
            </div>
        </div>
    );
}
