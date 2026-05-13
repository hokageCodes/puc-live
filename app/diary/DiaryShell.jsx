'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BookOpenText, CalendarDays, ChevronDown, LogOut, Plus } from 'lucide-react';
import { useLeaveAuth } from '../../components/leave/LeaveAuthContext';
import { leaveUserInitials } from '../../utils/diaryUserDisplay';

const AUTH_FREE_ROUTES = ['/diary/login'];

export default function DiaryShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, status, user } = useLeaveAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileWrapRef = useRef(null);
  const isLoading = status === 'loading' || status === 'authenticating';
  const skipShell = AUTH_FREE_ROUTES.some((route) => pathname?.startsWith(route));

  const handleSignOut = () => {
    setProfileOpen(false);
    signOut();
    const returnTo = pathname && pathname.startsWith('/diary') ? pathname : '/diary';
    router.replace(`/diary/login?next=${encodeURIComponent(returnTo)}`);
  };

  useEffect(() => {
    if (!profileOpen) return;
    const onDoc = (e) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [profileOpen]);

  if (skipShell) {
    return <>{children}</>;
  }

  const initials = leaveUserInitials(user);
  const teamOrDeptLabel = user?.team?.name
    ? user.team.name
    : user?.department?.name
      ? user.department.name
      : 'your team or department';
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Account'
    : '';
  const diaryHomeActive = pathname === '/diary';
  const newEntryActive = pathname?.startsWith('/diary/new');

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-slate-100">
      <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-[max(0.75rem,env(safe-area-inset-left))] py-2.5 pr-[max(0.75rem,env(safe-area-inset-right))] sm:gap-3 sm:px-4 sm:py-3 lg:gap-6 lg:px-6 lg:py-3.5">
          {/* Brand + nav: single row, safe-area aware */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <BookOpenText
              className="h-5 w-5 shrink-0 text-emerald-600 sm:h-6 sm:w-6"
              aria-hidden
            />
            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg lg:text-xl">
                Court Diary
              </h1>
              <p className="mt-0.5 hidden truncate text-[11px] text-slate-500 sm:block sm:text-xs lg:text-sm">
                Hearings for{' '}
                <span className="font-medium text-slate-800">{teamOrDeptLabel}</span>
              </p>
            </div>
          </div>

          <nav
            className="flex shrink-0 items-center gap-1 sm:gap-1.5 lg:gap-2"
            aria-label="Diary navigation"
          >
            <Link
              href="/diary"
              aria-label="Diary calendar"
              aria-current={diaryHomeActive ? 'page' : undefined}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition sm:h-10 sm:px-3 sm:text-sm ${
                diaryHomeActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="h-4 w-4 shrink-0 sm:h-[1.05rem] sm:w-[1.05rem]" aria-hidden />
              <span className="hidden min-[380px]:inline">Calendar</span>
            </Link>
            <Link
              href="/diary/new"
              aria-label="New diary entry"
              aria-current={newEntryActive ? 'page' : undefined}
              className={`inline-flex h-10 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition sm:gap-1.5 sm:px-3 sm:text-sm ${
                newEntryActive
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden min-[400px]:inline">New</span>
              <span className="hidden sm:inline"> entry</span>
            </Link>

            {user ? (
              <div
                className="relative border-l border-slate-200 pl-1.5 sm:pl-2.5 lg:pl-3"
                ref={profileWrapRef}
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex max-w-[4.5rem] items-center gap-1 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-1 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:max-w-[12rem] sm:gap-1.5 sm:py-1.5 sm:pl-1.5 sm:pr-2 lg:max-w-[15rem]"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label={`Account menu, ${displayName}`}
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover sm:h-9 sm:w-9"
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-800 sm:h-9 sm:w-9 sm:text-xs"
                      aria-hidden
                    >
                      {initials}
                    </div>
                  )}
                  <span className="hidden min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 sm:inline">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition sm:h-4 sm:w-4 ${profileOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>

                {profileOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 z-[200] mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-900/5 sm:w-72"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Signed in as</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{displayName}</p>
                      <p className="mt-1 truncate text-sm text-slate-600">{user.email || '—'}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Department</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{user.department?.name || '—'}</p>
                    </div>
                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 sm:py-4 lg:px-8">
        <main className="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col">
          {isLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-600 shadow-sm">
              Loading diary workspace...
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}
