'use client';

import { useMemo } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';

const MOCK_EVENTS = [
  {
    id: 'event-1',
    title: 'Your Annual Leave',
    dates: '12 – 16 Aug',
    colour: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'event-2',
    title: 'Chioma • Sick Leave',
    dates: '07 Aug',
    colour: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'event-3',
    title: 'Firm-wide public holiday',
    dates: '01 Oct',
    colour: 'bg-slate-200 text-slate-600',
  },
];

const approverRoles = new Set(['teamLead', 'lineManager', 'hr']);

export default function LeaveCalendarPage() {
  const { user, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();

  const isLoading = status === 'loading' || status === 'authenticating';
  const canViewTeam = useMemo(
    () =>
      Array.isArray(user?.roles) &&
      user.roles.some((role) => approverRoles.has(role)),
    [user?.roles]
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Loading calendar…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Calendar</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {canViewTeam ? 'Team calendar' : 'My leave calendar'}
        </h1>
        <p className="text-sm text-slate-600">
          {canViewTeam
            ? 'View your team’s upcoming leave to plan coverage and avoid scheduling conflicts.'
            : 'See your upcoming absences and firm-wide events at a glance.'}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                This month
              </h2>
              <p className="text-xs text-slate-500">
                Interactive calendar integration is in progress—events below are mocked.
              </p>
            </div>
          </div>
          {canViewTeam && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Team visibility enabled
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {MOCK_EVENTS.map((event) => (
            <div
              key={event.id}
              className={`rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium ${event.colour}`}
            >
              <p>{event.title}</p>
              <p className="text-xs opacity-80">{event.dates}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-sm text-slate-600">
        We’re wiring up a full calendar view with drag-to-select, filters (team vs. firm-wide), and export options.
        Expect role-based visibility: HR sees the firm, line managers see their reporting lines, and staff see personal events.
      </section>
    </div>
  );
}

