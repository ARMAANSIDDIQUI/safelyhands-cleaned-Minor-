"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Linkedin } from "lucide-react";

const teamData = [
  // Founders
  {
    name: "Niharika Jain",
    role: "Founder & CSO",
    category: "Founders",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Niharika",
    description: "Ex-Egon Zehnder, The Dance Bible\nHindu College, Delhi University, Co'18Dropout, PGP - ISB Hyderabad",
    linkedin: "#"
  },
  {
    name: "Vaibhav Agrawal",
    role: "Founder & CEO",
    category: "Founders",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vaibhav",
    description: "Founder @Nanhe KadamFormer COO @KubmaEx-Kearney, Sheroes, BoldrocchiDelhi Technological University, Co'18",
    linkedin: "#"
  },
  {
    name: "Saurav Kumar",
    role: "Founder & COO",
    category: "Founders",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saurav",
    description: "Founder @Nanhe KadamEx-Boldrocchi, CY Super\nDelhi Technological University, Co'18",
    linkedin: "#"
  },
  // Customer Success (Selected as default in screenshots)
  {
    name: "Pooja",
    role: "CRM - TL",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Vishali",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vishali",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Aakanksha Devrani",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aakanksha",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Nisha Biswas",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nisha",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Payal",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Payal",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Gourav",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gourav",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Divyansh",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Divyansh",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Ritik",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ritik",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Sanchit",
    role: "Customer Relationship Manager",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanchit",
    contact: "Safelyhands@gmail.com",
    linkedin: "#"
  },
  {
    name: "Apoorv Gaur",
    role: "Team Lead - PRM",
    category: "Customer Success",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Apoorv",
    description: "\"Excellence is what I believe in\"",
    linkedin: "#"
  }
];

const categories = [
  "Founders",
  "Investors & Mentors",
  "Product & Tech",
  "Marketing & Design",
  "Customer Success",
  "Training & QA",
  "Operations",
  "Finance & Legal",
  "HR"
];

const TeamGrid = () => {
  const [activeCategory, setActiveCategory] = useState("Customer Success");

  const filteredTeam = teamData.filter(member => member.category === activeCategory);

  return (
    <section className="bg-white py-[80px]">
      <div className="container mx-auto px-[15px] max-w-[1200px]">
        {/* Section Heading */}
        <div className="text-center mb-[40px]">
          <h2 className="text-[36px] font-semibold font-display text-[#212529] mb-4">
            Meet The <span className="text-[#72bcd4]">Team</span>
          </h2>
        </div>

        {/* Categories Tab */}
        <div className="overflow-x-auto pb-4 mb-12 scrollbar-hide">
          <ul className="flex justify-start md:justify-center items-center gap-8 border-b border-[#e9ecef] whitespace-nowrap min-w-max px-4">
            {categories.map((category) => (
              <li key={category} className="relative">
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`pb-3 text-[14px] font-medium transition-colors duration-200 ${activeCategory === category
                    ? "text-[#212529] after:content-[''] after:absolute after:bottom-[-1.5px] after:left-0 after:w-full after:h-[3px] after:bg-[#72bcd4]"
                    : "text-[#6c757d] hover:text-[#212529]"
                    }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[30px] gap-y-[60px] mt-[40px]">
          {filteredTeam.map((member, index) => (
            <div key={`${member.name}-${index}`} className="relative flex flex-col items-center pt-[50px]">
              <div className="bg-white rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#e9ecef] w-full p-6 flex flex-col items-center text-center h-full min-h-[320px]">
                {/* Image Placeholder with Overlap */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[10px] w-[100px] h-[100px] rounded-full overflow-hidden border-[4px] border-white shadow-md bg-white">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>

                <div className="mt-[55px] w-full">
                  <h6 className="text-[16px] font-semibold font-display text-[#212529] mb-1 leading-tight">
                    {member.name}
                  </h6>
                  <p className="text-[13px] text-[#6c757d] font-body mb-3 leading-tight">
                    {member.role}
                  </p>

                  <div className="mt-4 flex flex-col items-center gap-2">
                    {member.contact && (
                      <p className="text-[12px] text-[#6c757d] font-body opacity-80 break-all">
                        {member.contact}
                      </p>
                    )}

                    {member.description && (
                      <p className="text-[12px] text-[#6c757d] font-body line-clamp-3 mb-2 px-2 italic">
                        {member.description}
                      </p>
                    )}

                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 transition-transform hover:scale-110 text-[#0077b5]"
                      >
                        <Linkedin size={24} fill="currentColor" strokeWidth={0} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if no members in category */}
        {filteredTeam.length === 0 && (
          <div className="text-center py-20 text-[#6c757d]">
            <p className="text-[18px]">Coming Soon</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TeamGrid;