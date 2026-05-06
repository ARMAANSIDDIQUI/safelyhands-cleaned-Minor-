"use client";

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, HelpCircle, Plus } from 'lucide-react';

const FAQs = () => {
    const faqs = [
        {
            question: "How do I hire a professional?",
            answer: "Download our app or book directly through the website. Choose your service, select your preferences, and we'll match you with verified professionals in your area."
        },
        {
            question: "Are the professionals verified?",
            answer: "Yes, every professional goes through a strict background check, including police verification, address verification, and skill assessment."
        },
        {
            question: "What if I'm not satisfied?",
            answer: "We offer a replacement guarantee. If you're not happy with the service professional, we will provide a replacement at no extra cost within the guarantee period."
        },
        {
            question: "How are the charges decided?",
            answer: "Our pricing is transparent and based on industry standards. Charges depend on the type of work, hours required, and experience of the professional."
        },
        {
            question: "Is it safe during the pandemic?",
            answer: "Safety is our priority. All our professionals follow strict hygiene protocols and are fully vaccinated."
        }
    ];

    return (
        <section className="py-24 bg-transparent">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-100 text-primary mb-6 mx-auto">
                        <HelpCircle size={32} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold font-display text-slate-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Everything you need to know about our services.
                    </p>
                </div>

                <Accordion.Root type="single" defaultValue="item-0" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Accordion.Item
                            key={index}
                            value={`item-${index}`}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden data-[state=open]:border-primary/50 data-[state=open]:shadow-md transition-all duration-300"
                        >
                            <Accordion.Header>
                                <Accordion.Trigger className="flex items-center justify-between w-full p-6 text-left group">
                                    <span className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                                        {faq.question}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-sky-50 transition-colors">
                                        <ChevronDown className="transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180" size={20} />
                                    </div>
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>

            </div>
        </section>
    );
};

export default FAQs;
