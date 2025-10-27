'use client';

import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { staffApi } from '../../utils/api';

gsap.registerPlugin(ScrollTrigger);

const TeamCard = lazy(() => import('../TeamCard'));

export default function TeamSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching staff data...');
        const data = await staffApi.getAll();
        console.log('✅ Fetched staff data:', data);
        setStaff(data);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching staff:', err);
        console.error('❌ Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        setError(err.message);
      } finally {
        setLoading(false);
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

  // Create leadership array with priority order
  const leadershipTeam = [
    seniorPartner,
    managingPartner,
    ...partners
  ].filter(Boolean);

  // Split into top 3 and bottom 2
  const topThree = leadershipTeam.slice(0, 3);
  const bottomTwo = leadershipTeam.slice(3, 5);

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" />
      <div className=" mx-auto relative z-10">
        <div className="relative inline-block text-center w-full">
          <h2 ref={titleRef} className="text-5xl md:text-6xl lg:text-7xl text-[#01553d] mb-4 relative">
            LEADERSHIP & EXECUTIVE TEAM
            {/* <div className="absolute top-0 left-0 text-[#01553d]/20 -translate-x-1 -translate-y-1 -z-10">
              LEADERSHIP & EXECUTIVE TEAM
            </div> */}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-8 text-center">
            <p className="text-red-600 text-lg mb-4">
              Unable to load team members. Please try again later.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-[#01553d] text-white rounded-lg hover:bg-[#014634] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="mt-16 text-center">
            <div className="text-gray-500 text-lg">Loading team members...</div>
          </div>
        )}

        {/* Top Three - Centered Grid */}
        {!loading && !error && topThree.length > 0 && (
          <div className="flex justify-center mt-16 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
              {topThree.map((member, index) => {
                let badge = member.position || 'Staff';
                if (member === seniorPartner) badge = 'Senior Partner';
                else if (member === managingPartner) badge = 'Managing Partner';
                else if (member.position?.trim().toLowerCase() === 'partner') badge = 'Partner';

                return (
                  <div 
                    key={member._id} 
                    className={`${topThree.length === 1 ? 'col-span-1' : 
                               topThree.length === 2 ? 'col-span-1' : 
                               'col-span-1'} 
                               ${topThree.length === 1 ? 'mx-auto max-w-sm' : ''}`}
                  >
                    <Suspense fallback={<LoadingCard />}>
                      <TeamCard member={member} badge={badge} />
                    </Suspense>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Two - Centered */}
        {!loading && !error && bottomTwo.length > 0 && (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
              {bottomTwo.map((member) => {
                let badge = member.position || 'Staff';
                if (member === seniorPartner) badge = 'Senior Partner';
                else if (member === managingPartner) badge = 'Managing Partner';
                else if (member.position?.trim().toLowerCase() === 'partner') badge = 'Partner';

                return (
                  <div key={member._id} className="col-span-1">
                    <Suspense fallback={<LoadingCard />}>
                      <TeamCard member={member} badge={badge} />
                    </Suspense>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback if no filtered results */}
        {!loading && !error && leadershipTeam.length === 0 && staff.length > 0 && (
          <div className="mt-16">
            <div className="text-center text-gray-500 mb-8">
              No filtered results found. Showing all staff:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {staff.map((member) => (
                <Suspense key={member._id} fallback={<LoadingCard />}>
                  <TeamCard member={member} badge={member.position || 'Staff'} />
                </Suspense>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-20 text-center">
            <a
              href="/people"
              className="inline-block px-8 py-3 rounded-full text-white bg-[#014634] hover:bg-[#013d31] transition-colors duration-300 transform hover:scale-105"
            >
              See Full Team
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function LoadingCard() {
  return (
    <div className="w-full h-[380px] bg-gray-200 rounded-xl animate-pulse" />
  );
}