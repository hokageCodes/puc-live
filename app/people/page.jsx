'use client';

import { useEffect, useRef, useState, lazy, Suspense } from 'react';
// import { getImageUrl } from 'apps/puc-final-2025/lib/getImageUrl';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { staffApi } from '../../utils/api';

gsap.registerPlugin(ScrollTrigger);

// Lazy load TeamMemberCard
const TeamMemberCard = lazy(() => import('../../components/TeamCard'));

export default function PeopleTeamPage() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGroup, setActiveGroup] = useState('All');

  const positionGroups = {
    'Executive Leadership': ['senior partner', 'managing partner', 'partner'],
    'Team Leadership': ['managing associate', 'senior associate'],
    'Associates': ['associate'],
  };

  const groupOptions = ['All', ...Object.keys(positionGroups)];

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await staffApi.getAll();
        const visibleStaff = Array.isArray(data) ? data.filter((member) => member.isVisible !== false) : [];
        setStaff(visibleStaff);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching staff:', err);
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
      gsap.fromTo(
        '.position-section',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [staff]);

  const groupedStaff = () => {
    const groups = {};
    Object.keys(positionGroups).forEach(group => {
      groups[group] = [];
    });

    staff.forEach(member => {
      const position = member.position?.trim().toLowerCase();
      if (position) {
        for (const [group, positions] of Object.entries(positionGroups)) {
          if (positions.includes(position)) {
            groups[group].push({
              ...member,
              sortOrder: positions.indexOf(position),
            });
            break;
          }
        }
      }
    });

    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return groups;
  };

  const staffGroups = groupedStaff();

  const formatPositionTitle = (position) =>
    position
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014634] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading our team...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section ref={sectionRef} className="relative py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Title */}
          <div className="text-center mb-16">
            <h1
              ref={titleRef}
              className="text-4xl md:text-6xl tracking-tight text-[#014634] mb-6"
            >
              Our People
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Meet the exceptional legal minds who drive our success. Our team combines
              decades of experience with innovative thinking to deliver outstanding results
              for our clients.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {groupOptions.map(group => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-5 py-2 rounded-full border text-sm transition ${
                  activeGroup === group
                    ? 'bg-[#014634] text-white border-[#014634]'
                    : 'text-[#014634] border-[#014634] hover:bg-[#014634]/10'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Team Groups */}
          <div className="space-y-16">
            {Object.entries(positionGroups).map(([groupName, positions]) => {
              if (activeGroup !== 'All' && activeGroup !== groupName) return null;
              const members = staffGroups[groupName];
              if (!members || members.length === 0) return null;

              return (
                <div key={groupName} className="position-section">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl text-[#014634] mb-2">
                      {groupName}
                    </h2>
                    <div className="w-24 h-1 bg-[#014634] mx-auto"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
                    {members.map((member, index) => (
                      <Suspense key={member._id} fallback={<LoadingCard />}>
                        <TeamMemberCard
                          member={member}
                          position={formatPositionTitle(member.position)}
                          index={index}
                        />
                      </Suspense>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-24 text-center bg-white rounded-2xl shadow-lg p-12">
            <h2 className="text-3xl text-[#014634] mb-4">
              Ready to Work with Us?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our team is ready to provide you with exceptional legal services.
              Contact us today to discuss your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-block px-8 py-3 rounded-full text-white bg-[#014634] hover:bg-[#013d31] transition duration-300"
              >
                Get in Touch
              </a>
              <a
                href="/practice-areas"
                className="inline-block px-8 py-3 rounded-full text-[#014634] bg-transparent border-2 border-[#014634] hover:bg-[#014634] hover:text-white transition duration-300"
              >
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="w-full max-w-[360px] mx-auto h-[420px] bg-gray-200 rounded-2xl animate-pulse" />
  );
}
