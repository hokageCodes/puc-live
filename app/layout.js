"use client"
import { Arsenal } from "next/font/google";
import "./globals.css";
import Footer from "../components/footer/Footer";
import NavBar from "../components/Navbar/Navbar";
import { useState } from "react";
import Loader from "../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const arsenal = Arsenal({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({ children }) {
  const [finished, setFinished] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en" className="h-full">
      <body className={`${arsenal.className} antialiased min-h-screen flex flex-col`}>
        <AnimatePresence mode="wait">
          {!finished && !isAdminRoute && (
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

        {isAdminRoute ? (
          // Admin routes - no NavBar/Footer, no loader
          children
        ) : (
          // Public routes - with NavBar/Footer and loader
          finished && (
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
          )
        )}
      </body>
    </html>
  );
}