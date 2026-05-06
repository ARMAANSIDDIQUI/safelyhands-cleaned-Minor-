import React from 'react';

/**
 * AboutHero Section
 * 
 * This component clones the hero section of the about page featuring the centered 
 * "We are Broomees" headline with yellow highlighting and the subtext 
 * "A team of go-getters to give you a smooth experience".
 */
const AboutHero = () => {
  return (
    <section
      id="cover"
      className="bg-transparent pt-8 pb-8 md:pt-12 md:pb-10"
    >
      <div className="container mx-auto px-[15px]">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Main Heading */}
          <div className="w-full mb-[8px] md:mb-[15px]">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-slate-900 mb-6 leading-tight">
              We are <span className="text-primary">Safely Hands</span>
            </h1>
          </div>

          {/* Subtext */}
          <div className="w-full">
            <p className="font-display text-[16px] md:text-[20px] text-muted-foreground opacity-90 max-w-[800px] mx-auto leading-relaxed">
              A team of go-getters to give you a smooth experience
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;