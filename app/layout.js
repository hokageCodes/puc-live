"use client";
import { Arsenal } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer/Footer";
import { useState } from "react";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/Navbar/Navbar";

const arsenal = Arsenal({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({ children }) {
  const [finished, setFinished] = useState(false);

  return (
    <html lang="en" className="h-full">
      <body className={`${arsenal.className} antialiased min-h-screen flex flex-col`}>
        <AnimatePresence mode="wait">
          {!finished && (
            <motion.div
              key="loader"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
            >
              <Loader onComplete={() => setFinished(true)} />
            </motion.div>
          )}
        </AnimatePresence>

        {finished && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col flex-1"
          >
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </motion.div>
        )}
      </body>
    </html>
  );
}
