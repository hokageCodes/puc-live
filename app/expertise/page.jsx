'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import expertiseData from '@/data/expertise'; // Your new data file

// Convert expertiseData object to array with title, description, and link
const practiceAreas = Object.entries(expertiseData).map(([key, value]) => ({
  title: value.title,
  description: Array.isArray(value.description)
    ? value.description[0]
    : value.description,
  link: `/expertise/${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
}));

// Animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function OurExpertise() {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <div className="relative px-2 pt-32 md:pt-32 md:px-10 md:py-32 mx-auto max-w-7xl">
      {/* Heading */}
      <div className="w-full text-center mb-16" ref={headerRef}>
        <h2
          className={`relative text-5xl md:text-6xl lg:text-7xl font-black text-[#01553d] transition-all duration-1000 ease-out ${
            isInView ? 'animate-title-reveal' : ''
          }`}
        >
          <span className="relative z-10">OUR EXPERTISE</span>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[#01553d]/20 pointer-events-none z-0 text-[12vw] md:text-[5vw] whitespace-nowrap">
            OUR EXPERTISE
          </span>
        </h2>
        <div
          className={`h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4 transition-all duration-1000 ease-out ${
            isInView ? 'w-24' : 'w-0'
          }`}
        />
      </div>

      {/* Practice Areas List */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
        className="space-y-10 mt-16"
      >
        {practiceAreas.map((area, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-8 group"
          >
            {/* Title */}
            <div className="md:w-1/3 w-full mb-4 md:mb-0 text-4xl md:text-4xl font-semibold text-[#01553d] group-hover:text-[#013d2e] transition-all">
                {area.title}
            </div>

            {/* Description */}
            <div className="md:w-2/3 w-full text-gray-700 text-lg leading-relaxed text-justify">
              {area.description}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
