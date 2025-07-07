'use client';

import { useRef, useEffect } from 'react';
import { getImageUrl } from '../lib/getImageUrl';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TeamMemberCard({ member, position, index }) {
  const cardRef = useRef(null);
  const imgSrc = getImageUrl(member.profilePhoto);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="relative">
        <div className="w-full h-84 overflow-hidden">
          <img
            src={imgSrc}
            alt={`${member.firstName} ${member.lastName}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 text-white w-full">
            <div className="space-y-2">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center text-sm hover:text-blue-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {member.email}
                </a>
              )}
              {member.phoneNumber && (
                <a
                  href={`tel:${member.phoneNumber}`}
                  className="flex items-center text-sm hover:text-blue-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {member.phoneNumber}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          {member.firstName} {member.lastName}
        </h3>
        <p className="text-emerald-700 font-medium mb-2">{position}</p>
      </div>
    </div>
  );
}
