"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineMail,
} from "react-icons/hi";
import { FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/firm", label: "Firm" },
  { path: "/expertise", label: "Expertise" },
  { path: "/people", label: "People" },
  { path: "/careers", label: "Careers" },
  { path: "/contact", label: "Contact" },
];

export default function Footer() {
  const router = useRouter();

  const handleLogoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/");
  };

  return (
    <footer className="bg-[#01553d] border-t border-gray-200 mt-16 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">

          {/* Logo and intro */}
          <div className="flex flex-col items-start space-y-4">
            <div
              onClick={handleLogoClick}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
            >
              <Image
                src="/assets/img/puc-logo.png"
                alt="Logo"
                width={100}
                height={48}
                className="object-contain w-24 h-auto"
              />
            </div>
            <p className="text-sm max-w-xs">
              Leading full-service law firm, providing top-notch legal services to both local and international clients.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://twitter.com/yourhandle"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-300 transition-colors duration-200"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-300 transition-colors duration-200"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="https://instagram.com/yourhandle"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-300 transition-colors duration-200"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Navigation links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                className="hover:text-green-300 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-10 border-t border-white/30 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} PUC Law Firm. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed by Hokage Creative Labs</p>
        </div>
      </div>
    </footer>
  );
}
