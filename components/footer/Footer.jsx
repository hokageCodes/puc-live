'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-[#01553d] text-white overflow-hidden">
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
                  <Link href="https://flowbite.com/" className="hover:underline">Blog</Link>
                </li>
                <li>
                  <Link href="https://tailwindcss.com/" className="hover:underline">Job Offers</Link>
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
            <div>
              <h2 className="mb-4 font-semibold uppercase text-white">Legal</h2>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link href="#" className="hover:underline">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-white/30" />

        {/* Bottom Bar */}
        <div className="sm:flex sm:items-center sm:justify-between text-white/70 text-sm">
          <span>
            © {new Date().getFullYear()} <Link href="/" className="hover:underline">Paul Usoro & Co™</Link>. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:mt-0 space-x-6">
            {/* Example social icons using SVG */}
            <Link href="#" className="hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 0H1.5C.675 0 0 .675 0 1.5v21c0 .825.675 1.5 1.5 1.5h11.25V14.25H9.75V11.25h3V8.7c0-2.925 1.8-4.5 4.425-4.5 1.275 0 2.325.075 2.625.105v3.075h-1.8c-1.425 0-1.725.675-1.725 1.65v2.175h3.45L19.95 14.25h-3v9h5.55c.825 0 1.5-.675 1.5-1.5V1.5c0-.825-.675-1.5-1.5-1.5z" /></svg>
            </Link>
            <Link href="#" className="hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775A4.932 4.932 0 0 0 23.337 3.1a9.864 9.864 0 0 1-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.724 0-4.932 2.208-4.932 4.932 0 .386.045.762.127 1.124A13.978 13.978 0 0 1 1.67 3.149a4.928 4.928 0 0 0-.666 2.479c0 1.708.87 3.213 2.188 4.099A4.903 4.903 0 0 1 .96 9.1v.063a4.93 4.93 0 0 0 3.946 4.827 4.93 4.93 0 0 1-2.224.084 4.936 4.936 0 0 0 4.604 3.417A9.868 9.868 0 0 1 0 19.54a13.933 13.933 0 0 0 7.548 2.212c9.051 0 14.002-7.496 14.002-13.986 0-.213-.005-.426-.014-.637A10.012 10.012 0 0 0 24 4.557z" /></svg>
            </Link>
            {/* Add more icons as needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
