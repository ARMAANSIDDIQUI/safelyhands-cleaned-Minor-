"use client";

import React, { useRef } from 'react';
import { Quote, Star } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const staticTestimonials = [
    {
        title: "Respect & Regular Income",
        name: "Shashi",
        role: "Domestic Helper",
        content: "Safely Hands ne mujhe sirf kaam nahi diya, balki respect bhi diya. Verification aur training ke baad mujhe achha parivaar mila. Ab meri income regular hai aur main apne bachchon ki padhai achhe se kara pa rahi hoon.",
        rating: 5,
    },
    {
        title: "Safe & Supportive Platform",
        name: "Rekha",
        role: "Babysitter",
        content: "Mujhe pehle stable kaam nahi milta tha. Safely Hands ne mujhe verified family ke saath connect kiya. Yahan safety aur support dono milta hai. Main bahut khush hoon.",
        rating: 5,
    },
    {
        title: "Training Se Confidence Mila",
        name: "Pooja",
        role: "Cook",
        content: "Safely Hands ki training se mujhe kaam karne ka confidence mila. Ab main professional tarike se kaam karti hoon aur mujhe time par payment milta hai. Yeh platform workers ke liye bahut accha hai.",
        rating: 5,
    },
    {
        title: "Patient Care Mein Growth",
        name: "Sunita",
        role: "Patient Care Attendant",
        content: "Maine patient care ka kaam Safely Hands ke through shuru kiya. Yahan mujhe training, guidance aur achhe employers mile. Main financially independent mehsoos karti hoon.",
        rating: 5,
    },
    {
        title: "Replacement & Support System",
        name: "Kavita",
        role: "All-Rounder Helper",
        content: "Agar kabhi family se match na ho to Safely Hands replacement ka option deta hai. Isse workers ko bhi tension nahi hoti. Team hamesha support karti hai.",
        rating: 5,
    },
    {
        title: "Regular Office Job Opportunity",
        name: "Rahul",
        role: "Peon Service",
        content: "Main pehle daily wage par kaam karta tha. Safely Hands ke through mujhe ek permanent office peon job mili. Ab mujhe regular salary milti hai aur kaam ka environment bhi professional hai.",
        rating: 5,
    },
    {
        title: "Dignity & Stability",
        name: "Anita",
        role: "Elderly Care",
        content: "Safely Hands ne mujhe ek stable job di jahan mujhe izzat milti hai. Employer bhi supportive hai aur payment system transparent hai.",
        rating: 5,
    },
    {
        title: "Behtar Bhavishya",
        name: "Meena",
        role: "24 Hrs Live-in Helper",
        content: "Is platform ki wajah se mujhe 24 ghante live-in job mili. Income better hai aur main apne parivaar ko financially support kar pa rahi hoon. Main Safely Hands ki thankful hoon.",
        rating: 5,
    }
];

const HumansOfBroomees = () => {
    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    );

    return (
        <section className="bg-transparent py-24 overflow-hidden relative">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display text-slate-900 mb-4">
                        Humans of <span className="text-primary">Safely Hands</span>
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Real stories of empowerment, resilience, and change from the people who make our homes run.
                    </p>
                </div>

                <div className="relative">
                    <Carousel
                        plugins={[plugin.current]}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                        onMouseEnter={plugin.current.stop}
                        onMouseLeave={plugin.current.reset}
                    >
                        <CarouselContent>
                            {staticTestimonials.map((testimonial, index) => (
                                <CarouselItem key={index}>
                                    {/* Main Card */}
                                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 border border-white/60 relative overflow-hidden group transition-all duration-500 min-h-[400px] flex flex-col justify-center mx-2 my-2">

                                        {/* Decorative Large Background Quote */}
                                        <Quote className="absolute top-4 left-8 text-sky-50 w-32 h-32 md:w-48 md:h-48 -z-10 transform -rotate-12 opacity-80" fill="currentColor" />

                                        <div className="relative z-10">
                                            {/* Header: Title & Rating */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                                <div>
                                                    <div className="flex gap-1 mb-2">
                                                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                                                            <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
                                                        ))}
                                                    </div>
                                                    {testimonial.title && (
                                                        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                                                            {testimonial.title}
                                                        </h3>
                                                    )}
                                                </div>
                                                <Quote className="text-sky-200 w-10 h-10 md:w-12 md:h-12 transform rotate-180" fill="currentColor" />
                                            </div>

                                            {/* Main Content */}
                                            <blockquote className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium italic mb-10 border-l-4 border-sky-400 pl-6">
                                                &quot;{testimonial.content}&quot;
                                            </blockquote>

                                            {/* Footer: Author */}
                                            <div className="flex items-end justify-between border-t border-slate-100 pt-8 mt-auto">
                                                <div>
                                                    <h4 className="text-2xl font-bold text-slate-900 mb-1">{testimonial.name}</h4>
                                                    <p className="text-primary font-medium text-lg">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Navigation Controls */}
                        <div className="hidden md:flex justify-between absolute top-1/2 -translate-y-1/2 w-full -px-12 left-0 right-0 pointer-events-none">
                            <CarouselPrevious className="pointer-events-auto -left-12 lg:-left-16 w-12 h-12 border-slate-200 bg-white/80 hover:bg-white text-slate-600" />
                            <CarouselNext className="pointer-events-auto -right-12 lg:-right-16 w-12 h-12 bg-primary text-white hover:bg-primary/90 border-transparent shadow-lg shadow-sky-200" />
                        </div>
                        {/* Mobile Navigation Controls */}
                        <div className="flex md:hidden justify-center gap-4 mt-8">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
};

export default HumansOfBroomees;
