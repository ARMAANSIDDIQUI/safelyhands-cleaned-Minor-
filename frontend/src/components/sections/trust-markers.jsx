import React from 'react';
import { UserCheck, ShieldCheck, Syringe, Clock } from 'lucide-react';

export default function TrustMarkers() {
    const markers = [
        { icon: UserCheck, label: "Experienced & Certified" },
        { icon: ShieldCheck, label: "Police Verified" },
        { icon: Syringe, label: "Covid Ready" },
        { icon: Clock, label: "Punctual & Reliable" },
    ];

    return (
        <section className="py-12 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {markers.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex flex-col items-center justify-center gap-4 text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                                <div className="p-4 rounded-full text-blue-600 bg-blue-50">
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>
                                <span className="font-medium text-slate-800 text-lg">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
