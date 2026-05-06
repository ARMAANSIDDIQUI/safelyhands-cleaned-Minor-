"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Linkedin } from 'lucide-react';

// Fallback static data
const fallbackCategories = ['All'];
const fallbackTeamData = [];

export default function AboutTeamGrid() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [activeCategory, setActiveCategory] = useState('All');
  const [teamData, setTeamData] = useState(fallbackTeamData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamAndCategories = async () => {
      try {
        setLoading(true);
        // Fetch Categories
        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData && catData.length > 0) {
            setCategories(['All', ...catData.map(c => c.name)]);
          }
        }

        // Fetch Members
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/team`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setTeamData(data);
          }
        }
      } catch (error) {
        console.log("Using fallback team data");
      } finally {
        setLoading(false);
      }
    };
    fetchTeamAndCategories();
  }, []);

  const filteredTeam = activeCategory === 'All'
    ? teamData
    : teamData.filter(member => member.category === activeCategory);

  if (loading) return <div className="text-center py-20">Loading team...</div>;

  return (
    <section className="bg-transparent section-padding">
      <div className="container px-6">
        <div className="text-center mb-12">
          <h2 className="text-[32px] md:text-[40px] font-bold text-primary mb-4">
            Meet Our Superstars
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            The passionate team working day and night to revolutionise the domestic help industry in Moradabad and nearby areas.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-standard border ${activeCategory === category
                ? 'bg-primary border-primary text-secondary shadow-soft'
                : 'bg-white/50 backdrop-blur-sm border-border text-muted-foreground hover:border-primary'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {filteredTeam.map((member) => (
            <div
              key={member._id || member.id}
              className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="relative group mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-soft transition-standard group-hover:scale-105">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-standard"
                    aria-label={`${member.name}'s LinkedIn profile`}
                  >
                    <Linkedin size={20} fill="currentColor" strokeWidth={0} />
                  </a>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredTeam.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No members found in this category yet.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}