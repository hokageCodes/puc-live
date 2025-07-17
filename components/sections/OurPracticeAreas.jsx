'use client';

import { useEffect, useRef, useState, Suspense, lazy } from 'react';
const PracticeAreaCard = lazy(() => import('../../components/PracticeAreaCard'));

const practiceAreas = [
  {
    title: 'ADR & Advocacy',
    description: 'We provide comprehensive corporate law services...',
    image: '/assets/img/adr.webp',
  },
  {
    title: 'Transport Law',
    description: 'Our real estate experts handle all matters...',
    image: '/assets/img/road.webp',
  },
  {
    title: 'Banking and Finance',
    description: 'Navigating employer-employee relations can be complex...',
    image: '/assets/img/banking.webp',
  },
  {
    title: 'Capital Markets',
    description: 'Protecting your intellectual property is crucial...',
    image: '/assets/img/expertise/Capital.webp',
  },
  {
    title: 'Communications Law',
    description: 'When conflicts arise, our experienced litigators...',
    image: '/assets/img/expertise/Communications.webp',
  },
  {
    title: 'Energy and Environmental Law',
    description: 'Our tax law experts help individuals and businesses...',
    image: '/assets/img/expertise/energy.webp',
  },
];

export default function PracticeAreasSection() {
  const sectionRef = useRef(null);
  const [visibleCards, setVisibleCards] = useState(
    Array(practiceAreas.length).fill(false)
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting && !visibleCards[index]) {
            setVisibleCards((prev) =>
              prev.map((v, i) => (i === index ? true : v))
            );
          }
        });
      },
      { threshold: 0.2 }
    );

    const cardEls = document.querySelectorAll('[data-practice-card]');
    cardEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [visibleCards]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white relative overflow-hidden"
    >
      {/* Background animated grid */}
      <div className="absolute inset-0 opacity-[0.015] z-0 pointer-events-none">
        <div className="grid grid-cols-12 gap-2 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="border border-[#01553d] animate-pulse"
              style={{
                animationDelay: `${i * 0.12}s`,
                animationDuration: '5s',
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2">
        {/* Section Heading */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h2 className="text-5xl md:text-6xl lg:text-7xl text-[#01553d] mb-4 relative">
              OUR PRACTICE AREAS
              <div className="absolute top-0 left-0 text-[#01553d]/20 -translate-x-1 -translate-y-1 -z-10">
                OUR PRACTICE AREAS
              </div>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4"></div>
          </div>
          <p className="text-xl text-gray-600 mt-8 max-w-2xl mx-auto leading-relaxed">
            Pioneering legal excellence through innovation, integrity, and
            unwavering commitment to justice.
          </p>
        </div>

        {/* Practice Areas Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {practiceAreas.map((area, index) => (
            <div
              key={index}
              data-practice-card
              data-index={index}
              className={`transition-all duration-700 ease-out transform ${
                visibleCards[index]
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-12 scale-95'
              }`}
            >
              <Suspense
                fallback={
                  <div className="h-64 w-full bg-gray-100 rounded-3xl animate-pulse" />
                }
              >
                <PracticeAreaCard
                  title={area.title}
                  description={area.description}
                  image={area.image}
                />
              </Suspense>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <a
            href="/expertise"
            className="inline-block px-8 py-4 text-base font-medium text-white bg-[#01553d] rounded-lg hover:bg-[#014634] transition"
          >
            See All Practice Areas
          </a>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#01553d] to-transparent"></div>
    </section>
  );
}
