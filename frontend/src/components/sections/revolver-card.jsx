"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const gradientMap = [
    "from-blue-500/20",
    "from-sky-500/20",
    "from-cyan-500/20",
    "from-indigo-500/20"
];

export default function RevolverCard({ service, slot, index }) {
    if (!service) return null;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Breakpoint changed to 768px (md) to support tablets
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const variants = {
        enter: {
            x: isMobile ? 150 : 350,
            y: 0,
            z: -800,
            opacity: 0,
            scale: 0.4,
            rotateY: 0,
        },
        top: { // prev
            x: isMobile ? 100 : 300, // Reduced from 120 for mobile/tablet combo
            y: isMobile ? -120 : -220, // Reduced from -140
            z: -200,
            rotateX: 0,
            rotateY: 0,
            opacity: 0.85,
            scale: isMobile ? 0.6 : 0.7, // Slightly larger on mobile
            zIndex: 20
        },
        center: { // active
            x: isMobile ? -80 : -240, // Adjusted from -100
            y: 0,
            z: 150,
            rotateX: 0,
            rotateY: 0,
            opacity: 1,
            scale: isMobile ? 0.85 : 1, // Larger on mobile
            zIndex: 50
        },
        bottom: { // next
            x: isMobile ? 100 : 300, // Reduced from 120
            y: isMobile ? 120 : 220, // Reduced from 140
            z: -200,
            rotateX: 0,
            rotateY: 0,
            opacity: 0.85,
            scale: isMobile ? 0.6 : 0.7,
            zIndex: 20
        },
        exit: {
            x: isMobile ? 150 : 350,
            y: 0,
            z: -800,
            opacity: 0,
            scale: 0.4,
            rotateY: 0,
        }
    };

    const gradient = gradientMap[index % gradientMap.length];

    return (
        <Link href={`/services/${service.slug || service._id}`} className="absolute z-[inherit] transform-gpu">
            <motion.div
                variants={variants}
                initial="enter"
                animate={slot}
                exit="exit"
                whileHover={slot === 'center' ? {
                    scale: 1.05,
                    z: 200,
                    boxShadow: "0 0 80px 20px rgba(14, 165, 233, 0.3)",
                    transition: { duration: 0.3 }
                } : {}}
                transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 20,
                    mass: 1.2
                }}
                style={{ transformStyle: "preserve-3d" }}
                className={`
          relative w-[160px] h-[160px] md:w-[180px] md:h-[180px] lg:w-[240px] lg:h-[240px] xl:w-[280px] xl:h-[280px]
          rounded-full shadow-2xl border-4 border-white/40
          backdrop-blur-2xl
          flex items-center justify-center
          cursor-pointer overflow-hidden
          group
    `}
            >
                {/* Rotating Colorful Gradient Background - SHINY & COLORFUL */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} to-transparent opacity-50 z-0`}></div>

                {/* Conic Gradient for rotation */}
                <motion.div
                    className="absolute inset-[-50%] opacity-60 z-0"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0deg, #38bdf8 60deg, #818cf8 120deg, #c084fc 180deg, #f472b6 240deg, #38bdf8 360deg)",
                        filter: "blur(20px)"
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Shiny Ring Overlay */}
                {/* Shiny Ring Overlay - Removed */}

                {/* Service Image - Circular Magazine visual */}
                <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-white/30 z-10">
                    <Image
                        src={service.imageUrl || "https://placehold.co/600x600/e0f2fe/0ea5e9?text=Service"}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Dark Gradient Overlay for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                </div>

                {/* Floating Content Overlay */}
                <div className="absolute bottom-10 left-0 right-0 px-6 text-center transform translate-z-10 z-20">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-lg mb-1">
                        {service.title}
                    </h3>
                    <div className="h-1 w-12 bg-blue-400 mx-auto rounded-full shadow-lg"></div>
                </div>

                {/* Magazine Chamber Hole Effect */}
                <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none ring-1 ring-white/20 z-30"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_70%,rgba(0,0,0,0.1)_100%)] pointer-events-none z-30"></div>
            </motion.div>
        </Link>
    );
}
