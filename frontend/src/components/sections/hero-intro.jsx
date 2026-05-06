"use client";

import React from 'react';

const HeroIntro = () => {
  return (
    <section className="bg-transparent pt-12 pb-0 md:pt-16 lg:pt-20 lg:pb-0 overflow-hidden">
      <div className="container mx-auto px-[15px] max-w-[1140px]">
        <div className="text-center">
          <h1 id="hero-title" className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-[#212529] leading-[1.2] tracking-tight">
            Want your chores simplified? <br className="hidden md:block" />
            <span
              className="serviceHighlighted block mt-2 md:mt-1"
              style={{
                color: '#72bcd4',
                backgroundColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Book a Helper
            </span>
          </h1>
          {/* 
            Based on HTML structure and screenshots:
            - The text "Want your chores simplified?" is standard dark charcoal/black.
            - The span "Book a Broomee" has the class 'serviceHighlighted'.
            - The design instructions specify using the "specific orange theme color".
            - In the global CSS, brand-yellow is #72bcd4, which is the signature accent color.
          */}
        </div>
      </div>

      {/* 
        This is the intro section. 
        Note: The 'pb-0' in the original HTML ensures there is no padding between 
        this headline and the service cards grid coming immediately after it.
      */}

      <style jsx>{`
        .serviceHighlighted {
          /* Enforcing the specific theme color as per design instructions */
          color: #72bcd4;
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 28px;
            line-height: 1.3;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroIntro;