'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLeaveAuth, useLeaveGuard } from '../../components/leave/LeaveAuthContext';
import { diaryApi } from '../../utils/api';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const toDayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfMonth = (value) => new Date(value.getFullYear(), value.getMonth(), 1);
const endOfMonth = (value) => new Date(value.getFullYear(), value.getMonth() + 1, 0);

export default function DiaryPage() {
  const { isAuthenticated } = useLeaveGuard({
    preserveNext: true,
    loginPath: '/diary/login',
  });
  const { status, user } = useLeaveAuth();
  const [entries, setEntries] = useState([]);
  const [teamName, setTeamName] = useState('');
  /** Entries fetch only — calendar/header render without waiting for this. */
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(() => toDayKey(new Date()));

  useEffect(() => {
    if (!isAuthenticated) {
      setEntriesLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setEntriesLoading(true);
      setError('');
      try {
        const data = await diaryApi.listEntries();
        if (cancelled) return;
        if (Array.isArray(data)) {
          setEntries(data);
          setTeamName('');
        } else {
          setEntries(Array.isArray(data?.entries) ? data.entries : []);
          setTeamName(data?.team?.name || '');
        }
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Failed to load diary entries.');
      } finally {
        if (!cancelled) setEntriesLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const groupedByDay = useMemo(() => {
    return entries.reduce((acc, item) => {
      const key = toDayKey(item.appearanceDate);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [entries]);

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = startOfMonth(visibleMonth);
    const lastDayOfMonth = endOfMonth(visibleMonth);
    const startWeekday = firstDayOfMonth.getDay(); // 0=Sun
    const daysInMonth = lastDayOfMonth.getDate();
    const cells = [];

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d);
      cells.push(date);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [visibleMonth]);

  const selectedEntries = groupedByDay[selectedDayKey] || [];
  const monthLabel = visibleMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  if (status === 'loading' || status === 'authenticating' || !isAuthenticated) {
    return <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">Loading diary...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Team Diary</h1>
          {(user?.team?.name || teamName) ? (
            <p className="text-sm text-slate-500 mt-1">
              Team: {user?.team?.name || teamName}
              {user?.department?.name ? (
                <span className="text-slate-400"> · {user.department.name}</span>
              ) : null}
            </p>
          ) : null}
        </div>
        <Link
          href="/diary/new"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          New entry
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Diary Calendar</h2>
                  {entriesLoading ? (
                    <p className="mt-1 text-xs text-slate-400">Loading entry counts…</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-medium text-slate-700">{monthLabel}</span>
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarCells.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="h-16 rounded-md bg-slate-50" />;
                  }

                  const key = toDayKey(cell);
                  const count = groupedByDay[key]?.length || 0;
                  const isSelected = key === selectedDayKey;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDayKey(key)}
                      className={`h-16 rounded-md border text-left px-2 py-1 transition ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-700">{cell.getDate()}</p>
                      {count > 0 && (
                        <p className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {count}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {selectedDayKey ? `Entries for ${formatDate(selectedDayKey)}` : 'Daily entries'}
              </h3>
              <div className="mt-3 space-y-2">
                {entriesLoading ? (
                  <div className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    Loading entries…
                  </div>
                ) : error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-600">{error}</div>
                ) : selectedEntries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    {Object.keys(groupedByDay).length === 0
                        ? 'No diary entries yet.'
                        : 'No entries on this day.'}
                  </div>
                ) : (
                  selectedEntries.map((entry) => (
                    <Link
                      key={entry._id}
                      href={`/diary/${entry._id}`}
                      className="block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
                    >
                      <p className="font-medium text-slate-900">{entry.matterTitle}</p>
                      <p className="text-xs text-slate-600">{entry.court}</p>
                      <p className="text-xs text-slate-500">Status: {entry.status}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
        </div>
      </section>
    </div>
  );
}
