"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, HandMetal, PhoneCall, Smile } from "lucide-react";

const steps = [
  {
    id: "choose",
    title: "Choose",
    description: "Select and book from our list of services",
    icon: <HandMetal size={40} className="text-primary" />,
  },
  {
    id: "talk",
    title: "Talk",
    description: "Get on a call with a Broomees expert.",
    icon: <PhoneCall size={40} className="text-primary" />,
  },
  {
    id: "relax",
    title: "Relax",
    description: "That’s all, the selected candidate will report to you at the earliest.",
    icon: <Smile size={40} className="text-primary" />,
  },
];

export default function HowItWorksModal({
  isOpen = false,
  onClose
}) {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[900px] mx-4 overflow-hidden rounded-[20px] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-[1060] p-2 text-[#6C757D] hover:text-[#212529] transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        <section className="p-8 md:p-12 text-center">
          <div className="mb-10">
            <h2 className="text-[36px] font-bold text-[#212529] mb-2 font-display">
              How It Works
            </h2>
            <p className="text-[16px] text-[#6C757D] font-body">
              Simple and convenient bookings from any device
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 list-none p-0 m-0">
            {steps.map((step) => (
              <li key={step.id} className="flex flex-col items-center px-4">
                <figure className="mb-6 flex items-center justify-center bg-[#F8F9FA] rounded-full w-24 h-24 p-6 transition-transform hover:scale-105 duration-200">
                  {step.icon}
                </figure>
                <h5 className="text-[20px] font-semibold text-[#212529] mb-3 font-display">
                  {step.title}
                </h5>
                <p className="text-[15px] leading-[1.6] text-[#6C757D] font-body max-w-[220px]">
                  {step.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer Accent Decoration (Optional, matching site's brand feel) */}
        <div className="h-2 w-full bg-[#72bcd4]" />
      </div>

      {/* Styles for animation in tailwind config aren't always available in clones, so we inject them or use inline */}
      <style jsx global>{`
        .login-modal {
          background: rgba(0, 0, 0, 0.6);
        }
        @keyframes fadeInZoom {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: fadeInZoom 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}