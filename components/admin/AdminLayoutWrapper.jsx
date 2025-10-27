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

    const checkAuth = () => {
      // SIMPLIFIED: Only check localStorage, don't make API calls
      console.log('🔍 [AdminLayoutWrapper] Checking auth...');
      console.log('🔍 [AdminLayoutWrapper] Current path:', pathname);
      
      try {
        const adminData = localStorage.getItem('adminData');
        console.log('🔍 [AdminLayoutWrapper] localStorage adminData:', adminData ? 'Present' : 'Missing');
        
        if (adminData) {
          try {
            const admin = JSON.parse(adminData);
            console.log('🔍 [AdminLayoutWrapper] Parsed admin:', { email: admin.email, isAdmin: admin.isAdmin });
            
            if (admin && admin.isAdmin) {
              console.log('✅ [AdminLayoutWrapper] Found valid admin data in localStorage');
              setAuthenticated(true);
              return;
            } else {
              console.log('❌ [AdminLayoutWrapper] Admin data invalid - isAdmin check failed');
            }
          } catch (e) {
            console.error('❌ [AdminLayoutWrapper] Failed to parse admin data from localStorage:', e);
          }
        }
        
        // If no valid admin data in localStorage, redirect to login
        console.log('❌ [AdminLayoutWrapper] No valid admin data, redirecting to login');
        setAuthenticated(false);
        router.replace('/admin/login');
      } catch (err) {
        console.error('❌ [AdminLayoutWrapper] Auth check error:', err);
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-auto bg-slate-50">
            <div className="px-2 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
