'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Hash,
  Pencil,
  Scale,
  Trash2,
  User,
} from 'lucide-react';
import { ApiError, diaryApi } from '../../utils/api';
import { leaveUserInitials } from '../../utils/diaryUserDisplay';

const PAGE_SIZE = 5;

function chunkEntries(items, size) {
  if (!items?.length) return [];
  const pages = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function creatorName(createdBy) {
  if (!createdBy || typeof createdBy !== 'object') return 'Team member';
  const first = String(createdBy.firstName || '').trim();
  const last = String(createdBy.lastName || '').trim();
  const full = `${first} ${last}`.trim();
  return full || 'Team member';
}

function formatSubmittedAt(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_STYLES = {
  scheduled: 'bg-sky-50 text-sky-800 ring-sky-100',
  held: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  adjourned: 'bg-amber-50 text-amber-900 ring-amber-100',
  closed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

function EntryCard({ entry, onDeleted, disabled }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const createdBy = entry.createdBy;
  const name = creatorName(createdBy);
  const initials = leaveUserInitials(
    createdBy && typeof createdBy === 'object'
      ? { firstName: createdBy.firstName, lastName: createdBy.lastName, email: createdBy.email }
      : null
  );
  const photo = createdBy && typeof createdBy === 'object' ? createdBy.profilePhoto : '';
  const submitted = formatSubmittedAt(entry.createdAt);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy || disabled) return;
    if (!window.confirm('Delete this diary entry? This cannot be undone.')) return;
    setLocalError('');
    setBusy(true);
    try {
      await diaryApi.deleteEntry(entry._id);
      onDeleted(entry._id);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err?.message || 'Could not delete entry.';
      setLocalError(msg);
    } finally {
      setBusy(false);
    }
  };

  const statusClass = STATUS_STYLES[entry.status] || STATUS_STYLES.scheduled;

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:border-emerald-200/80 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              <h4 className="text-sm font-semibold leading-snug text-slate-900 sm:text-base">
                {entry.matterTitle}
              </h4>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/diary/${entry._id}`}
                title="Edit entry"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                <span className="sr-only">Edit</span>
              </Link>
              <button
                type="button"
                title="Delete entry"
                disabled={busy || disabled}
                onClick={handleDelete}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                <span className="sr-only">Delete</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 sm:text-sm">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{entry.court}</span>
            </span>
            {entry.appearanceTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                {entry.appearanceTime}
              </span>
            ) : null}
            {entry.matterRef ? (
              <span className="inline-flex max-w-full items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                <span className="truncate font-mono text-[11px] sm:text-xs">{entry.matterRef}</span>
              </span>
            ) : null}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset sm:text-xs">
            <Scale className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            <span className={`rounded-md px-2 py-0.5 ring-1 ring-inset ${statusClass}`}>{entry.status}</span>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
            {photo ? (
              <img
                src={photo}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800"
                aria-hidden
              >
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <User className="h-3 w-3 shrink-0" aria-hidden />
                Submitted by
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
              {submitted ? (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 sm:text-xs">
                  <CalendarClock className="h-3 w-3 shrink-0" aria-hidden />
                  {submitted}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {localError ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{localError}</p>
      ) : null}

      <button
        type="button"
        onClick={() => router.push(`/diary/${entry._id}`)}
        className="mt-3 w-full rounded-lg border border-slate-100 bg-slate-50/80 py-2 text-center text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 sm:hidden"
      >
        Open full entry
      </button>
    </article>
  );
}

export default function DiaryDayEntryCarousel({
  entries,
  dayKey,
  entriesLoading,
  error,
  emptyStateMessage,
  noEntriesForDayMessage,
  hasAnyEntriesInDiary,
  onEntryRemoved,
}) {
  const [page, setPage] = useState(0);

  const pages = useMemo(() => chunkEntries(entries, PAGE_SIZE), [entries]);

  useEffect(() => {
    setPage(0);
  }, [dayKey, entries]);

  useEffect(() => {
    if (page >= pages.length && pages.length > 0) {
      setPage(pages.length - 1);
    }
  }, [page, pages.length]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setPage((p) => Math.min(pages.length - 1, p + 1));
  }, [pages.length]);

  if (entriesLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
        Loading entries…
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">{error}</div>;
  }

  if (!entries.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-10 text-center text-sm text-slate-500">
        {hasAnyEntriesInDiary ? noEntriesForDayMessage : emptyStateMessage}
      </div>
    );
  }

  const showCarousel = pages.length > 1;
  const trackPct = pages.length * 100;
  const slidePct = 100 / pages.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="flex h-full min-h-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            width: `${trackPct}%`,
            transform: `translateX(-${(page * 100) / pages.length}%)`,
          }}
        >
          {pages.map((group, pageIndex) => (
            <div
              key={pageIndex}
              className="box-border flex max-h-full min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 lg:pr-2"
              style={{ width: `${slidePct}%` }}
            >
              {group.map((entry) => (
                <EntryCard key={entry._id} entry={entry} onDeleted={onEntryRemoved} disabled={entriesLoading} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {showCarousel ? (
        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={page <= 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:pointer-events-none disabled:opacity-30"
            aria-label="Previous entries"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Page ${i + 1} of ${pages.length}`}
                aria-current={i === page ? 'true' : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={page >= pages.length - 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:pointer-events-none disabled:opacity-30"
            aria-label="Next entries"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      {showCarousel ? (
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, entries.length)} of {entries.length}
        </p>
      ) : null}
    </div>
  );
}
