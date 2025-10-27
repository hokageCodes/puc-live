'use client';

import { usePathname } from 'next/navigation';
import NavBar from './Navbar/Navbar';
import Footer from './footer/Footer';

export default function AdminWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLeaveRoute = pathname?.startsWith('/leave');

  // Exclude admin and leave routes from public nav/footer
  if (isAdminRoute || isLeaveRoute) {
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

