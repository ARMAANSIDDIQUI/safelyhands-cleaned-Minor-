"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Fallback investor data
const fallbackInvestors = [
  {
    name: "Venture Partners",
    src: "https://placehold.co/120x40/e0f2fe/0ea5e9?text=VC+Partner",
    width: 120,
    height: 40
  },
  {
    name: "Growth Fund",
    src: "https://placehold.co/100x40/e0f2fe/0ea5e9?text=Growth+Fund",
    width: 100,
    height: 40
  },
  {
    name: "Seed Labs",
    src: "https://placehold.co/100x40/e0f2fe/0ea5e9?text=Seed+Labs",
    width: 100,
    height: 40
  }
];

const InvestorsSection = () => {
  const [investors, setInvestors] = useState(fallbackInvestors);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/investors`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setInvestors(data);
          }
        }
      } catch (error) {
        // Silently use fallback data
        console.log("Using fallback investor data");
      }
    };
    fetchInvestors();
  }, []);

  return (
    <section className="bg-transparent py-[60px] md:py-[80px]">
      <div className="container mx-auto px-4">
        {/* Divider with Text Label */}
        <div className="relative flex items-center justify-center mb-10 md:mb-14">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e9ecef]"></div>
          </div>
          <span className="relative bg-white px-6 text-[18px] md:text-[20px] font-display font-medium text-[#212529]">
            Backed By
          </span>
        </div>

        {/* Logos Row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {investors.map((investor) => (
            <div
              key={investor._id || investor.name}
              className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
            >
              <Image
                src={investor.src}
                alt={investor.name}
                width={investor.width}
                height={investor.height}
                className="max-h-[40px] md:max-h-[48px] w-auto object-contain"
                priority
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestorsSection;