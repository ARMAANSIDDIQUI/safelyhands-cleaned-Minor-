"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const cards = [
    {
        title: "Get Health Insurance",
        description: "We provide our workers with affordable health insurance to secure their health & future.",
        bgColor: "bg-[#fff9e6]",
        titleColor: "text-[#e67e22]",
        btnColor: "bg-[#f39c12]",
        image: "/healthinsurance.png",
        link: "/services/health-insurance"
    },
    {
        title: "Register as a worker",
        description: "Register to work with us! Just fill this form, and we will get back to you.",
        bgColor: "bg-[#fff1f2]",
        titleColor: "text-[#e11d48]",
        btnColor: "bg-[#f43f5e]",
        image: "/worker.png",
        link: "/register/helper"
    },
    {
        title: "Refer a worker",
        description: "Do your bit by getting them a job that pays well! Help them register as a worker now & get rewards up to Rs. 500",
        bgColor: "bg-[#e0f2fe]",
        titleColor: "text-[#0ea5e9]",
        btnColor: "bg-[#0ea5e9]",
        image: "/refer.png",
        link: "/refer-worker"
    },
    {
        title: "Worker Child Education",
        description: "We support our workers' children with quality education to help shape a brighter future for the next generation.",
        bgColor: "bg-[#f0fdf4]",
        titleColor: "text-[#16a34a]",
        btnColor: "bg-[#22c55e]",
        image: "/child.png",
        link: "/child-education"
    }
];

const WorkerBenefitCards = () => {
    return (
        <section className="py-20 bg-transparent">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className={`${card.bgColor} rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] shadow-sm`}
                        >
                            <div className="flex-1 z-10">
                                <h3 className={`text-2xl md:text-3xl font-bold mb-4 font-display ${card.titleColor}`}>
                                    {card.title}
                                </h3>
                                <p className="text-slate-600 mb-8 max-w-sm leading-relaxed">
                                    {card.description}
                                </p>
                                <Link
                                    href={card.link}
                                    className={`inline-block ${card.btnColor} text-white px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95`}
                                >
                                    Fill your details
                                </Link>
                            </div>
                            <div className="w-full md:w-48 h-48 relative rounded-2xl overflow-hidden border-4 border-white/50 shadow-md transform rotate-2">
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    className="object-cover transition-all duration-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WorkerBenefitCards;
