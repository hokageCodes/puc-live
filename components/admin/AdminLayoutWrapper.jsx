'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayoutWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(null); // null = loading

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Skip auth check if on login page
    if (isLoginPage) {
      setAuthenticated(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin`, {
          credentials: 'include',
        });
        
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          router.replace('/admin/login');
        }
      } catch (err) {
        setAuthenticated(false);
        router.replace('/admin/login');
      }
    };

    checkAuth();
  }, [isLoginPage, router]);

  // Optional: Small loading screen when checking auth
  if (!isLoginPage && authenticated === null) {
    return <div className="p-4 text-slate-600 text-sm">Checking session...</div>;
  }

  // ✅ If on login page, render children directly (no sidebar/header)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Prevent flash if user is not authenticated
  if (!authenticated) return null;

  // ✅ If authenticated and not login page, render admin layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="h-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
