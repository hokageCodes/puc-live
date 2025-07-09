// app/layout.jsx
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

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
        url: "https://puc-live.vercel.app/puc-logo.png",
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
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
