import React from 'react';
import { Quote } from 'lucide-react';

/**
 * MissionSection component
 * Cloned based on the design requirements and visual references.
 * Centered "Our Mission" heading with a blockquote-style mission statement
 * enclosed in iconic yellow quotation marks.
 */
const MissionSection = () => {
  return (
    <>
      <div className="pt-4 pb-4"></div>

      <section className="bg-transparent py-[80px] overflow-hidden">
        <div className="container mx-auto px-[15px] max-w-[1200px]">
          <div className="text-center">
            {/* "Our Mission" Heading */}
            <h2 className="font-display text-[24px] sm:text-[32px] font-semibold text-foreground mb-[40px]">
              Our Mission
            </h2>

            {/* Mission Statement Container */}
            <div className="relative max-w-[900px] mx-auto px-[40px] sm:px-[60px]">
              {/* Top-Left Yellow Quotation Mark */}
              <div className="absolute top-0 left-0 -translate-y-1/2 sm:translate-x-0">
                <Quote size={40} className="text-secondary opacity-60 rotate-180" />
              </div>

              {/* Mission Text */}
              <p className="font-display text-[18px] sm:text-[22px] leading-[1.6] text-muted-foreground font-normal italic">
                SAFELY HANDS is enabling customers to hire experienced, verified and reliable professionals.
              </p>

              {/* Bottom-Right Yellow Quotation Mark (rotated for closing effect) */}
              <div className="absolute bottom-0 right-0 translate-y-1/2">
                <Quote size={40} className="text-secondary opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-4"></div>
    </>
  );
};

export default MissionSection;