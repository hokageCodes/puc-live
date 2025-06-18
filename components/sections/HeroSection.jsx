"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden px-4">
      {/* BACKGROUND TEXT */}
      <motion.h1
        transition={{ delay: 0.2, duration: 1 }}
        className="absolute z-0 text-[#01553d] font-extrabold text-center tracking-tight leading-none
                   text-[18vw] sm:text-[10vw] md:text-[8vw] lg:text-[6vw] xl:text-[12vw]"
      >
        Paul Usoro & Co
      </motion.h1>

      {/* IMAGE - OVERLAPPED AND RESPONSIVE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="relative z-10 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw]"
      >
        <Image
          src="/assets/img/hero.png"
          alt="Main Visual"
          width={1050}
          height={700}
          className="w-full h-auto object-contain mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          priority
        />
      </motion.div>
    </section>
  );
}
