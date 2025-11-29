'use client';

import { useMemo, useEffect, useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';
import { leaveApi } from '../../../utils/api';

const approverRoles = new Set(['teamLead', 'lineManager', 'hr']);

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (start.getTime() === end.getTime()) {
    return startStr;
  }
  return `${startStr} – ${endStr}`;
}

export default function LeaveCalendarPage() {
  const { user, token, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = status === 'loading' || status === 'authenticating' || loading;
  const canViewTeam = useMemo(
    () =>
      Array.isArray(user?.roles) &&
      user.roles.some((role) => approverRoles.has(role)),
    [user?.roles]
  );

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await leaveApi.getCalendarData(token);
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError('Failed to load calendar. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [isAuthenticated, token]);

  // Filter events for current month
  const currentMonthEvents = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
  }, [events]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Loading calendar…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
          {error}
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
            ? "View your team's upcoming leave to plan coverage and avoid scheduling conflicts."
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
                {currentMonthEvents.length} {currentMonthEvents.length === 1 ? 'event' : 'events'} scheduled
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
          {currentMonthEvents.length === 0 ? (
            <div className="col-span-2 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
              No leave scheduled for this month.
            </div>
          ) : (
            currentMonthEvents.map((event) => {
              const eventColour = event.colour || 'bg-slate-100 text-slate-700';
              return (
                <div
                  key={event.id}
                  className={`rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium ${eventColour}`}
                >
                  <p>{event.title}</p>
                  <p className="text-xs opacity-80">{formatDateRange(event.startDate, event.endDate)}</p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {events.length > currentMonthEvents.length && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
            Upcoming months
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {events
              .filter((event) => {
                const eventDate = new Date(event.startDate);
                const now = new Date();
                return eventDate > now && !currentMonthEvents.find((e) => e.id === event.id);
              })
              .slice(0, 10)
              .map((event) => {
                const eventColour = event.colour || 'bg-slate-100 text-slate-700';
                return (
                  <div
                    key={event.id}
                    className={`rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium ${eventColour}`}
                  >
                    <p>{event.title}</p>
                    <p className="text-xs opacity-80">{formatDateRange(event.startDate, event.endDate)}</p>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
