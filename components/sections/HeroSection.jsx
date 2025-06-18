"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* BACKGROUND TEXT */}
      <motion.h1

        className="absolute text-[10vw] font-extrabold text-[#01553d] z-0 tracking-tight text-center"
      >
        Paul Usoro & Co
      </motion.h1>

      {/* IMAGE - OVERLAPPED */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="relative z-20"
      >
        <Image
          src="/assets/img/hero.png" // replace with your image
          alt="Main Visual"
          width={500}
          height={700}
          className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
        />
      </motion.div>
    </section>
  );
}
