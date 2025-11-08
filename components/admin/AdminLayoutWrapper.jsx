'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AdminThemeProvider } from './AdminThemeContext';

function AdminLayoutShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(false);
      setAdminInfo(null);
      return;
    }

    const verifySession = async () => {
      try {
        const stored = localStorage.getItem('adminData');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.isAdmin) {
            setAdminInfo(parsed);
            setAuthenticated(true);
            return;
          }
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const headers = {};
        const storedToken = localStorage.getItem('admin_token');
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const res = await fetch(`${backendUrl}/api/admin/me`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });

        if (!res.ok) {
          throw new Error('Session expired');
        }

        const data = await res.json();

        if (!data?.admin?.isAdmin) {
          throw new Error('Not an admin');
        }

        localStorage.setItem('adminData', JSON.stringify(data.admin));
        setAdminInfo(data.admin);
        setAuthenticated(true);
      } catch (err) {
        console.error('[AdminLayoutWrapper] Session check failed:', err);
        localStorage.removeItem('adminData');
        setAdminInfo(null);
        setAuthenticated(false);
        router.replace('/admin/login');
      }
    };

    verifySession();
  }, [isLoginPage, pathname, router]);

  if (!isLoginPage && authenticated === null) {
    return (
      <div className="admin-page min-h-screen flex items-center justify-center">
        <div className="text-center text-sm admin-text-muted">Checking session...</div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authenticated) return null;

  return (
    <div className="admin-page min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            admin={adminInfo}
          />
          <main className="admin-page flex-1 overflow-auto">
            <div className="px-2 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayoutWrapper({ children }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminThemeProvider>
  );
}
