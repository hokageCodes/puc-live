'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AdminThemeProvider } from './AdminThemeContext';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';

function AdminLayoutShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, loading, checkAuth } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabWasHiddenRef = useRef(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!loading && !admin) {
      router.replace('/admin/login');
    }
  }, [admin, isLoginPage, loading, router]);

  // When returning to the tab, re-check session so roles/profile match the server (other admins may have changed access).
  useEffect(() => {
    if (isLoginPage || loading) return undefined;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        tabWasHiddenRef.current = true;
        return;
      }
      if (document.visibilityState === 'visible' && tabWasHiddenRef.current) {
        tabWasHiddenRef.current = false;
        void checkAuth();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isLoginPage, loading, checkAuth]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="admin-page min-h-screen flex items-center justify-center">
        <div className="text-center text-sm admin-text-muted">Checking session...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="admin-page min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            admin={admin}
          />
          <main className="admin-page flex-1 overflow-auto">
            <div className="px-2 py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayoutWrapper({ children }) {
  return (
    <AdminThemeProvider>
      <AdminAuthProvider>
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </AdminAuthProvider>
    </AdminThemeProvider>
  );
}
