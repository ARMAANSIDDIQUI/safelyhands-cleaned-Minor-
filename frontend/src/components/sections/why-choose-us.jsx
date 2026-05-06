import React from 'react';
import { BadgeCheck, Wallet, HeadphonesIcon } from 'lucide-react';

const WhyChooseUs = () => {
    const features = [
        {
            icon: <BadgeCheck size={32} />,
            title: "Verification & Assessment",
            description: "We enhance our rigorous physical and telephonic verification processes to ensure the highest quality assessments of our workers.",
            color: "bg-green-50 text-green-600"
        },
        {
            icon: <Wallet size={32} />,
            title: "Transparent Pricing",
            description: "You get what you pay for. Additionally, you get replacement guarantee, Covid-19 test reports, verification documents and more!",
            color: "bg-blue-50 text-blue-600"
        },
        {
            icon: <HeadphonesIcon size={32} />,
            title: "Customer Support",
            description: "Our executives will always be there to hear you out and solve your issues quickly and efficiently.",
            color: "bg-yellow-50 text-yellow-600"
        }
    ];

    return (
        <section className="py-24 bg-transparent relative overflow-hidden">
            {/* Decorative Elements */}
            {/* Decorative Elements - Removed solid backgrounds */}

            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col gap-12 items-center">

                    {/* Top Content (Centered) */}
                    <div className="w-full max-w-3xl text-center mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold font-display text-slate-800 mb-6 leading-tight">
                            Why <span className="text-primary">Choose Us</span>
                        </h2>
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            We're redefining the domestic help industry with trust, transparency, and technology.
                        </p>
                        <div className="flex justify-center">
                            <button className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:translate-y-[-2px]">
                                Get Started
                            </button>
                        </div>
                    </div>

                    {/* Bottom Grid (3 Columns) */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
