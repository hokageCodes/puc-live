'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import expertiseData from '../../data/expertise';

// Convert expertiseData object to array with title, description, image, and link
const practiceAreas = Object.entries(expertiseData).map(([key, value]) => ({
  title: value.title,
  image: value.image,
  description: Array.isArray(value.description)
    ? value.description[0]
    : value.description,
  link: `/expertise/${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
}));

// Animation variants
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
    <div className="relative px-4 pt-32 md:pt-32 md:px-10 md:py-32 mx-auto max-w-7xl">
      {/* Heading */}
      <div className="w-full text-center mb-16" ref={headerRef}>
        <div className="relative inline-block">
          <h2
            className={`relative text-5xl md:text-6xl lg:text-7xl text-[#01553d] tracking-tight transition-all duration-1000 ease-out z-10 ${
              isInView ? 'animate-title-reveal' : ''
            }`}
          >
            OUR EXPERTISE
          </h2>
        </div>
        <div
          className={`h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4 transition-all duration-1000 ease-out ${
            isInView ? 'w-24' : 'w-0'
          }`}
        />
      </div>

      {/* Practice Areas List */}
      <div className="space-y-16 mt-16">
        {practiceAreas.map((area, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col md:flex-row gap-8 border-b border-gray-200 pb-12 group"
          >
            {/* Image */}
            <div className="md:w-1/3 w-full h-64 overflow-hidden rounded-lg shadow-md">
              <Image
                src={area.image}
                alt={area.title}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Text Content */}
            <div className="md:w-2/3 w-full space-y-4">
              <h3 className="text-3xl font-semibold text-[#01553d] group-hover:text-[#013d2e] transition-all">
                {area.title}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed text-justify">
                {area.description}
              </p>
              {/* Optional CTA */}
              {/* <a href={area.link} className="inline-block mt-2 text-[#01553d] hover:underline font-medium">
                Learn more →
              </a> */}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
