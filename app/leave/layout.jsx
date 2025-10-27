'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import LeaveSidebar from '../../components/leave/LeaveSidebar';
import LeaveHeader from '../../components/leave/LeaveHeader';

export default function LeaveLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(null);

  const isLoginPage = pathname === '/leave/login';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(false);
      return;
    }

    const checkAuth = () => {
      const staffData = localStorage.getItem('staffData');
      const staffToken = localStorage.getItem('staff_token');
      
      if (staffData && staffToken) {
        try {
          const staff = JSON.parse(staffData);
          if (staff && staff.email) {
            setAuthenticated(true);
            return;
          }
        } catch (e) {
          console.error('Failed to parse staff data:', e);
        }
      }
      
      setAuthenticated(false);
      router.replace('/leave/login');
    };

    checkAuth();
  }, [isLoginPage, router]);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If on login page, render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If not authenticated, show loading
  if (authenticated === null || !authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        <LeaveSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <LeaveHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-auto bg-slate-50">
            <div className="px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

