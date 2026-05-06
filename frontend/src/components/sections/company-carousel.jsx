"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Fallback carousel images
const fallbackImages = [
  "https://placehold.co/800x600/e0f2fe/0ea5e9?text=Team+Culture+1",
  "https://placehold.co/800x600/f0f9ff/0284c7?text=Collaborative+Work",
  "https://placehold.co/800x600/e0f2fe/38bdf8?text=Office+Success",
  "https://placehold.co/800x600/f0f9ff/0ea5e9?text=Customer+Focused"
];

const CompanyCarousel = () => {
  const [images, setImages] = useState(fallbackImages);

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const imageUrls = data.map(item => item.imageUrl);
            setImages(imageUrls);
          }
        }
      } catch (error) {
        // Silently use fallback images
        console.log("Using fallback carousel images");
      }
    };
    fetchCarousel();
  }, []);

  if (images.length === 0) return null;

  // Split images into two rows
  const midPoint = Math.ceil(images.length / 2);
  const row1Images = images.slice(0, midPoint);
  const row2Images = images.slice(midPoint);

  // Triplicating lists to ensure a seamless infinite scroll even on large monitors
  const tripleRow1 = [...row1Images, ...row1Images, ...row1Images];
  const tripleRow2 = [...row2Images, ...row2Images, ...row2Images];

  return (
    <section className="bg-transparent overflow-hidden py-12">
      <style jsx global>{`
        @keyframes scrollRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes scrollLeft {
          0% { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-right {
          animation: scrollRight 40s linear infinite;
        }
        .animate-scroll-left {
          animation: scrollLeft 40s linear infinite;
        }
      `}</style>



      {/* Dual Row Slider Container */}
      <div className="relative w-full">
        {/* Row 1: Scrolling Right to Left */}
        <div className="flex w-fit animate-scroll-right">
          {tripleRow1.map((src, index) => (
            <div
              key={`row1-${index}`}
              className="relative flex-shrink-0 px-2 w-[280px] md:w-[350px]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px]">
                <Image
                  src={src}
                  alt={`Team photo ${index + 1}`}
                  fill
                  className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                  sizes="(max-width: 768px) 280px, 350px"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Padding between rows */}
        <div className="h-4 md:h-6" />

        {/* Row 2: Scrolling Left to Right */}
        <div className="flex w-fit animate-scroll-left">
          {tripleRow2.map((src, index) => (
            <div
              key={`row2-${index}`}
              className="relative flex-shrink-0 px-2 w-[280px] md:w-[350px]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px]">
                <Image
                  src={src}
                  alt={`Office culture ${index + 1}`}
                  fill
                  className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                  sizes="(max-width: 768px) 280px, 350px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>



    </section>
  );
};

export default CompanyCarousel;