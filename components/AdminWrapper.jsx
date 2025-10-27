'use client';

import { usePathname } from 'next/navigation';
import NavBar from './Navbar/Navbar';
import Footer from './footer/Footer';

export default function AdminWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
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

