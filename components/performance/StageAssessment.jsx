'use client';

import { useMemo, useState } from 'react';
import { Loader2, Lock, Send } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Reusable mid/half assessment grid — used by both the employee (My Performance)
 * and the manager (review detail) sides. Renders each objective + behaviour with
 * an editable status/rating + comments for THIS author, and shows the other side's
 * entry read-only when the backend has made it visible (D6).
 *
 * Props:
 *  - meta            performance metadata (enums)
 *  - review          the (visibility-filtered) review
 *  - stageParam      'mid' | 'half'
 *  - author          'employee' | 'manager'
 *  - editable        whether this author may still edit (pre share/return)
 *  - saveFn(payload) persists the assessment, resolves to the updated review
 *  - handoffFn()     share (employee) or return (manager); resolves to updated review
 *  - handoffLabel    button label, e.g. 'Share with manager'
 *  - onUpdated(rev)  called with the updated review after save/handoff
 */
const findEntry = (entries, stage, who) => (entries || []).find((e) => e.stage === stage && e.author === who);

const sel =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

export default function StageAssessment({ meta, review, stageParam, author, editable, saveFn, handoffFn, handoffLabel, onUpdated }) {
  const otherAuthor = author === 'employee' ? 'manager' : 'employee';
  const objStatuses = meta?.objectiveStatus?.[stageParam] || [];
  const behRatings = meta?.behaviourRatings || [];

  const [objInputs, setObjInputs] = useState(() =>
    (review.objectives || []).map((o) => {
      const e = findEntry(o.entries, stageParam, author);
      return { status: e?.status || '', comments: e?.comments || '' };
    })
  );
  const [behInputs, setBehInputs] = useState(() =>
    (review.behaviours || []).map((b) => {
      const e = findEntry(b.entries, stageParam, author);
      return { rating: e?.rating || '', comments: e?.comments || '' };
    })
  );
  const [saving, setSaving] = useState(false);
  const [handing, setHanding] = useState(false);

  const payload = useMemo(() => ({ objectives: objInputs, behaviours: behInputs }), [objInputs, behInputs]);

  const setObj = (i, k, v) => setObjInputs((a) => a.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
  const setBeh = (i, k, v) => setBehInputs((a) => a.map((b, j) => (j === i ? { ...b, [k]: v } : b)));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await saveFn(payload);
      onUpdated?.(updated);
      toast.success('Assessment saved.');
    } catch (err) {
      toast.error(err?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handoff = async () => {
    const verb = author === 'employee' ? 'share this with your manager' : 'return this to the employee';
    if (!window.confirm(`Save and ${verb}? You won’t be able to edit afterwards.`)) return;
    setHanding(true);
    try {
      await saveFn(payload); // persist latest edits first
      const updated = await handoffFn();
      onUpdated?.(updated);
      toast.success(author === 'employee' ? 'Shared with your manager.' : 'Returned to the employee.');
    } catch (err) {
      toast.error(err?.message || 'Failed to complete the hand-off.');
    } finally {
      setHanding(false);
    }
  };

  const OtherEntry = ({ entries, kind }) => {
    const e = findEntry(entries, stageParam, otherAuthor);
    if (!e) return null;
    return (
      <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span className="font-semibold uppercase tracking-wide text-slate-400">{otherAuthor}</span>{' '}
        {kind === 'objective' ? e.status : e.rating}
        {e.comments ? <div className="mt-0.5 whitespace-pre-wrap text-slate-500">{e.comments}</div> : null}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {!editable && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5" /> This assessment is locked (already {author === 'employee' ? 'shared' : 'returned'}).
        </div>
      )}

      {/* Objectives */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Objectives</h3>
        {(review.objectives || []).map((o, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-slate-800">{o.performanceArea || `Objective ${i + 1}`}</span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{o.weighting || 0}%</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
              <select className={sel} value={objInputs[i]?.status || ''} onChange={(e) => setObj(i, 'status', e.target.value)} disabled={!editable}>
                <option value="">Select status…</option>
                {objStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea rows={2} className={sel} placeholder="Comments / evidence" value={objInputs[i]?.comments || ''} onChange={(e) => setObj(i, 'comments', e.target.value.slice(0, meta?.charLimits?.OBJECTIVE_COMMENT || 750))} disabled={!editable} />
            </div>
            <OtherEntry entries={o.entries} kind="objective" />
          </div>
        ))}
      </div>

      {/* Behaviours */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Behaviours</h3>
        {(review.behaviours || []).map((b, i) => (
          <div key={b.key || i} className="rounded-xl border border-slate-200 p-4">
            <div className="font-medium capitalize text-slate-800">{b.key}</div>
            {b.statement && <p className="text-xs italic text-slate-400">“{b.statement}”</p>}
            <div className="mt-3 grid gap-3 sm:grid-cols-[260px_1fr]">
              <select className={sel} value={behInputs[i]?.rating || ''} onChange={(e) => setBeh(i, 'rating', e.target.value)} disabled={!editable}>
                <option value="">Select rating…</option>
                {behRatings.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <textarea rows={2} className={sel} placeholder="Comments / evidence" value={behInputs[i]?.comments || ''} onChange={(e) => setBeh(i, 'comments', e.target.value.slice(0, meta?.charLimits?.BEHAVIOUR_COMMENT || 740))} disabled={!editable} />
            </div>
            <OtherEntry entries={b.entries} kind="behaviour" />
          </div>
        ))}
      </div>

      {editable && (
        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={save} disabled={saving || handing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save'}
          </button>
          <button onClick={handoff} disabled={handing || saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {handing ? <><Loader2 className="h-4 w-4 animate-spin" /> Working…</> : <><Send className="h-4 w-4" /> {handoffLabel}</>}
          </button>
        </div>
      )}
    </div>
  );
}
