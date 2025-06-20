"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineMail,
} from "react-icons/hi";

const navItems = [
  { path: "/", label: "Home", icon: HiOutlineHome },
  { path: "/firm", label: "Firm", icon: HiOutlineOfficeBuilding },
  { path: "/expertise", label: "Expertise", icon: HiOutlineBriefcase },
  { path: "/people", label: "People", icon: HiOutlineUsers },
  { path: "/careers", label: "Careers", icon: HiOutlineUserGroup },
  { path: "/contact", label: "Contact", icon: HiOutlineMail },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
  
    // Optional: delay to show exit animation
    setTimeout(() => router.push(path), 100); 
  };
  

  const handleLogoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow transition-all">
      <nav
        className={`flex items-center justify-between px-4 py-2 md:px-8 lg:px-12 transition-all duration-300 ${
          scrolled ? "shadow-md bg-white/95 backdrop-blur" : ""
        }`}
      >
        {/* Logo */}
        <div
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          className="cursor-pointer focus:outline-none"
        >
          <Image
            src="/assets/img/puc-logo.png"
            alt="Logo"
            width={100}
            height={48}
            className="object-contain"
          />
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="block md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <AiOutlineClose size={26} /> : <AiOutlineMenu size={26} />}
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <Link
                href={path}
                className={`text-lg group flex items-center gap-2 py-2 px-3 transition-all duration-200 border-b-2 ${
                  pathname === path
                    ? "border-green-700 text-green-700"
                    : "border-transparent text-gray-700 hover:text-green-700 hover:border-green-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t">
          <ul className="flex flex-col divide-y divide-gray-100">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <button
                  onClick={(e) => handleNavClick(e, path)}
                  className={`flex items-center w-full px-6 py-4 gap-3 text-left text-gray-800 hover:bg-green-50 ${
                    pathname === path ? "bg-green-100 text-green-800" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
