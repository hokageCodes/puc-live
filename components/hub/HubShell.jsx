'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ChevronLeft, LogOut, Menu, User, X } from 'lucide-react';
import { useHubAuth, useHubGuard } from './HubAuthContext';
import { visibleNavGroups } from './sidebarConfig';

function NavItem({ item, pathname, onNavigate }) {
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
          : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-500 group-hover:text-emerald-700'}`} />
      {item.name}
    </Link>
  );
}

function NavGroups({ groups, pathname, onNavigate }) {
  return (
    <nav className="flex-1 px-4 py-6 overflow-y-auto">
      {groups.map((group, index) => (
        <div key={group.id} className={index > 0 ? 'mt-4 pt-4 border-t border-slate-200' : ''}>
          {group.label && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function HubShell({ children }) {
  const pathname = usePathname();
  const { status, isAuthenticated } = useHubGuard(); // redirects to /login when unauthenticated
  const { user, roles, signOut } = useHubAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navGroups = useMemo(() => visibleNavGroups(roles), [roles]);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User';
  const initial = (user?.firstName || user?.email || 'U').charAt(0).toUpperCase();

  if (status === 'loading' || status === 'authenticating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking your session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Guard is redirecting to /login; render nothing to avoid a flash.
    return null;
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={closeSidebar}
        />

        {/* Sidebar */}
        <aside
          className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } shadow-xl lg:shadow-none`}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600 text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">PUC Hub</h2>
                <p className="text-xs text-slate-400">HR Workspace</p>
              </div>
            </div>
            <button onClick={closeSidebar} className="lg:hidden p-1 rounded-md hover:bg-emerald-50 text-slate-500" aria-label="Close sidebar">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <NavGroups groups={navGroups} pathname={pathname} onNavigate={closeSidebar} />

          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-600 text-white">
                <span className="text-xs font-bold">{initial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{roles.join(', ') || 'staff'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 text-slate-600"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <h1 className="text-lg font-semibold text-slate-800">PUC Hub</h1>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-600 text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{displayName}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
