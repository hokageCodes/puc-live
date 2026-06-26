'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Final-rating panel (half-year). The rating is chosen MANUALLY; the suggested
 * score from the 60/40 weighting is shown alongside as guidance only (D1).
 *
 * Props:
 *  - meta, suggestion           metadata + computed { band, weighted, ... } | null
 *  - title                      panel heading
 *  - initialRating/Rationale    existing values
 *  - editable                   whether this viewer may set it
 *  - onSave(rating, rationale)  resolves to the updated review
 *  - other                      { label, rating, rationale } | null (read-only)
 *  - onUpdated(review)
 */
const sel =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

export default function FinalRatingPanel({ meta, suggestion, title, initialRating, initialRationale, editable, onSave, other, onUpdated }) {
  const [rating, setRating] = useState(initialRating || '');
  const [rationale, setRationale] = useState(initialRationale || '');
  const [saving, setSaving] = useState(false);
  const finals = meta?.finalRatings || [];
  const maxChars = meta?.charLimits?.FINAL_RATIONALE || 3500;

  const save = async () => {
    if (!rating) { toast.error('Please choose a final rating.'); return; }
    setSaving(true);
    try {
      const updated = await onSave(rating, rationale);
      onUpdated?.(updated);
      toast.success('Final rating saved.');
    } catch (err) {
      toast.error(err?.message || 'Failed to save the rating.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h2>

      {suggestion ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          <Sparkles className="h-4 w-4" />
          Suggested: <b>{suggestion.band}</b>
          <span className="text-indigo-400">(weighted {suggestion.weighted} · 60% objectives / 40% behaviours — guidance only)</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-400">Complete the half-year assessment to see a suggested score.</p>
      )}

      <div className="mt-4 grid gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Final rating</span>
          <select className={sel} value={rating} onChange={(e) => setRating(e.target.value)} disabled={!editable}>
            <option value="">Select a rating…</option>
            {finals.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rationale</span>
          <textarea rows={4} className={sel} value={rationale} onChange={(e) => setRationale(e.target.value.slice(0, maxChars))} disabled={!editable} placeholder="Explain the rating…" />
          <span className="text-[11px] text-slate-400">{rationale.length}/{maxChars}</span>
        </label>
      </div>

      {other && (other.rating || other.rationale) ? (
        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{other.label}</span>
          {other.rating ? <span className="ml-2 font-semibold text-slate-700">{other.rating}</span> : null}
          {other.rationale ? <div className="mt-0.5 whitespace-pre-wrap text-slate-500">{other.rationale}</div> : null}
        </div>
      ) : null}

      {editable && (
        <div className="mt-4 flex justify-end">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save final rating'}
          </button>
        </div>
      )}
    </section>
  );
}
