'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const AboutSection = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const statsRef = useRef(null);
  const imageRef = useRef(null);
  
  const [isVisible, setIsVisible] = useState({
    header: false,
    content: false,
    stats: false,
    image: false
  });

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const targetId = entry.target.getAttribute('data-animate');
          if (targetId) {
            setIsVisible(prev => ({ ...prev, [targetId]: true }));
          }
        }
      });
    }, observerOptions);

    // Observe elements with staggered delays
    const elements = [
      { ref: headerRef, id: 'header' },
      { ref: contentRef, id: 'content' },
      { ref: statsRef, id: 'stats' },
      { ref: imageRef, id: 'image' }
    ];

    elements.forEach(({ ref, id }) => {
      if (ref.current) {
        ref.current.setAttribute('data-animate', id);
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="text-center min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Geometric Background Elements with subtle animations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 -right-32 w-64 h-64 border-2 border-[#01553d]/10 rotate-45 rounded-3xl animate-float"></div>
        <div className="absolute bottom-20 -left-32 w-80 h-80 bg-[#01553d]/5 rotate-12 rounded-full blur-sm animate-float-delayed"></div>
        <div className="absolute top-1/2 right-20 w-32 h-32 border border-[#01553d]/20 rotate-[30deg] rounded-lg animate-float-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#01553d]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-[#01553d]/40 rounded-full animate-bounce"></div>
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 border border-[#01553d]/20 rounded-full animate-spin"
          style={{ animationDuration: '8s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-20">
        {/* Section Header with Scroll Animation */}
        <div 
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-1000 ease-out ${
            isVisible.header 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative inline-block">
            <h2 className={`text-5xl md:text-6xl lg:text-7xl text-[#01553d] mb-4 relative transition-all duration-1200 ease-out ${
              isVisible.header ? 'animate-title-reveal' : ''
            }`}>
              ABOUT US
              <div className="absolute top-0 left-0 text-[#01553d]/20 -translate-x-1 -translate-y-1 -z-10">
                ABOUT US
              </div>
            </h2>
            <div className={`w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4 transition-all duration-1000 ease-out ${
              isVisible.header ? 'animate-line-expand' : 'w-0'
            }`}></div>
          </div>
          <p className={`text-xl text-gray-600 mt-8 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-300 ${
            isVisible.header 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}>
            Pioneering legal excellence through innovation, integrity, and unwavering commitment to justice.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start -mt-10 text-left">
          {/* Left Content with Staggered Animation */}
          <div 
            ref={contentRef}
            className={`space-y-8 transition-all duration-1000 ease-out ${
              isVisible.content 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className={`transition-all duration-800 ease-out delay-200 ${
              isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <p className="text-center md:text-left text-lg text-gray-700 leading-relaxed mb-6">
                At Paul Usoro & Co, we merge traditional legal expertise with cutting-edge approaches to deliver unparalleled service. Our forward-thinking methodology ensures that every client receives innovative solutions tailored to the complexities of modern legal challenges.
              </p>
              <p className="text-center md:text-left text-lg text-gray-700 leading-relaxed">
                With decades of combined experience and a reputation built on excellence, we stand at the forefront of legal practice, consistently pushing boundaries and setting new standards in the industry.
              </p>
            </div>

            {/* Stats with Individual Animations */}
            <div 
              ref={statsRef}
              className={`grid grid-cols-3 gap-6 pt-4 transition-all duration-1000 ease-out delay-400 ${
                isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {[
                { number: '35+', text: 'Years Experience', shortText: 'Years of Experience' },
                { number: '500+', text: 'Cases Won', shortText: 'Cases Won' },
                { number: '100%', text: 'Client Satisfaction', shortText: 'Client Satisfaction' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center p-4 bg-[#01553d]/5 rounded-2xl border border-[#01553d]/10 hover:bg-[#01553d]/10 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    isVisible.stats ? 'animate-stat-reveal' : ''
                  }`}
                  style={{ 
                    animationDelay: isVisible.stats ? `${600 + index * 200}ms` : '0ms'
                  }}
                >
                  <div className="text-3xl font-black text-[#01553d] mb-2 transition-all duration-300 hover:scale-110">
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide hidden sm:block">
                    {stat.text}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#01553d] sm:hidden">
                    {stat.shortText}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button with Animation */}
            <div className={`pt-8 transition-all duration-1000 ease-out delay-600 ${
              isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <a
                href="/firm"
                className="inline-block px-8 py-4 text-base font-medium text-white bg-[#01553d] rounded-lg hover:bg-[#014634] transition-all duration-300 hover:scale-105 hover:shadow-lg transform hover:-translate-y-1"
              >
                About The Firm
              </a>
            </div>
          </div>

          {/* Right Image with Reveal Animation */}
          <div 
            ref={imageRef}
            className={`relative transition-all duration-1200 ease-out ${
              isVisible.image 
                ? 'opacity-100 translate-x-0 scale-100' 
                : 'opacity-0 translate-x-8 scale-95'
            }`}
          >
            <div className="relative w-full h-[500px] lg:h-[600px] group">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#01553d]/20 group-hover:border-[#01553d]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#01553d]/10">
                <Image
                  src="/assets/img/who-we-are.jpg"
                  alt="Paul Usoro & Co Law Office"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#01553d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Animated Accent Elements */}
              <div className={`absolute -top-4 -right-4 w-8 h-8 border-2 border-[#01553d] rounded-full animate-pulse transition-all duration-1000 ${
                isVisible.image ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`} style={{ transitionDelay: '800ms' }}></div>
              
              <div
                className={`absolute -bottom-4 -left-4 w-6 h-6 bg-[#01553d] rounded-full animate-bounce transition-all duration-1000 ${
                  isVisible.image ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{ animationDelay: '1s', transitionDelay: '1000ms' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent Bar with Animation */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#01553d] to-transparent transition-all duration-1500 ease-out ${
        isVisible.header ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
      }`} style={{ transitionDelay: '1200ms' }}></div>

      {/* Custom Keyframe Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-10px) rotate(45deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-8px) rotate(12deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(30deg); }
          50% { transform: translateY(-6px) rotate(30deg); }
        }
        
        @keyframes title-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.9);
            filter: blur(5px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0px) scale(1);
            filter: blur(0px);
          }
        }
        
        @keyframes line-expand {
          0% { width: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { width: 6rem; opacity: 1; }
        }
        
        @keyframes stat-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.8);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0px) scale(1);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite 2s;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite 1s;
        }
        
        .animate-title-reveal {
          animation: title-reveal 1.2s ease-out forwards;
        }
        
        .animate-line-expand {
          animation: line-expand 1s ease-out forwards;
        }
        
        .animate-stat-reveal {
          animation: stat-reveal 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default AboutSection;