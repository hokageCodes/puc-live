"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ComingSoon = () => {
  return (
    <section className="relative h-screen w-full bg-black text-white flex items-center justify-center">
      {/* Background layer (image or gradient) */}
      <div className="absolute inset-0 bg-[url('/assets/img/launch-bg.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#01553d]/80 to-black/90" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-4 max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          This Page is Coming Soon
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8">
          We’re working behind the scenes to craft something truly exceptional. Check back soon!
        </p>

        <Link href="/" passHref>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#01553d] text-white px-8 py-3 rounded-full text-lg font-medium transition-all hover:bg-[#027b59]"
          >
            Go Back Home
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
};

export default ComingSoon;
