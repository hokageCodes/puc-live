"use client"
import { LogOut, User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminApi } from '../../utils/api';

export default function Header({ onToggleSidebar, sidebarOpen }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-md border-b border-[#01553d]">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Left: Sidebar toggle and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-[#014b35] transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-[#01553d]" />
            ) : (
              <Menu className="w-6 h-6 text-[#01553d]" />
            )}
          </button>

          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-[#01553d]">Admin Dashboard</h1>
          </div>
        </div>

        {/* Right: Avatar + dropdown */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#014b35] transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-[#01553d] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline-block text-sm font-medium text-[#01553d]">
                Admin
              </span>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#01553d] z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-[#01553d] border-b border-[#01553d]/20 hover:text-white">
                      Signed in as <span className="font-medium">Admin</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[#01553d] hover:bg-[#f3fdfb] flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
