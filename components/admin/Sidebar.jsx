'use client';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  ChevronLeft,
  Building2,
} from 'lucide-react';
import { useAdminTheme } from './AdminThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'All Staff', href: '/admin/dashboard/staff', icon: Users },
  { name: 'Blog', href: '/admin/dashboard/blog', icon: FileText },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { theme } = useAdminTheme();

  const activeClasses =
    theme === 'dark'
      ? 'bg-emerald-500/20 text-emerald-200 border-l-4 border-emerald-300'
      : 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600';
  const inactiveClasses =
    theme === 'dark'
      ? 'text-slate-200 hover:text-emerald-200 hover:bg-emerald-500/10'
      : 'text-[#01553d] hover:text-emerald-700 hover:bg-emerald-50';
  const iconInactive = theme === 'dark' ? 'text-slate-300 group-hover:text-emerald-200' : 'text-[#01553d] group-hover:text-emerald-700';
  const iconActive = theme === 'dark' ? 'text-emerald-200' : 'text-emerald-700';

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          admin-surface fixed lg:static top-0 left-0 z-50 h-full w-64 border-r
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b admin-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center admin-accent-bg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">PUC Admin</h2>
              <p className="text-xs admin-text-muted">Management Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md transition hover:bg-emerald-500/10"
          >
            <ChevronLeft className="w-5 h-5" />
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
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition duration-200 ${
                  isActive ? activeClasses : inactiveClasses
                }`}
                onClick={onClose}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? iconActive : iconInactive
                  }`}
                />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t admin-border">
          <div className="flex items-center space-x-3 p-3 rounded-lg admin-surface-alt">
            <div className="w-8 h-8 rounded-full flex items-center justify-center admin-accent-bg text-white">
              <span className="text-xs font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Administrator</p>
              <p className="text-xs admin-text-muted truncate">System Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
