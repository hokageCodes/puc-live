'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarRange, ChevronRight, Download, Lock, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useHubAuth } from '../../../../components/hub/HubAuthContext';
import { performanceApi, getHubAuthHeader } from '../../../../utils/api';

const STAGE_META = {
  planning: { label: 'Planning', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  mid_term: { label: 'Mid-term review', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  half_year: { label: 'Half-year review', cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
  moderation: { label: 'Moderation', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

const STAGE_ORDER = ['planning', 'mid_term', 'half_year', 'moderation', 'closed'];
const nextStageLabel = (stage) => {
  const i = STAGE_ORDER.indexOf(stage);
  if (i < 0 || i >= STAGE_ORDER.length - 1) return null;
  return STAGE_META[STAGE_ORDER[i + 1]].label;
};

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

function NewCycleModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    label: '',
    planningOpensAt: '',
    midTermOpensAt: '',
    halfYearOpensAt: '',
    moderationOpensAt: '',
    closesAt: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error('A cycle label is required (e.g. "H1 2026").');
      return;
    }
    setSaving(true);
    try {
      // Only send fields that were filled in.
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => String(v).trim() !== ''));
      payload.label = form.label.trim();
      await performanceApi.createCycle(payload);
      toast.success('Cycle created.');
      onSaved();
    } catch (err) {
      toast.error(err?.message || 'Failed to create the cycle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form onSubmit={submit} className="my-8 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">New performance cycle</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Label *" hint='e.g. "H1 2026" or "2026 Annual"'>
              <input className={input} value={form.label} onChange={set('label')} placeholder="H1 2026" />
            </Field>
          </div>
          <Field label="Planning opens"><input type="date" className={input} value={form.planningOpensAt} onChange={set('planningOpensAt')} /></Field>
          <Field label="Mid-term opens"><input type="date" className={input} value={form.midTermOpensAt} onChange={set('midTermOpensAt')} /></Field>
          <Field label="Half-year opens"><input type="date" className={input} value={form.halfYearOpensAt} onChange={set('halfYearOpensAt')} /></Field>
          <Field label="Moderation opens"><input type="date" className={input} value={form.moderationOpensAt} onChange={set('moderationOpensAt')} /></Field>
          <Field label="Closes"><input type="date" className={input} value={form.closesAt} onChange={set('closesAt')} /></Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">
            {saving ? 'Creating…' : 'Create cycle'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PerformanceCyclesPage() {
  const { hasAnyRole } = useHubAuth();
  const allowed = hasAnyRole(['admin', 'hr']);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCycles(await performanceApi.listCycles());
    } catch (err) {
      toast.error(err?.message || 'Failed to load cycles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  const advance = async (cycle) => {
    const next = nextStageLabel(cycle.stage);
    if (!next) return;
    if (!window.confirm(`Advance "${cycle.label}" to ${next}? Participants in scope will be notified.`)) return;
    try {
      setBusyId(cycle._id);
      await performanceApi.advanceCycle(cycle._id);
      toast.success(`Advanced to ${next}.`);
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to advance the cycle.');
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = async (cycle) => {
    try {
      const res = await fetch(performanceApi.exportCycleUrl(cycle._id), { headers: { ...getHubAuthHeader() }, credentials: 'include' });
      if (!res.ok) throw new Error('Export failed.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-${(cycle.label || 'cycle').replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.message || 'Failed to export.');
    }
  };

  const close = async (cycle) => {
    if (!window.confirm(`Close "${cycle.label}"? This freezes all further edits on its reviews.`)) return;
    try {
      setBusyId(cycle._id);
      await performanceApi.closeCycle(cycle._id);
      toast.success('Cycle closed.');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to close the cycle.');
    } finally {
      setBusyId(null);
    }
  };

  if (!allowed) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        You don’t have access to performance-cycle administration.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Performance cycles</h1>
          <p className="text-sm text-slate-500">Open an appraisal round, advance it through each stage, and close it.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New cycle
        </button>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />)}
        </div>
      ) : cycles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
          <CalendarRange className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No cycles yet.</p>
          <p className="text-xs text-slate-400">Create your first cycle (e.g. “H1 2026”) to get started.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {cycles.map((c) => {
            const meta = STAGE_META[c.stage] || STAGE_META.planning;
            const next = nextStageLabel(c.stage);
            const p = c.progress || { total: 0, agreed: 0, closed: 0 };
            const isBusy = busyId === c._id;
            return (
              <div key={c._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-lg font-semibold text-slate-800">{c.label}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.cls}`}>{meta.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.total > 0
                      ? <><b className="font-semibold text-slate-700">{p.agreed}</b>/{p.total} plans agreed · {p.closed} closed</>
                      : 'No reviews yet'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => exportCsv(c)}
                    disabled={isBusy}
                    title="Export CSV"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                  {next ? (
                    <button
                      onClick={() => advance(c)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Advance to {next} <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                      <Lock className="h-3.5 w-3.5" /> Closed
                    </span>
                  )}
                  {c.stage !== 'closed' && (
                    <button
                      onClick={() => close(c)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && <NewCycleModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />}
    </div>
  );
}
