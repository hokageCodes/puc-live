'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Check, FileText, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useHubAuth } from '../../../components/hub/HubAuthContext';
import { apiConfig } from '../../../utils/api';

const BASE = apiConfig.baseUrl.replace(/\/$/, '');
const EMPTY = {
  name: '', code: '', description: '', color: '#10b981', defaultDays: 0,
  applicableGender: 'all', isPaid: true, requiresDocument: false, isActive: true,
  minimumNotice: 0, maxConsecutiveDays: '',
};

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

function LeaveTypeModal({ initial, onClose, onSaved }) {
  const editing = Boolean(initial?._id);
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}), maxConsecutiveDays: initial?.maxConsecutiveDays ?? '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/leave-types${editing ? `/${initial._id}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, code: form.code, description: form.description, color: form.color,
          defaultDays: Number(form.defaultDays) || 0, applicableGender: form.applicableGender,
          isPaid: form.isPaid, requiresDocument: form.requiresDocument, isActive: form.isActive,
          minimumNotice: Number(form.minimumNotice) || 0,
          maxConsecutiveDays: form.maxConsecutiveDays === '' ? '' : Number(form.maxConsecutiveDays),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to save leave type.');
      toast.success(`Leave type ${editing ? 'updated' : 'created'}.`);
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="my-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit leave type' : 'New leave type'}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <Field label="Name *"><input className={input} value={form.name} onChange={set('name')} placeholder="Annual Leave" /></Field>
          <Field label="Code"><input className={input} value={form.code} onChange={set('code')} placeholder="ANNUAL" /></Field>
          <Field label="Annual allocation (days)"><input type="number" min="0" className={input} value={form.defaultDays} onChange={set('defaultDays')} /></Field>
          <Field label="Applies to (gender)" hint="Maternity → female, Paternity → male">
            <select className={input} value={form.applicableGender} onChange={set('applicableGender')}>
              <option value="all">Everyone</option>
              <option value="female">Female only</option>
              <option value="male">Male only</option>
            </select>
          </Field>
          <Field label="Min. notice (days)"><input type="number" min="0" className={input} value={form.minimumNotice} onChange={set('minimumNotice')} /></Field>
          <Field label="Max consecutive days" hint="Leave blank for no limit"><input type="number" min="0" className={input} value={form.maxConsecutiveDays} onChange={set('maxConsecutiveDays')} /></Field>
          <Field label="Colour"><input type="color" className="h-10 w-16 rounded-lg border border-slate-200" value={form.color} onChange={set('color')} /></Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea rows={2} className={input} value={form.description} onChange={set('description')} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isPaid} onChange={set('isPaid')} /> Paid leave</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.requiresDocument} onChange={set('requiresDocument')} /> Requires document</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active</label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create type'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LeaveTypesPage() {
  const { hasAnyRole } = useHubAuth();
  const allowed = hasAnyRole(['admin', 'hr']);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {} (new) | type (edit)

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/leave-types`, { cache: 'no-store', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load leave types.');
      setTypes(await res.json());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  const remove = async (type) => {
    if (!window.confirm(`Delete "${type.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${BASE}/api/leave-types/${type._id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete.');
      toast.success('Leave type deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!allowed) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">You don’t have access to leave-type management.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave types</h1>
          <p className="text-sm text-slate-500">Create and manage the leave types staff can request.</p>
        </div>
        <button onClick={() => setModal({})} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New type
        </button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {types.map((t) => {
            const accent = t.color && /^#([0-9a-f]{6})$/i.test(t.color) ? t.color : '#10b981';
            const tint = `${accent}1a`;
            const allocation = t.defaultDays ?? t.defaultAnnualAllocation ?? 0;
            const genderChip = t.applicableGender === 'female'
              ? { label: 'Female only', cls: 'bg-pink-50 text-pink-700 ring-pink-200' }
              : t.applicableGender === 'male'
              ? { label: 'Male only', cls: 'bg-blue-50 text-blue-700 ring-blue-200' }
              : null;
            return (
              <div
                key={t._id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${t.isActive ? 'border-slate-200' : 'border-slate-200 opacity-70'}`}
              >
                <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: tint, color: accent }}>
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-800">{t.name}</h3>
                      {t.code && <p className="text-xs uppercase tracking-wide text-slate-400">{t.code}</p>}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${t.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-slate-900">{allocation}</span>
                  <span className="text-sm text-slate-400">days / year</span>
                </div>

                {t.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.description}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {genderChip && <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${genderChip.cls}`}>{genderChip.label}</span>}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${t.isPaid ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-500 ring-slate-200'}`}>
                    {t.isPaid ? <><Check className="h-3 w-3" /> Paid</> : 'Unpaid'}
                  </span>
                  {t.requiresDocument && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                      <FileText className="h-3 w-3" /> Document
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => setModal(t)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => remove(t)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <button
            onClick={() => setModal({})}
            className="flex min-h-[11rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-emerald-100">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">New leave type</span>
          </button>
        </div>
      )}

      {modal && <LeaveTypeModal initial={modal._id ? modal : null} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}
