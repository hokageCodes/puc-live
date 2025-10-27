'use client';
import { Menu, Bell, Search } from 'lucide-react';

export default function LeaveHeader({ onToggleSidebar, sidebarOpen }) {
  return (
    <header className="bg-white border-b border-emerald-200 px-4 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-emerald-50 transition lg:hidden"
        >
          <Menu className="w-6 h-6 text-emerald-700" />
        </button>
        <h1 className="text-xl font-bold text-emerald-700">Leave Management System</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-4 py-2 space-x-2">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-slate-700 w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-emerald-50 transition">
          <Bell className="w-5 h-5 text-emerald-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}

