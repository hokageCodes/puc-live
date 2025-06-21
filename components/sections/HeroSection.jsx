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
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.4)), url('/assets/img/hero-puc.jpg')`,
      }}
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-black bg-opacity-40 z-0"
      />
      <div className="relative z-10 px-4 mx-auto sm:px-6 lg:px-8 max-w-4xl text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-5xl font-normal text-white uppercase sm:text-5xl lg:text-6xl xl:text-9xl drop-shadow-lg"
          >
            PAUL USORO <span className="text-white">& CO</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg text-gray-100 sm:text-xl max-w-2xl mx-auto drop-shadow-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            A leading full-service law firm, providing top-notch legal services to both local and international clients.
          </motion.p>
          <motion.div
            className="mt-8 sm:mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <a
              href="/practice-areas"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-normal text-white transition-all duration-200 rounded-l bg-[#01553d] hover:bg-[#013d2d] shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Our Practice Areas
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
