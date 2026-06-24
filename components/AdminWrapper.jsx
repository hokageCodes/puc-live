'use client';

import { usePathname } from 'next/navigation';
import NavBar from './Navbar/Navbar';
import Footer from './footer/Footer';

export default function AdminWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLeaveRoute = pathname?.startsWith('/leave');
  const isDiaryRoute = pathname?.startsWith('/diary');
  // Unified hub surfaces have their own chrome (HubShell) and a dedicated login.
  const isLoginRoute = pathname === '/login' || pathname?.startsWith('/login/');
  const isHubRoute = pathname === '/hub' || pathname?.startsWith('/hub/');

  if (isAdminRoute || isLeaveRoute || isDiaryRoute || isLoginRoute || isHubRoute) {
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

