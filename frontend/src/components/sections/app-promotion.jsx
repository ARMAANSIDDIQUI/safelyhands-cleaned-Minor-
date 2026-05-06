"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { toast } from "sonner";

const AppPromotion = () => {
    const [deferredPrompt, setDeferredPrompt] = React.useState(null);
    const [isInstalled, setIsInstalled] = React.useState(false);

    React.useEffect(() => {
        // Check if already installed/standalone
        const checkStandalone = () => {
            if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
                setIsInstalled(true);
            }
        };

        checkStandalone();

        const handleBeforeInstallPrompt = (e) => {
            setDeferredPrompt(e);
            console.log("PWA: beforeinstallprompt fired");
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            toast.info("To install: Click the 'Install' icon in your browser's address bar or 'Add to Home Screen' in settings.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // If already in PWA (standalone mode), don't show the promotion
    if (isInstalled) return null;

    return (
        <section className="bg-primary pt-24 pb-0 overflow-hidden relative">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                    {/* Content */}
                    <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-24">
                        <h2 className="text-4xl md:text-6xl font-bold font-display text-white mb-6 leading-tight">
                            Manage your home <br /> from your phone.
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto md:mx-0">
                            Install the Safely Hands app for a seamless experience. Track attendance, manage payments, and book pros effortlessly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button
                                onClick={handleInstallClick}
                                className="transform hover:-translate-y-1 transition-transform duration-300 group"
                            >
                                <div className="px-8 h-[54px] bg-white text-primary rounded-xl flex items-center justify-center border border-white/20 shadow-lg group-hover:shadow-sky-400/20">
                                    <div className="font-bold text-lg flex items-center gap-2">
                                        <Download size={20} className="text-blue-600 animate-bounce" />
                                        {deferredPrompt ? "Install App" : "How to Install"}
                                    </div>
                                </div>
                            </button>

                            {!deferredPrompt && (
                                <div className="text-white/60 text-sm max-w-[200px] text-left hidden sm:block leading-tight">
                                    Use Chrome or Edge to enable easy installation
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Phone Mockup */}
                    <div className="lg:w-1/2 flex justify-center lg:justify-end relative">
                        <div className="relative w-[300px] md:w-[350px] aspect-[9/19] bg-black rounded-[50px] border-[8px] border-slate-900 shadow-2xl z-20 overflow-hidden transform lg:translate-y-20">
                            {/* Screen Content Mockup - Iframe */}
                            <div className="bg-white w-full h-full relative overflow-hidden">
                                <iframe
                                    src="https://safelyhands.com"
                                    className="w-full h-full border-0 pointer-events-none"
                                    title="App Preview"
                                    scrolling="no"
                                    tabIndex="-1"
                                />
                                {/* Overlay to ensure no interaction */}
                                <div className="absolute inset-0 z-10"></div>
                            </div>
                        </div>
                        {/* Decorative Element Behind Phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-white opacity-10 rounded-full blur-[60px] animate-pulse"></div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AppPromotion;
