'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpenText, CalendarDays, LogOut, PlusCircle } from 'lucide-react';
import { useLeaveAuth } from '../../components/leave/LeaveAuthContext';

const NAV_ITEMS = [
  { href: '/diary', label: 'Team Diary', icon: CalendarDays },
  { href: '/diary/new', label: 'New Entry', icon: PlusCircle },
];

const AUTH_FREE_ROUTES = ['/diary/login'];

export default function DiaryShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, status, user } = useLeaveAuth();
  const isLoading = status === 'loading' || status === 'authenticating';
  const skipShell = AUTH_FREE_ROUTES.some((route) => pathname?.startsWith(route));

  const handleSignOut = () => {
    signOut();
    const returnTo = pathname && pathname.startsWith('/diary') ? pathname : '/diary';
    router.replace(`/diary/login?next=${encodeURIComponent(returnTo)}`);
  };

  if (skipShell) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpenText className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Court Diary</p>
              {user?.team?.name ? (
                <p className="text-xs text-slate-500 mt-0.5">Team: {user.team.name}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <main>
          {!isLoading && user && !user.team ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <span className="font-medium">No team on your profile.</span>{' '}
              Court diary needs a team in the database. Ask an admin to assign one on your staff record, or use{' '}
              <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">scripts/assignStaffTeam.js</code> locally.
            </div>
          ) : null}
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
              Loading diary workspace...
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
