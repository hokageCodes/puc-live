'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section
      ref={ref}
      className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/assets/img/he.jpg')`,
      }}
    >
      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 px-4 mx-auto sm:px-6 lg:px-8 w-full max-w-9xl text-center">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-normal text-white uppercase leading-tight"
            style={{
              textShadow: '3px 3px 8px rgba(0,0,0,0.9)',
            }}
          >
            PAUL USORO <span className="text-white">& CO</span>
          </motion.h1>
          <motion.p
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl text-white max-w-3xl mx-auto leading-relaxed"
            style={{
              textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            A leading full-service law firm, providing top-notch legal services to both local and international clients.
          </motion.p>
          <motion.div
            className="mt-6 sm:mt-8 md:mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <a
              href="/expertise"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-normal text-white transition-all duration-200 rounded bg-[#01553d] hover:bg-[#013d2d] shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Our Practice Areas
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
