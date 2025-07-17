import './globals.css';
import Footer from '../components/footer/Footer';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/next';
import NavBar from '../components/Navbar/Navbar';

export const metadata = {
  title: 'Paul Usoro & Co | Top Commercial Law Firm in Nigeria',
  description:
    'Paul Usoro & Co is Nigeria’s premier law firm known for excellence in the legal space.',
  authors: [{ name: 'Hokage Creative Labs' }],
  keywords: [
    'Paul Usoro & Co',
    'PUC Law Firm',
    'Commercial Law Nigeria',
    'Litigation Experts Lagos',
    'Legal Advisory Nigeria',
    'Top Law Firms in Nigeria',
    'Dispute Resolution Nigeria',
    'Regulatory Compliance Legal Services',
    'Intellectual Property Law Nigeria',
    'Corporate Law Advisory',
    'Arbitration Services Nigeria',
    'Banking Law Nigeria',
    'Oil and Gas Legal Services',
    'Telecom Legal Experts Nigeria',
    'Election Petition Lawyers',
    'Tech Legal Services',
    'Real Estate Law Nigeria',
    'Legal Consultants Nigeria',
    'Paul Usoro SAN',
    'Professional Legal Services',
    'PUC Legal Team',
    'Law firm with legacy',
    'Business Law Nigeria',
    'Legal representation in Lagos',
    'Nigeria’s foremost litigation firm',
    'Paul Usoro Chambers',
    'PUC Legal Practice',
    'Client-focused legal strategy',
    'PUC dispute resolution specialists',
  ],
  openGraph: {
    title: 'Paul Usoro & Co | Top Commercial Law Firm in Nigeria',
    description:
      'Paul Usoro & Co is Nigeria’s premier law firm offering legal advisory and litigation services to top clients across all sectors.',
    url: 'https://paulusoro.com',
    siteName: 'Paul Usoro & Co',
    images: [
      {
        url: 'https://paulusoro.com/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Paul Usoro & Co',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@paulusoroco',
    creator: '@paulusoroco',
    images: ['https://paulusoro.com/assets/og-image.jpg'],
  },
  metadataBase: new URL('https://paulusoro.com'),
  alternates: {
    canonical: 'https://paulusoro.com',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="canonical" href="https://www.paulusoro.com" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "LegalService",
              "name": "Paul Usoro & Co",
              "url": "https://www.paulusoro.com",
              "logo": "https://www.paulusoro.com/assets/logo.png",
              "image": "https://www.paulusoro.com/assets/og-image.jpg",
              "telephone": "+2348012345678",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Lagos",
                "addressCountry": "NG"
              },
              "areaServed": {
                "@type": "Country",
                "name": "Nigeria"
              },
              "description": "Nigeria’s leading litigation and corporate law firm providing top-tier legal services to clients across banking, oil & gas, telecoms, and more."
            }
          `}
        </script>

        <link
          rel="preload"
          href="/assets/fonts/optima.woff2"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <NavBar />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
