'use client';

import { useEffect, useRef, lazy, Suspense } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

gsap.registerPlugin(ScrollTrigger);

const TeamCard = lazy(() => import('../../components/TeamCard'));

const teamMembers = [
  {
    name: 'Paul Usoro, SAN',
    role: 'Senior Partner',
    image: '/assets/img/PP.jpg',
  },
  {
    name: 'Barr(Mrs.) Mfon Usoro.',
    role: 'Managing Partner',
    image: '/assets/img/MP.jpg',
  },
  {
    name: 'Munirudeen Liadi',
    role: 'Partner',
    image: '/assets/img/Alj.jpg',
  },
  {
    name: 'Obafolahan Ojibara',
    role: 'Partner',
    image: '/assets/img/kabi.jpg',
  },
  {
    name: 'Chinedu Anyaso',
    role: 'Partner',
    image: '/assets/img/chi.jpg',
  },
];

export default function TeamSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 100, opacity: 0 },
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

  return (
    <section ref={sectionRef} className="bg-white pt-20">
      <div className="text-center mb-20">
        <div className="relative inline-block">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#01553d] mb-4 relative">
            <span ref={titleRef}>THE EXECUTIVE TEAM</span>
            <div className="absolute top-0 left-0 text-[#01553d]/20 -translate-x-1 -translate-y-1 -z-10 will-change-transform">
              THE EXECUTIVE TEAM
            </div>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4"></div>
        </div>
        <p className="text-xl text-gray-600 mt-8 max-w-2xl mx-auto leading-relaxed">
          Pioneering legal excellence through innovation, integrity, and unwavering commitment to justice.
        </p>
      </div>

      {/* Desktop Flex Wrap Grid */}
      <div className="hidden md:flex flex-wrap justify-center gap-6 px-4 mx-auto max-w-screen-xl">
        {teamMembers.map((member, index) => (
          <div key={index} className="w-[250px]">
            <Suspense
              fallback={
                <div className="w-full h-[380px] bg-gray-100 rounded-xl animate-pulse" />
              }
            >
              <TeamCard member={member} />
            </Suspense>
          </div>
        ))}
      </div>

      {/* Mobile Swiper */}
      <div className="block md:hidden px-2 relative">
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          centeredSlides={false}
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: '.custom-swiper-pagination',
          }}
          className="pb-16"
        >
          {teamMembers.map((member, index) => (
            <SwiperSlide key={index}>
              <Suspense
                fallback={
                  <div className="w-full h-[380px] bg-gray-100 rounded-xl animate-pulse" />
                }
              >
                <TeamCard member={member} />
              </Suspense>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="custom-swiper-pagination flex justify-center gap-2 absolute bottom-0 left-0 right-0 mt-32 z-10 [&>.swiper-pagination-bullet]:w-3 [&>.swiper-pagination-bullet]:h-3 [&>.swiper-pagination-bullet]:rounded-full [&>.swiper-pagination-bullet]:bg-[#d1d5db] [&>.swiper-pagination-bullet-active]:bg-[#01553d] [&>.swiper-pagination-bullet]:transition-all [&>.swiper-pagination-bullet]:duration-300" />
      </div>

      {/* CTA Button */}
      <div className="mt-16 text-center">
        <a
          href="/people"
          className="inline-block px-8 py-4 text-base font-medium text-white bg-[#01553d] rounded-lg hover:bg-[#014634] transition"
        >
          See Full Team
        </a>
      </div>
    </section>
  );
}
