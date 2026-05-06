"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function CredibilityLogos() {
    const [logos, setLogos] = useState({ registered: [], backed: [] });

    useEffect(() => {
        const fetchLogos = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credibility`);
                if (res.ok) {
                    const data = await res.json();
                    setLogos(data);
                }
            } catch (error) {
                console.error("Failed to fetch logos", error);
            }
        };
        fetchLogos();
    }, []);

    if (logos.registered.length === 0 && logos.backed.length === 0) return null;

    return (
        <section className="py-16 bg-transparent">
            <div className="container mx-auto px-4 text-center space-y-16">
                {/* Registered With */}
                {logos.registered.length > 0 && (
                    <div className="space-y-8">
                        <h3 className="text-xl font-semibold text-slate-900">Registered With</h3>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                            {logos.registered.map((logo) => (
                                <div key={logo._id} className="relative w-24 h-24 md:w-32 md:h-24 hover:scale-105 transition-all duration-300">
                                    <Image
                                        src={logo.imageUrl}
                                        alt={logo.name}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 96px, 128px"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Backed By */}
                {logos.backed.length > 0 && (
                    <div className="space-y-8">
                        <h3 className="text-xl font-semibold text-slate-900 text-center">Backed By</h3>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                            {logos.backed.map((logo) => (
                                <div key={logo._id} className="relative w-28 h-12 md:w-40 md:h-16 hover:scale-105 transition-all duration-300">
                                    <Image
                                        src={logo.imageUrl}
                                        alt={logo.name}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 112px, 160px"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
