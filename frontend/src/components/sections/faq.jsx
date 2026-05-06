"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_DATA = [
  {
    question: "How can I hire a housemaid/babysitter/cook from Safely Hands?",
    answer: (
      <div className="space-y-2">
        <p className="m-0">
          1: Choose your desired service, fill in your requirements and make a booking on our platform.
        </p>
        <p className="m-0">
          2: Confirm your requirements with the relationship manager assigned to you.
        </p>
        <p className="m-0">
          3: Sit tight while our relationship manager finds the right fit for your home.
        </p>
      </div>
    ),
  },
  {
    question: "What if I’m not satisfied with the services?",
    answer: (
      <p className="m-0">
        While all our helpers undergo an intensive assessment regime before being certified as a Safely Hands helper, we still believe that there’s always room for improvement. In order to ensure that you obtain the optimum fit for your home, we provide an ‘complimentary replacement policy’ as part of your subscription. Just reach out to your relationship manager or mail us at Safelyhands@gmail.com.
      </p>
    ),
  },
  {
    question: "How much will a cook/maid/babysitter cost in Moradabad?",
    answer: (
      <p className="m-0">
        The average wage of our helpers is completely dependent on your requirements and location. It can vary anywhere between ₹4,000 to ₹25,000/per month.
      </p>
    ),
  },
  {
    question: "Why do your services seem more expensive than other helpers in the market?",
    answer: (
      <p className="m-0">
        Unlike maid services/agencies we don’t charge a hefty commission fee from our clients, just a nominal booking amount. The entire wage as estimated by our wage estimation matrix(based on the Minimum Wages Act Of 1948) is paid in full to the helper.
      </p>
    ),
  },
  {
    question: "Is a maid/cook/babysitter from Safely Hands reliable?",
    answer: (
      <p className="m-0">
        Every Safely Hands helper goes through a thorough background check using their Aadhar and police records, and is only sent to your homes after a successful vetting process.
      </p>
    ),
  },
  {
    question: "Is it safe to hire a maid/cook/babysitter during the pandemic?",
    answer: (
      <p className="m-0">
        In order to ensure your safety, every Safely Hands helper goes through a RT-PCR test and are sent to your home via a private cab.
      </p>
    ),
  },
];

const FAQAccordionItem = ({
  item,
  isOpen,
  toggle,
}) => {
  return (
    <div className="border-b border-[#E1E8F5] last:border-0 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-5 px-6 text-left transition-colors duration-200 hover:bg-[#F0F5FF]/50"
        aria-expanded={isOpen}
      >
        <span className="text-[#1A1A1A] text-[16px] md:text-[18px] font-semibold leading-tight pr-4">
          {item.question}
        </span>
        <div className="flex-shrink-0">
          {isOpen ? (
            <Minus className="w-5 h-5 text-[#1A1A1A]" />
          ) : (
            <Plus className="w-5 h-5 text-[#1A1A1A]" />
          )}
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out bg-white",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 text-[#666666] text-[15px] md:text-[16px] leading-[1.6]">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState < number | null > (null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-[80px] bg-white w-full" id="faqs">
      <div className="container mx-auto px-6 max-w-[1200px]">
        {/* Section Heading */}
        <div className="mb-10 text-left">
          <h2 className="text-[#1A1A1A] text-[32px] md:text-[36px] font-bold leading-tight mb-2">
            FAQs
          </h2>
        </div>

        {/* Accordion List */}
        <div className="border border-[#E1E8F5] rounded-[12px] bg-white overflow-hidden shadow-sm">
          {FAQ_DATA.map((item, index) => (
            <FAQAccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              toggle={() => toggleAccordion(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}