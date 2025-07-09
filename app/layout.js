// app/layout.jsx
import "./globals.css";
import Footer from "../components/footer/Footer";
import NavBar from "../components/Navbar/Navbar";
import Loader from "../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// SEO/social metadata
export const metadata = {
  title: "Paul Usoro & Co. | Leading Full‑Service Law Firm in Nigeria",
  description:
    "Paul Usoro & Co. (PUC) is a leading full‑service law firm in Nigeria, providing top‑notch legal services locally and internationally since 1985. Offices in Lagos, Abuja & Uyo.",
  openGraph: {
    title: "Paul Usoro & Co. | Leading Nigerian Law Firm",
    description:
      "Since 1985, Paul Usoro & Co. has excelled in corporate, finance, telecomms, transport, energy, and maritime law.",
    url: "https://puc-live.vercel.app",
    siteName: "Paul Usoro & Co.",
    images: [
      {
        url: "https://puc-live.vercel.app/puc-logo.png", // Adjust if different
        width: 1200,
        height: 630,
        alt: "Paul Usoro & Co. Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@paulusoroandco",
    title: "Paul Usoro & Co.",
    description:
      "PUC: A leading full-service law firm based in Lagos, Abuja & Uyo, Nigeria.",
    images: ["https://puc-live.vercel.app/puc-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  const [finished, setFinished] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  // Reset loader when route changes
  useEffect(() => setFinished(false), [pathname]);

  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full">
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
          // Admin routes: skip NavBar/Footer/Loader
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
      </body>
    </html>
  );
}
