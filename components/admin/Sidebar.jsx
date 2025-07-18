'use client';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  ChevronLeft,
  Building2,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Staff', href: '/admin/dashboard/users', icon: Users },
  { name: 'Blog', href: '/admin/dashboard/blog', icon: FileText },
  { name: 'Reports', href: '/admin/dashboard/reports', icon: FileText },
  { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-[#01553d]/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#01553d]/40 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#01553d]/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#01553d] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#01553d]">PUC Admin</h2>
              <p className="text-xs text-[#01553d]/70">Management Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-[#014b35] transition"
          >
            <ChevronLeft className="w-5 h-5 text-[#01553d]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                  transition duration-200
                  ${isActive
                    ? 'bg-[#01553d]/10 text-[#01553d] border-r-4 border-[#01553d]'
                    : 'text-[#01553d] hover:text-white hover:bg-[#01553d]'}
                `}
                onClick={onClose}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#01553d]'
                      : 'text-[#01553d] group-hover:text-white'
                  }`}
                />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#01553d]/20">
          <div className="flex items-center space-x-3 p-3 bg-[#01553d]/5 rounded-lg">
            <div className="w-8 h-8 bg-[#01553d] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#01553d] truncate">Administrator</p>
              <p className="text-xs text-[#01553d]/60 truncate">System Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
