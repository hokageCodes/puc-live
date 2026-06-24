'use client';

import { usePathname } from 'next/navigation';
import NavBar from './Navbar/Navbar';
import Footer from './footer/Footer';

export default function AdminWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLeaveRoute = pathname?.startsWith('/leave');
  const isDiaryRoute = pathname?.startsWith('/diary');
  // Unified hub surfaces (single login now; the (hub) shell arrives in Phase 4).
  const isLoginRoute = pathname === '/login' || pathname?.startsWith('/login/');

  if (isAdminRoute || isLeaveRoute || isDiaryRoute || isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}

