'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLeaveAuth, useLeaveGuard } from '../../components/leave/LeaveAuthContext';
import { diaryApi } from '../../utils/api';
import DiaryDayEntryCarousel from './DiaryDayEntryCarousel.jsx';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
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
  const { status } = useLeaveAuth();
  const [entries, setEntries] = useState([]);
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
        } else {
          setEntries(Array.isArray(data?.entries) ? data.entries : []);
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
    const startWeekday = firstDayOfMonth.getDay();
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

  const selectedEntries = useMemo(
    () => groupedByDay[selectedDayKey] ?? [],
    [groupedByDay, selectedDayKey]
  );
  const monthLabel = visibleMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const handleEntryRemoved = useCallback((removedId) => {
    setEntries((prev) => prev.filter((e) => String(e._id) !== String(removedId)));
  }, []);

  if (status === 'loading' || status === 'authenticating' || !isAuthenticated) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-600 shadow-sm">
        Loading diary...
      </div>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden max-lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[1fr_minmax(300px,400px)] lg:grid-rows-1 xl:grid-cols-[1fr_minmax(320px,420px)]">
        {/* Calendar — full width of left column */}
        <div className="flex min-h-0 min-w-0 flex-col border-b border-slate-100 lg:border-b-0 lg:border-r">
          <div className="shrink-0 p-5 pb-3 sm:p-6 sm:pb-4 lg:p-8 lg:pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Diary calendar</h2>
                {entriesLoading ? (
                  <p className="mt-1 text-xs text-slate-400">Syncing entry counts…</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
                >
                  Prev
                </button>
                <span className="min-w-[8.5rem] text-center text-sm font-semibold text-slate-800">{monthLabel}</span>
                <button
                  type="button"
                  onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-5 pt-0 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:gap-1 sm:text-[10px]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-0.5">
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-0.5 sm:mt-1.5 sm:gap-1">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="aspect-square min-h-[1.75rem] rounded border border-transparent bg-slate-50/80 sm:min-h-[2rem]"
                    />
                  );
                }

                const key = toDayKey(cell);
                const count = groupedByDay[key]?.length || 0;
                const isSelected = key === selectedDayKey;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDayKey(key)}
                    className={`flex aspect-square min-h-[1.75rem] flex-col items-start rounded-md border p-0.5 text-left transition sm:min-h-[2rem] sm:p-1 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/25'
                        : 'border-slate-200/80 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold leading-none text-slate-800 sm:text-[11px]">
                      {cell.getDate()}
                    </span>
                    {count > 0 ? (
                      <span className="mt-auto inline-flex rounded-full bg-emerald-600 px-0.5 py-px text-[8px] font-bold leading-tight text-white sm:px-1 sm:text-[9px]">
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Entries — right column (beside calendar on lg+) */}
        <aside className="flex min-h-0 flex-col overflow-hidden bg-gradient-to-b from-slate-50/90 to-slate-100/80 p-5 sm:p-6 lg:p-6">
          <div className="mb-4 shrink-0 border-b border-slate-200/80 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {selectedDayKey && !entriesLoading && !error ? (
                <>
                  <span className="tabular-nums text-emerald-700">{selectedEntries.length}</span>{' '}
                </>
              ) : null}
              ENTRIES FOR
            </h3>
            <p className="mt-1 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
              {selectedDayKey ? formatDate(selectedDayKey) : 'Select a day'}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <DiaryDayEntryCarousel
              dayKey={selectedDayKey}
              entries={selectedEntries}
              entriesLoading={entriesLoading}
              error={error}
              emptyStateMessage="No diary entries yet. Use New entry to add one."
              noEntriesForDayMessage="No entries on this day. Pick another date or add a new entry."
              hasAnyEntriesInDiary={Object.keys(groupedByDay).length > 0}
              onEntryRemoved={handleEntryRemoved}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
