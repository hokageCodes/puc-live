/* eslint-disable react/prop-types */
"use client"
import { useEffect } from 'react';
import { gsap } from 'gsap';

const Loader = ({ onComplete }) => {
  useEffect(() => {
    const animateTransition = () => {
      const tl = gsap.timeline({
        ease: "power4.inOut",
        onComplete: () => {
          if (onComplete) onComplete(); // Call once full animation finishes
        },
      });

      tl.to(".from-top .tile", {
        duration: 0.4,
        height: "100%",
        top: "0%",
        stagger: 0.05,
      });

      tl.to(".from-top .tile", {
        duration: 0.4,
        height: "100%",
        top: "100%",
        stagger: -0.05,
      });

      tl.set(".from-top .tile", { top: "0", height: "0" });
    };

    animateTransition();
  }, [onComplete]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-200 overflow-hidden">
      <div className="transition-container from-top fixed inset-0 flex z-10 pointer-events-none">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="tile bg-[#01553d] w-full h-0"></span>
        ))}
      </div>
    </div>
  );
};

export default Loader;
