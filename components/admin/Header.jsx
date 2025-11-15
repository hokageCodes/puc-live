"use client"
import { LogOut, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAdminTheme } from './AdminThemeContext';
import { useAdminAuth } from './AdminAuthContext';

export default function Header({ onToggleSidebar, sidebarOpen, admin }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useAdminTheme();
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast.success('Theme updated. Enjoy the refreshed look!');
  };

  const headerBorder = theme === 'dark' ? 'border-slate-700' : 'border-[#01553d]';
  const toggleHover = theme === 'dark'
    ? 'hover:border-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200'
    : 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700';
  const toggleBorder = theme === 'dark' ? 'border-slate-600' : 'border-[#01553d]/20';

  return (
    <header className={`sticky top-0 z-30 admin-surface border-b ${headerBorder}`}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Left: Sidebar toggle and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-emerald-500/10"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
        </div>

        {/* Right: Theme toggle + avatar */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleThemeToggle}
            className={`flex items-center justify-center rounded-full border ${toggleBorder} bg-transparent p-2 transition ${toggleHover}`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 hover:bg-emerald-500/10"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center admin-accent-bg text-white">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline-block text-sm font-medium">
                {admin?.email || 'Admin'}
              </span>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setDropdownOpen(false)} />
                <div className="admin-surface absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm admin-border border-b">
                      Signed in as <span className="font-medium">{admin?.email || 'Admin'}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm transition hover:bg-emerald-500/10 flex items-center space-x-2"
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
