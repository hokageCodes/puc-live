'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Gauge, Loader2, Plus, Send, Target, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { performanceApi } from '../../../utils/api';
import StageAssessment from '../../../components/performance/StageAssessment';
import FinalRatingPanel from '../../../components/performance/FinalRatingPanel';

// Statuses at which the plan is agreed and stage reviews can begin.
const POST_AGREEMENT = ['plan_agreed', 'mid_employee', 'mid_manager_returned', 'half_employee', 'half_manager_returned', 'moderation', 'closed'];
const stageParamFor = (cycleStage) => (cycleStage === 'mid_term' ? 'mid' : cycleStage === 'half_year' ? 'half' : null);

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

const STAGE_LABEL = {
  planning: 'Planning',
  mid_term: 'Mid-term review',
  half_year: 'Half-year review',
  moderation: 'Moderation',
  closed: 'Closed',
};

const STATUS_LABEL = {
  draft: 'Draft — not yet submitted',
  plan_submitted: 'Plan submitted — awaiting your manager',
  plan_agreed: 'Plan agreed',
  reopened: 'Reopened for edits',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

function HistoryList({ items, currentCycleId }) {
  const past = (items || []).filter((it) => String(it.cycle?._id) !== String(currentCycleId));
  if (past.length === 0) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Past reviews</h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {past.map((it) => (
          <li key={it._id} className="flex items-center justify-between py-2.5 text-sm">
            <span className="font-medium text-slate-700">{it.cycle?.label || 'Cycle'}</span>
            <span className="text-slate-500">
              {it.moderatedFinalRating || it.managerFinalRating || it.employeeFinalRating || it.status.replace(/_/g, ' ')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Labeled({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export default function MyPerformancePage() {
  const [meta, setMeta] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState([]);
  const [goals, setGoals] = useState([]);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const editable = review && ['draft', 'reopened'].includes(review.status);
  const weightings = meta?.objectiveWeightings || [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const minGoals = meta?.limits?.MIN_DEVELOPMENT_GOALS || 2;
  const maxObjectives = meta?.limits?.MAX_OBJECTIVES || 6;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, mine, hist] = await Promise.all([
        performanceApi.getMeta(),
        performanceApi.getMyReview(),
        performanceApi.getMyHistory().catch(() => []),
      ]);
      setMeta(m);
      setCycle(mine.cycle);
      setReview(mine.review);
      setHistory(Array.isArray(hist) ? hist : []);
      setObjectives(
        (mine.review?.objectives || []).map((o) => ({
          performanceArea: o.performanceArea || '',
          weighting: o.weighting || '',
          target: o.target || '',
        }))
      );
      setGoals(
        (mine.review?.developmentGoals || []).map((g) => ({
          competency: g.competency || '',
          howAchieved: g.howAchieved || '',
          evidence: g.evidence || '',
          dueDate: toDateInput(g.dueDate),
        }))
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to load your performance review.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalWeight = useMemo(
    () => objectives.reduce((s, o) => s + (Number(o.weighting) || 0), 0),
    [objectives]
  );

  // Mirrors the backend validator so the user sees issues before submitting.
  const planErrors = useMemo(() => {
    const e = [];
    if (objectives.length === 0) e.push('Add at least one objective.');
    objectives.forEach((o, i) => {
      if (!o.performanceArea.trim() || !o.weighting || !o.target.trim()) e.push(`Objective ${i + 1} is incomplete.`);
    });
    if (objectives.length && totalWeight !== 100) e.push(`Weightings must total 100% (currently ${totalWeight}%).`);
    if (goals.length < minGoals) e.push(`Add at least ${minGoals} development goals.`);
    goals.forEach((g, i) => { if (!g.competency.trim()) e.push(`Development goal ${i + 1} needs a competency.`); });
    return e;
  }, [objectives, goals, totalWeight, minGoals]);

  const setObj = (i, k) => (ev) => setObjectives((arr) => arr.map((o, j) => (j === i ? { ...o, [k]: ev.target.value } : o)));
  const setGoal = (i, k) => (ev) => setGoals((arr) => arr.map((g, j) => (j === i ? { ...g, [k]: ev.target.value } : g)));
  const addObjective = () => setObjectives((a) => (a.length >= maxObjectives ? a : [...a, { performanceArea: '', weighting: '', target: '' }]));
  const removeObjective = (i) => setObjectives((a) => a.filter((_, j) => j !== i));
  const addGoal = () => setGoals((a) => [...a, { competency: '', howAchieved: '', evidence: '', dueDate: '' }]);
  const removeGoal = (i) => setGoals((a) => a.filter((_, j) => j !== i));

  const persist = async () => {
    const objPayload = objectives.map((o) => ({ ...o, weighting: Number(o.weighting) || undefined }));
    await performanceApi.saveObjectives(objPayload);
    const updated = await performanceApi.saveGoals(goals);
    setReview(updated);
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await persist();
      toast.success('Draft saved.');
    } catch (err) {
      toast.error(err?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (planErrors.length) { toast.error('Please complete your plan before submitting.'); return; }
    if (!window.confirm('Submit your plan to your line manager for agreement? You won’t be able to edit it after this.')) return;
    setSubmitting(true);
    try {
      await persist();
      const updated = await performanceApi.submitPlan();
      setReview(updated);
      toast.success('Plan submitted to your manager.');
    } catch (err) {
      toast.error(err?.message || 'Failed to submit your plan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
          <Target className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No active performance cycle.</p>
          <p className="text-xs text-slate-400">Your appraisal will appear here once HR opens a cycle.</p>
        </div>
        <HistoryList items={history} currentCycleId={null} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">My Performance</p>
        <h1 className="text-2xl font-semibold text-slate-900">{cycle.label}</h1>
        <p className="text-sm text-slate-600">
          Cycle stage: <b>{STAGE_LABEL[cycle.stage] || cycle.stage}</b> ·{' '}
          <span className={review.status === 'plan_submitted' || review.status === 'plan_agreed' ? 'text-emerald-700' : 'text-slate-600'}>
            {STATUS_LABEL[review.status] || review.status}
          </span>
        </p>
      </header>

      {!editable && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Your plan has been submitted. It’s now with your line manager — you’ll be notified when it’s agreed or sent back.
        </div>
      )}

      {/* Objectives */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Performance objectives</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${totalWeight === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            Weights: {totalWeight}% / 100%
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {objectives.map((o, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <Labeled label={`Objective ${i + 1} — performance area`}>
                  <input className={input} value={o.performanceArea} onChange={setObj(i, 'performanceArea')} disabled={!editable} placeholder="e.g. Client billing" />
                </Labeled>
                <Labeled label="Weighting">
                  <select className={input} value={o.weighting} onChange={setObj(i, 'weighting')} disabled={!editable}>
                    <option value="">—</option>
                    {weightings.map((w) => <option key={w} value={w}>{w}%</option>)}
                  </select>
                </Labeled>
              </div>
              <div className="mt-3">
                <Labeled label="Target / expected result">
                  <textarea rows={2} className={input} value={o.target} onChange={setObj(i, 'target')} disabled={!editable} placeholder="What does success look like?" />
                </Labeled>
              </div>
              {editable && (
                <div className="mt-2 flex justify-end">
                  <button onClick={() => removeObjective(i)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {objectives.length === 0 && <p className="text-sm text-slate-400">No objectives yet.</p>}
        </div>

        {editable && objectives.length < maxObjectives && (
          <button onClick={addObjective} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-emerald-300 hover:text-emerald-600">
            <Plus className="h-3.5 w-3.5" /> Add objective ({objectives.length}/{maxObjectives})
          </button>
        )}
      </section>

      {/* Development plan */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Career development plan</h2>
          <span className="text-xs text-slate-400">(min. {minGoals} goals)</span>
        </div>

        <div className="mt-4 space-y-4">
          {goals.map((g, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Labeled label={`Goal ${i + 1} — competency to develop`}>
                  <input className={input} value={g.competency} onChange={setGoal(i, 'competency')} disabled={!editable} placeholder="Skill / knowledge" />
                </Labeled>
                <Labeled label="Target date">
                  <input type="date" className={input} value={g.dueDate} onChange={setGoal(i, 'dueDate')} disabled={!editable} />
                </Labeled>
                <Labeled label="How will it be achieved?">
                  <input className={input} value={g.howAchieved} onChange={setGoal(i, 'howAchieved')} disabled={!editable} />
                </Labeled>
                <Labeled label="How will you know it’s done?">
                  <input className={input} value={g.evidence} onChange={setGoal(i, 'evidence')} disabled={!editable} />
                </Labeled>
              </div>
              {editable && (
                <div className="mt-2 flex justify-end">
                  <button onClick={() => removeGoal(i)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {goals.length === 0 && <p className="text-sm text-slate-400">No development goals yet.</p>}
        </div>

        {editable && (
          <button onClick={addGoal} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-emerald-300 hover:text-emerald-600">
            <Plus className="h-3.5 w-3.5" /> Add development goal
          </button>
        )}
      </section>

      {/* Mid-term / half-year self-assessment (appears once the plan is agreed and the stage is open) */}
      {(() => {
        const stageParam = stageParamFor(cycle.stage);
        if (!stageParam || !POST_AGREEMENT.includes(review.status)) return null;
        const shared = Boolean(review.sharedFlags?.[`${stageParam}Shared`]);
        return (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {stageParam === 'mid' ? 'Mid-term self-assessment' : 'Half-year self-assessment'}
              </h2>
              {shared && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Shared</span>}
            </div>
            <StageAssessment
              meta={meta}
              review={review}
              stageParam={stageParam}
              author="employee"
              editable={!shared}
              saveFn={(p) => performanceApi.saveMyAssessment(stageParam, p)}
              handoffFn={() => performanceApi.shareMyStage(stageParam)}
              handoffLabel="Share with manager"
              onUpdated={setReview}
            />
          </section>
        );
      })()}

      {/* Final rating (half-year only) */}
      {cycle.stage === 'half_year' && POST_AGREEMENT.includes(review.status) && (
        <FinalRatingPanel
          meta={meta}
          suggestion={review.suggestion}
          title="Your final rating"
          initialRating={review.employeeFinalRating}
          initialRationale={review.employeeFinalRationale}
          editable
          onSave={(rating, rationale) => performanceApi.setMyFinalRating(rating, rationale)}
          other={review.managerFinalRating ? { label: 'Manager', rating: review.managerFinalRating, rationale: review.managerFinalRationale } : null}
          onUpdated={setReview}
        />
      )}

      {editable && (
        <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            {planErrors.length === 0
              ? <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Ready to submit</span>
              : <span className="text-amber-600">{planErrors[0]}{planErrors.length > 1 ? ` (+${planErrors.length - 1} more)` : ''}</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={saveDraft} disabled={saving || submitting} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save draft'}
            </button>
            <button onClick={submit} disabled={submitting || saving || planErrors.length > 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit plan</>}
            </button>
          </div>
        </div>
      )}

      <HistoryList items={history} currentCycleId={cycle._id} />
    </div>
  );
}
