'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  ClipboardList,
  CalendarClock,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useLeaveAuth } from '../../components/leave/LeaveAuthContext';

const AUTH_FREE_ROUTES = ['/leave/login', '/leave/activate', '/leave/forgot', '/leave/reset'];

const NAV_ITEMS = [
  {
    href: '/leave/dashboard',
    label: 'Overview',
    description: 'Balances, activity, and quick actions',
    icon: LayoutDashboard,
  },
  {
    href: '/leave/requests',
    label: 'My Requests',
    description: 'Track submitted leave requests',
    icon: ClipboardList,
  },
  {
    href: '/leave/request/new',
    label: 'New Request',
    description: 'Book time off for yourself',
    icon: CalendarDays,
  },
  {
    href: '/leave/approvals',
    label: 'Approvals',
    description: 'Review pending team requests',
    icon: ListChecks,
    roles: ['teamLead', 'lineManager', 'hr'],
  },
  {
    href: '/leave/approvals/history',
    label: 'Approvals history',
    description: 'Your approval actions & request history',
    icon: ListChecks,
    roles: ['teamLead', 'lineManager', 'hr'],
  },
  {
    href: '/leave/calendar',
    label: 'Leave Calendar',
    description: 'Visualise upcoming absences',
    icon: CalendarClock,
  },
];

const formatRoles = (roles) =>
  Array.isArray(roles) && roles.length ? roles.join(', ') : 'Staff';

export default function LeaveShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, status } = useLeaveAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const skipShell = AUTH_FREE_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );
  const isLoading = status === 'loading' || status === 'authenticating';

  const filteredNav = useMemo(() => {
    if (skipShell) return [];
    if (!Array.isArray(user?.roles) || user.roles.length === 0) {
      return NAV_ITEMS.filter((item) => !item.roles);
    }
    return NAV_ITEMS.filter(
      (item) =>
        !item.roles ||
        item.roles.some((role) => user.roles.includes(role))
    );
  }, [skipShell, user?.roles]);

  if (skipShell) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/leave/login');
    } catch (error) {
      console.error('Leave sign out failed:', error);
    }
  };

  const handleNavigate = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 lg:static lg:z-30 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-600">
              Paul Usoro &amp; Co.
            </p>
            <p className="text-sm font-semibold text-slate-900">Leave Portal</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-6">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavigate}
                className={`group flex flex-col rounded-xl px-3 py-3 transition ${
                  active
                    ? 'bg-emerald-50/80 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      active
                        ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-500 group-hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Leave workspace
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  {NAV_ITEMS.find((item) =>
                    pathname?.startsWith(item.href)
                  )?.label || 'Overview'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500">{formatRoles(user?.roles)}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoading ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
                Loading your workspace…
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

