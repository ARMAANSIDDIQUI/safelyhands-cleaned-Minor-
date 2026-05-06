"use client";

import React, { Suspense } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import ChatWidget from '@/components/sections/chat-widget';
import BookingWizard from '@/components/sections/booking-wizard';

function BookingSkeleton() {
    return (
        <div className="min-h-screen bg-transparent pt-[100px] pb-20">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="animate-pulse bg-white rounded-3xl h-[600px] shadow-sm border border-slate-100" />
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="pt-32 pb-20 bg-transparent min-h-screen">
                <div className="container mx-auto px-6">
                    <Suspense fallback={<BookingSkeleton />}>
                        <BookingWizard />
                    </Suspense>
                </div>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
