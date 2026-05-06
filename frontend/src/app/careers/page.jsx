"use client";

import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";
import { Briefcase, MapPin, Search } from "lucide-react";

export default function CareersPage() {
    const openings = [
        { title: "Service Manager", location: "Moradabad", type: "Full-time" },
        { title: "Operations Associate", location: "Moradabad", type: "Full-time" },
        { title: "Marketing Specialist", location: "Remote/Hybrid", type: "Contract" }
    ];

    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="pt-[120px] pb-20 container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-display font-bold text-slate-900 mb-6">Join Our Team</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Help us simplify household management and provide reliable care to thousands of families.
                    </p>
                </div>

                <div className="grid gap-6">
                    {openings.map((job, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                                        <Briefcase size={20} className="text-blue-500" />
                                        {job.title}
                                    </h3>
                                    <div className="flex gap-4 text-sm text-slate-500 font-medium">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                        <span>{job.type}</span>
                                    </div>
                                </div>
                                <button className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-8 bg-blue-600 rounded-3xl text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Don't see a fit?</h2>
                    <p className="mb-6 opacity-90">Send us your resume at Safelyhands@gmail.com and we'll keep you in mind for future openings.</p>
                    <a href="mailto:Safelyhands@gmail.com" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all">
                        Send Resume
                    </a>
                </div>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
