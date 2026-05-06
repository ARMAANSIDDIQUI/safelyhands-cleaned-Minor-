"use client";

import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function SitemapPage() {
    const sections = [
        {
            title: "Main Pages",
            links: [
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Contact Us", path: "/contact" },
                { name: "All Services", path: "/services" },
                { name: "Careers", path: "/careers" }
            ]
        },
        {
            title: "Our Services",
            links: [
                { name: "Domestic Help", path: "/services/domestic-help" },
                { name: "Cook", path: "/services/cook" },
                { name: "Babysitter", path: "/services/babysitter" },
                { name: "Elderly Care", path: "/services/elderly-care" },
                { name: "All-Rounder", path: "/services/all-rounder" },
                { name: "24-Hr Help", path: "/services/24-hour-live-in" }
            ]
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Refund Policy", path: "/refund-policy" },
                { name: "Disclaimer", path: "/disclaimer" }
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="pt-[120px] pb-20 container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-12">Sitemap</h1>

                <div className="grid md:grid-cols-3 gap-12">
                    {sections.map((section, i) => (
                        <div key={i}>
                            <h2 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-200">{section.title}</h2>
                            <ul className="space-y-4">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link href={link.path} className="text-slate-600 hover:text-blue-600 flex items-center gap-2 transition-colors">
                                            <ChevronRight size={14} className="text-slate-400" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
