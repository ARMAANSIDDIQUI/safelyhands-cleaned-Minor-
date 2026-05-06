import React from 'react';
import Image from 'next/image';

/**
 * AppAvailability Component
 * 
 * A compact section featuring "Available on" text followed by 
 * Google Play Store and Apple App Store badges.
 * 
 * Based on the "<div class="app-box">" structure in the HTML.
 */
const AppAvailability = () => {
  // Asset URLs from provided list
  const playStoreIcon = "https://placehold.co/135x40/000000/ffffff?text=Google+Play";
  const appleStoreIcon = "https://placehold.co/120x40/000000/ffffff?text=App+Store";

  return (
    <section className="w-full flex justify-center py-6 md:py-8 bg-white">
      <div className="flex flex-row items-center justify-center gap-4 md:gap-6">
        {/* "Available on" label */}
        <div className="flex items-center">
          <p className="text-[#1A1A1A] font-medium text-[15px] md:text-[16px] whitespace-nowrap">
            Available on
          </p>
        </div>

        {/* Play Store Badge */}
        <div className="flex items-center cursor-pointer transition-transform hover:scale-105">
          <a
            href="https://play.google.com/store/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Image
              src={playStoreIcon}
              alt="Get it on Google Play"
              width={135}
              height={40}
              className="h-9 md:h-10 w-auto object-contain"
            />
          </a>
        </div>

        {/* Apple Store Badge */}
        <div className="flex items-center cursor-pointer transition-transform hover:scale-105">
          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Image
              src={appleStoreIcon}
              alt="Download on the App Store"
              width={120}
              height={40}
              className="h-9 md:h-10 w-auto object-contain"
            />
          </a>
        </div>
      </div>

      <style jsx>{`
        /* Minimal spacing logic to match original layout if needed beyond Tailwind */
        .app-box {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 0;
        }
      `}</style>
    </section>
  );
};

export default AppAvailability;