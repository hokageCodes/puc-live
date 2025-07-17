import "./globals.css";
import NavBar from "../components/Navbar/Navbar";
import { Analytics } from "@vercel/analytics/next";
import Footer from "../components/footer/Footer";

// ✅ Viewport metadata moved here
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: 'Paul Usoro & Co | Leading Commercial Law Firm in Nigeria',
  description:
    'Paul Usoro & Co (PUC) is a top-tier full-service law firm in Nigeria, renowned for excellence in the Legal Domain',
  keywords: [
    'Paul Usoro and Co',
    'PUC law firm',
    'top law firms in Nigeria',
    'commercial law Nigeria',
    'dispute resolution Nigeria',
    'telecommunications law',
    'banking and finance law',
    'media law Nigeria',
    'arbitration lawyers Nigeria',
    'litigation experts Lagos',
    'legal services Nigeria',
    'energy and natural resources law',
    'infrastructure law Nigeria',
    'transport law',
    'project finance lawyers',
    'intellectual property Nigeria',
    'technology law firm Nigeria',
    'regulatory compliance Nigeria',
    'corporate governance Nigeria',
    'Paul Usoro SAN',
    'leading lawyers Nigeria',
    'associate lawyers PUC',
    'PUC legal team',
    'legal consultancy Lagos',
    'Nigerian bar association',
    'top legal firm Lagos',
    'maritime law Nigeria',
    'tax advisory law firm',
    'employment and labour law Nigeria',
    'PUC partners and associates',
    'professional legal services',
    'law firm with integrity Nigeria',
  ],
  openGraph: {
    title: 'Paul Usoro & Co | Leading Law Firm in Nigeria',
    description:
      'Paul Usoro & Co (PUC) is a top-tier full-service law firm in Nigeria, renowned for excellence in the Legal Domain',
    url: 'https://paulusoro.com',
    type: 'website',
    images: [
      {
        url: 'https://paulusoro.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Paul Usoro & Co Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paul Usoro & Co | Expert Legal Services',
    description:
      'Meet the expert team at Paul Usoro & Co, Nigeria’s leading full-service law firm.',
    site: '@paulusorolaw',
    creator: '@paulusorolaw',
    images: ['https://paulusoro.com/og-image.jpg'],
  },
  metadataBase: new URL('https://paulusoro.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className="h-full">
      <body>
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
