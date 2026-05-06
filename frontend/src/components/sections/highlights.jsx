import React from 'react';
import Image from 'next/image';
import { Clock, Users, Award, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

const Highlights = () => {
  return (
    <section className="py-24 bg-transparent relative">
      <div className="container mx-auto px-6">

        {/* Intro */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-display">
            The Safely Hands <span className="text-blue-600">Advantage</span>
          </h2>
          <p className="mt-4 text-slate-600 text-lg">Why thousands of families trust us for their home needs.</p>
        </div>

        {/* Grid Layout (2x2) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Wide Range of Services */}
          <div className="relative overflow-hidden rounded-[24px] bg-white border border-slate-100 p-6 md:p-8 hover:shadow-xl transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Wide Range of Services</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Services include Domestic Help, Cook, Babysitter, Elder Care, and more — all in one platform.
            </p>
          </div>

          {/* Card 2: Replacement Guarantee */}
          <div className="relative overflow-hidden rounded-[24px] bg-white border border-slate-100 p-6 md:p-8 hover:shadow-xl transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Replacement Guarantee</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              ( Within 3 days )
            </p>
          </div>

          {/* Card 3: Trusted by Thousands */}
          <div className="relative overflow-hidden rounded-[24px] bg-white border border-slate-100 p-6 md:p-8 hover:shadow-xl transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Trusted by Thousands of Families</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              The platform highlights that thousands of families trust them for their home service needs.
            </p>
          </div>

          {/* Card 4: Trained Staff */}
          <div className="relative overflow-hidden rounded-[24px] bg-white border border-slate-100 p-6 md:p-8 hover:shadow-xl transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Trained Staff</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              All our staff members are rigorously trained, background-checked, and verified.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Highlights;
