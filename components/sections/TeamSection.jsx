'use client';

import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TeamCard = lazy(() => import('../TeamCard'));

export default function TeamSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff`);
        const data = await res.json();
        setStaff(data);
      } catch (err) {
        console.error('❌ Error fetching staff:', err);
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const seniorPartner = staff.find(
    (m) => m.position?.trim().toLowerCase() === 'senior partner'
  );

  const managingPartner = staff.find(
    (m) => m.position?.trim().toLowerCase() === 'managing partner'
  );

  const partners = staff.filter(
    (m) =>
      m.position?.trim().toLowerCase() === 'partner' &&
      m._id !== seniorPartner?._id &&
      m._id !== managingPartner?._id
  );

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#014634]"
          >
            Leadership & Executive Team
          </h2>
          <p className="mt-4 text-gray-700 text-lg max-w-2xl mx-auto">
            At the helm of our legal excellence are brilliant minds with unmatched experience and vision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
          {seniorPartner && (
            <Suspense fallback={<LoadingCard />}>
              <TeamCard member={seniorPartner} badge="Senior Partner" />
            </Suspense>
          )}

          {managingPartner && (
            <Suspense fallback={<LoadingCard />}>
              <TeamCard member={managingPartner} badge="Managing Partner" />
            </Suspense>
          )}

          {partners.map((member) => (
            <Suspense key={member._id} fallback={<LoadingCard />}>
              <TeamCard member={member} badge="Partner" />
            </Suspense>
          ))}

          {/* Fallback if no filtered results */}
          {!seniorPartner && !managingPartner && partners.length === 0 && staff.length > 0 && (
            <>
              <div className="col-span-full text-center text-gray-500 mb-4">
                No filtered results found. Showing all staff:
              </div>
              {staff.map((member) => (
                <Suspense key={member._id} fallback={<LoadingCard />}>
                  <TeamCard member={member} badge={member.position || 'Staff'} />
                </Suspense>
              ))}
            </>
          )}
        </div>

        <div className="mt-20 text-center">
          <a
            href="/people"
            className="inline-block px-8 py-3 rounded-full text-white bg-[#014634] hover:bg-[#013d31] transition"
          >
            See Full Team
          </a>
        </div>
      </div>
    </section>
  );
}

function LoadingCard() {
  return (
    <div className="w-full h-[380px] bg-gray-200 rounded-xl animate-pulse" />
  );
}
