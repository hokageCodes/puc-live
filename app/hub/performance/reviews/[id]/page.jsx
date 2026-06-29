'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, ClipboardList, Gauge, Loader2, ShieldAlert, Target, Undo2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { performanceApi } from '../../../../../utils/api';
import StageAssessment from '../../../../../components/performance/StageAssessment';
import FinalRatingPanel from '../../../../../components/performance/FinalRatingPanel';
import { useHubAuth } from '../../../../../components/hub/HubAuthContext';
import { PERFORMANCE_ROLES } from '../../../../../components/hub/sidebarConfig';

const stageParamFor = (cycleStage) => (cycleStage === 'mid_term' ? 'mid' : cycleStage === 'half_year' ? 'half' : null);

const selCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

function ModerationPanel({ meta, review, onUpdated }) {
  const [rating, setRating] = useState(review.moderatedFinalRating || '');
  const [note, setNote] = useState(review.moderationNote || '');
  const [busy, setBusy] = useState(false);
  const finals = meta?.finalRatings || [];

  const moderate = async () => {
    if (!rating) { toast.error('Choose a moderated rating.'); return; }
    setBusy(true);
    try { onUpdated(await performanceApi.moderateReview(review._id, rating, note)); toast.success('Rating moderated.'); }
    catch (err) { toast.error(err?.message || 'Failed to moderate.'); }
    finally { setBusy(false); }
  };
  const reopen = async () => {
    const n = window.prompt('Reason for reopening (optional):') || '';
    setBusy(true);
    try { onUpdated(await performanceApi.reopenReview(review._id, n)); toast.success('Review reopened.'); }
    catch (err) { toast.error(err?.message || 'Failed to reopen.'); }
    finally { setBusy(false); }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">HR moderation</h2>
      <p className="mt-1 text-xs text-slate-500">
        Employee: <b>{review.employeeFinalRating || '—'}</b> · Manager: <b>{review.managerFinalRating || '—'}</b>
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[240px_1fr]">
        <select className={selCls} value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">Rating of record…</option>
          {finals.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input className={selCls} placeholder="Moderation note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={reopen} disabled={busy} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-60">Reopen</button>
        <button onClick={moderate} disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">Set moderated rating</button>
      </div>
    </section>
  );
}

const fullName = (s) => (s ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function PerformanceReviewDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasAnyRole } = useHubAuth();
  // Restricted to PERFORMANCE_ROLES while the module is still being rolled out.
  const allowed = hasAnyRole(PERFORMANCE_ROLES);
  const [review, setReview] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([performanceApi.getReview(id), performanceApi.getMeta()]);
      setReview(r);
      setMeta(m);
    } catch (err) {
      toast.error(err?.message || 'Failed to load the review.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  const act = async (action) => {
    let comment = '';
    if (action === 'request_changes') {
      comment = window.prompt('What changes are needed? (required)') || '';
      if (!comment.trim()) { toast.error('A note is required to request changes.'); return; }
    } else {
      comment = window.prompt('Optional note for the employee (press OK to agree):') || '';
    }
    if (action === 'agree' && !window.confirm('Agree this plan? The employee will be notified.')) return;
    setActing(true);
    try {
      const updated = await performanceApi.agreePlan(id, action, comment);
      setReview(updated);
      toast.success(action === 'agree' ? 'Plan agreed.' : 'Changes requested.');
    } catch (err) {
      toast.error(err?.message || 'Failed to action the plan.');
    } finally {
      setActing(false);
    }
  };

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
  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />;
  }
  if (!review) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Review not found.</div>;
  }

  const canAgree = review.status === 'plan_submitted';
  const totalWeight = (review.objectives || []).reduce((s, o) => s + (Number(o.weighting) || 0), 0);

  return (
    <div className="space-y-6">
      <Link href="/hub/performance/reviews" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600">
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{fullName(review.staff)}</h1>
            <p className="text-sm text-slate-500">
              {review.departmentSnapshot || 'No department'} · {review.staff?.staffCode || ''}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{review.status.replace(/_/g, ' ')}</span>
        </div>

        {canAgree && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button onClick={() => act('agree')} disabled={acting} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Agree plan
            </button>
            <button onClick={() => act('request_changes')} disabled={acting} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <Undo2 className="h-4 w-4" /> Request changes
            </button>
          </div>
        )}
      </header>

      {/* Objectives */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Performance objectives</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${totalWeight === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            Weights: {totalWeight}%
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {(review.objectives || []).map((o, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-slate-800">{o.performanceArea || `Objective ${i + 1}`}</h3>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{o.weighting || 0}%</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{o.target || '—'}</p>
            </div>
          ))}
          {(review.objectives || []).length === 0 && <p className="text-sm text-slate-400">No objectives.</p>}
        </div>
      </section>

      {/* Manager mid/half assessment (appears while the stage is open) */}
      {(() => {
        const stageParam = stageParamFor(review.cycle?.stage);
        if (!stageParam || !meta) return null;
        const returned = Boolean(review.sharedFlags?.[`${stageParam}Returned`]);
        return (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {stageParam === 'mid' ? 'Mid-term assessment' : 'Half-year assessment'}
              </h2>
              {returned && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Returned</span>}
            </div>
            <StageAssessment
              meta={meta}
              review={review}
              stageParam={stageParam}
              author="manager"
              editable={!returned}
              saveFn={(p) => performanceApi.saveManagerAssessment(id, stageParam, p)}
              handoffFn={() => performanceApi.returnStage(id, stageParam)}
              handoffLabel="Return to employee"
              onUpdated={setReview}
            />
          </section>
        );
      })()}

      {/* Development plan */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Career development plan</h2>
        </div>
        <div className="mt-4 space-y-3">
          {(review.developmentGoals || []).map((g, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-slate-800">{g.competency || `Goal ${i + 1}`}</h3>
                <span className="shrink-0 text-xs text-slate-400">Due {fmtDate(g.dueDate)}</span>
              </div>
              {g.howAchieved && <p className="mt-1 text-sm text-slate-600"><span className="text-slate-400">How:</span> {g.howAchieved}</p>}
              {g.evidence && <p className="text-sm text-slate-600"><span className="text-slate-400">Evidence:</span> {g.evidence}</p>}
              {g.leadSignOff?.name && (
                <p className="mt-2 text-xs font-medium text-emerald-700">Signed off by {g.leadSignOff.name} · {fmtDate(g.leadSignOff.date)}</p>
              )}
            </div>
          ))}
          {(review.developmentGoals || []).length === 0 && <p className="text-sm text-slate-400">No development goals.</p>}
        </div>
      </section>

      {/* Manager final rating (half-year) */}
      {review.cycle?.stage === 'half_year' && meta && (
        <FinalRatingPanel
          meta={meta}
          suggestion={review.suggestion}
          title="Manager final rating"
          initialRating={review.managerFinalRating}
          initialRationale={review.managerFinalRationale}
          editable
          onSave={(rating, rationale) => performanceApi.setManagerFinalRating(id, rating, rationale)}
          other={review.employeeFinalRating ? { label: 'Employee (proposed)', rating: review.employeeFinalRating, rationale: review.employeeFinalRationale } : null}
          onUpdated={setReview}
        />
      )}

      {/* HR moderation */}
      {hasAnyRole(['hr', 'admin']) && meta && (review.cycle?.stage === 'moderation' || review.managerFinalRating || review.moderatedFinalRating) && (
        <ModerationPanel meta={meta} review={review} onUpdated={setReview} />
      )}

      {/* Timeline */}
      {Array.isArray(review.timeline) && review.timeline.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">History</h2>
          <ul className="mt-3 space-y-2">
            {review.timeline.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span>
                  <b className="font-medium text-slate-700">{t.event.replace(/_/g, ' ')}</b>
                  <span className="text-slate-400"> · {fmtDate(t.timestamp)}</span>
                  {t.note ? <div className="text-xs text-slate-500">{t.note}</div> : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
