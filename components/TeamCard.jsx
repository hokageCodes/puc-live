'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export default function TeamMemberCard({ member, position, index }) {
  const cardRef = useRef(null);

  const baseUrl = 'https://puc-backend-t8pl.onrender.com';
  const hasPhoto = member.profilePhoto && member.profilePhoto !== '';

  const imageUrl = hasPhoto
    ? `${baseUrl}/${member.profilePhoto.replace(/^\/?uploads\//, 'uploads/')}`
    : null;

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
    <Link href={`/people/${member._id}`} className="block">
      <div
        ref={cardRef}
        className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      >
        <div className="relative">
          <div className="w-full h-[500px] overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-gray-500 text-sm">No Photo Available</span>
            )}
          </div>

          {/* Email Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 text-white w-full">
              {member.email && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `mailto:${member.email}`;
                  }}
                  className="flex items-center text-sm hover:text-blue-300 transition-colors underline"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {member.email}
                </button>
              )}
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
    </Link>
  );
}
