'use client';
import { useState, useEffect } from 'react';
import Sidebar from 'apps/puc-final-2025/components/admin/Sidebar';
import Header from 'apps/puc-final-2025/components/admin/Header';

export default function AdminLayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close sidebar on desktop
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onToggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
          
          {/* Main content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 to-white">
            <div className="h-full px-4 py-6 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}