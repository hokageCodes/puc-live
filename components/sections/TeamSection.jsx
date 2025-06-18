import React from 'react';
import Image from 'next/image';

const teamMembers = [
  { name: 'Paul Usoro, SAN', image: '/assets/img/PP.jpg' },
  { name: 'Alj', image: '/assets/img/Alj.jpg' },
  { name: 'Kabi', image: '/assets/img/kabi.jpg' },
  { name: 'MP', image: '/assets/img/MP.jpg' },
  { name: 'Chi', image: '/assets/img/chi.jpg' },
];

export default function OurTeam() {
  return (
    <section className="py-24 -mb-16 bg-[#01553d] relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute -top-40 -left-32 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px] z-0" />
      <div className="absolute -bottom-40 -right-32 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px] z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 relative">
              OUR TEAM
              <div className="absolute top-0 left-0 text-white/20 -translate-x-1 -translate-y-1 -z-10">
                OUR TEAM
              </div>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-white to-white/50 mx-auto mt-3" />
          </div>
          <p className="text-base md:text-lg text-white/80 mt-6 max-w-2xl mx-auto">
            A close-knit team of brilliant minds dedicated to redefining legal excellence with precision, grace, and creativity.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 place-items-center">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-xl shadow-lg bg-white/5 backdrop-blur-sm hover:scale-105 transition-transform duration-300"
              style={{ width: 160, height: 200 }}
            >
              <Image
                src={member.image}
                alt={member.name}
                width={160}
                height={200}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
                <p className="text-white text-xs font-semibold">{member.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <button className="text-sm font-semibold border border-white text-white py-3 px-6 rounded-full hover:bg-white hover:text-[#01553d] transition duration-300">
            Join our team
          </button>
        </div>
      </div>
    </section>
  );
}
