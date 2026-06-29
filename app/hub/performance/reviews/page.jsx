'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Gauge, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { useHubAuth } from '../../../../components/hub/HubAuthContext';
import { PERFORMANCE_ROLES } from '../../../../components/hub/sidebarConfig';
import { performanceApi } from '../../../../utils/api';

const STATUS_META = {
  plan_submitted: { label: 'Plan — awaiting agreement', cls: 'bg-amber-50 text-amber-700' },
  plan_agreed: { label: 'Plan agreed', cls: 'bg-emerald-50 text-emerald-700' },
  mid_employee: { label: 'Mid-term — employee', cls: 'bg-sky-50 text-sky-700' },
  mid_manager_returned: { label: 'Mid-term returned', cls: 'bg-sky-50 text-sky-700' },
  half_employee: { label: 'Half-year — employee', cls: 'bg-violet-50 text-violet-700' },
  half_manager_returned: { label: 'Half-year returned', cls: 'bg-violet-50 text-violet-700' },
  moderation: { label: 'Moderation', cls: 'bg-emerald-50 text-emerald-700' },
  closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-500' },
};

const fullName = (s) => (s ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : 'Unknown');

export default function PerformanceReviewQueuePage() {
  const { user, hasAnyRole } = useHubAuth();
  // Restricted to PERFORMANCE_ROLES while the module is still being rolled out.
  const allowed = hasAnyRole(PERFORMANCE_ROLES);
  const [cycle, setCycle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await performanceApi.getTeamReviews();
      setCycle(data.cycle || null);
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(err?.message || 'Failed to load the review queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">No review access</h1>
        <p className="mt-2 text-sm text-slate-600">This module is still being rolled out. It’s currently limited to HR and admin.</p>
      </div>
    );
  }

  const awaiting = reviews.filter((r) => r.status === 'plan_submitted').length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Performance</p>
        <h1 className="text-2xl font-semibold text-slate-900">Review queue</h1>
        <p className="text-sm text-slate-600">
          {cycle ? <>Cycle <b>{cycle.label}</b> · </> : null}
          {awaiting > 0 ? `${awaiting} plan${awaiting === 1 ? '' : 's'} awaiting your agreement` : 'No plans awaiting agreement'}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {loading ? (
          <div className="space-y-2 p-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-50" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Gauge className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No reviews to show yet. They’ll appear here once staff submit their plans.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reviews.map((r) => {
              const meta = STATUS_META[r.status] || { label: r.status, cls: 'bg-slate-100 text-slate-500' };
              return (
                <li key={r._id}>
                  <Link href={`/hub/performance/reviews/${r._id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-emerald-50/30">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-800">{fullName(r.staff)}</div>
                      {r.staff?.staffCode && <div className="text-xs text-slate-400">{r.staff.staffCode}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
