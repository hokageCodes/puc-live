"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "./footer/Footer";
import NavBar from "./Navbar/Navbar";
import Loader from "./Loader";

export default function ClientLayout({ children }) {
  const [finished, setFinished] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    setFinished(false);
  }, [pathname]);

  return (
    <>
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
        children
      ) : (
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
    </>
  );
}
