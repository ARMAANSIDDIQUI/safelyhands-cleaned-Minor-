"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RevolverCard from "./revolver-card";

export default function HeroRevolver() {
    const [services, setServices] = useState([]);
    const [active, setActive] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Breakpoint changed to 768px (md) to support tablets
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter active services
                    const activeServices = Array.isArray(data) ? data.filter(s => s.isActive !== false) : [];
                    setServices(activeServices);
                }
            } catch (err) {
                console.error("Failed to fetch services for hero revolver", err);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        if (services.length < 2 || isPaused) return;

        const interval = setInterval(() => {
            setActive(i => (i - 1 + services.length) % services.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [services, isPaused]);

    if (services.length === 0) return (
        <div className="h-[400px] md:h-[500px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    const total = services.length;

    // Logic to handle small service sets for infinite effect
    const getPrev = () => (active - 1 + total) % total;
    const getNext = () => (active + 1) % total;

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] w-full flex items-center justify-center overflow-visible perspective-[1200px] md:perspective-[2500px]"
        >

            {/* TAGLINE - Narrowed to 3 lines and shifted right to eliminate overlap */}
            <motion.div
                initial={{ opacity: 0, x: isMobile ? 60 : 80, scale: isMobile ? 0.7 : 0.8 }}
                animate={{ opacity: 1, x: isMobile ? 60 : 80, scale: isMobile ? 0.7 : 1 }}
                whileInView={{ x: isMobile ? 60 : 100 }}
                className="absolute top-1/2 -translate-y-1/2 z-[100] pointer-events-none left-[5%] md:left-auto"
            >
                <div className="max-w-[140px] md:max-w-[220px] lg:max-w-[320px] text-center">
                    <span className="text-blue-900/80 font-black text-[10px] md:text-sm lg:text-xl xl:text-2xl tracking-[0.1em] md:tracking-[0.15em] uppercase block drop-shadow-sm leading-tight">
                        Har zaroorat <br />
                        ke liye ek <br />
                        bharosemand haath
                    </span>
                    <div className="h-0.5 w-6 md:w-8 lg:w-12 bg-blue-400 mx-auto mt-2 rounded-full opacity-50"></div>
                </div>
            </motion.div>

            <AnimatePresence mode="popLayout">
                {/* Symmetrical Magazine Cards: S2 (top), S1 (center), S3 (bottom) */}
                {[
                    { id: services[getPrev()]._id, service: services[getPrev()], slot: 'top', index: getPrev() },
                    { id: services[active]._id, service: services[active], slot: 'center', index: active },
                    { id: services[getNext()]._id, service: services[getNext()], slot: 'bottom', index: getNext() }
                ].map((item) => (
                    <RevolverCard
                        key={item.id}
                        service={item.service}
                        slot={item.slot}
                        index={item.index}
                    />
                ))}
            </AnimatePresence>

        </div>
    );
}
