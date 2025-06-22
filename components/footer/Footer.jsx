'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-[#01553d] text-white overflow-hidden mt-24">
      {/* Decorative blob background */}
      <div className="absolute inset-0 -z-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            fillOpacity="0.1"
            d="M0,224L60,229.3C120,235,240,245,360,240C480,235,600,213,720,208C840,203,960,213,1080,213.3C1200,213,1320,203,1380,197.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-screen-xl mx-auto px-2 py-12 lg:py-16">
        <div className="md:flex md:justify-between md:items-start">
          {/* Logo and Brand */}
          <div className="mb-10 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/img/puc-logo.png"
                alt="Logo"
                width={72}
                height={32}
                className="me-3"
              />
              <span className="text-2xl font-semibold whitespace-nowrap">Paul Usoro & Co</span>
            </Link>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 text-sm">
            <div>
              <h2 className="mb-4 font-semibold uppercase text-white">Resources</h2>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link href="#" className="hover:underline">Blog</Link>
                </li>
                <li>
                  <Link href="/job-openings" className="hover:underline">Job Offers</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 font-semibold uppercase text-white">Follow us</h2>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link href="#" className="hover:underline">LinkedIn</Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">X (Twitter)</Link>
                </li>
              </ul>
            </div>
            {/* <div>
              <h2 className="mb-4 font-semibold uppercase text-white">Legal</h2>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link href="#" className="hover:underline">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">Terms & Conditions</Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-white/30" />

        {/* Bottom Bar */}
        <div className="sm:flex sm:items-center sm:justify-center text-white/70 text-sm text-center">
          <span>
            © {new Date().getFullYear()} <Link href="/" className="underline">Paul Usoro & Co™</Link>. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
