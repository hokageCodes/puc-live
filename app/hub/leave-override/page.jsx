'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Loader2, Pencil, Scale, Search, UserRound, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useHubAuth } from '../../../components/hub/HubAuthContext';
import { apiConfig } from '../../../utils/api';

const BASE = apiConfig.baseUrl.replace(/\/$/, '');
const initials = (s) => `${(s.firstName || '')[0] || ''}${(s.lastName || '')[0] || ''}`.toUpperCase() || '?';

function Stepper({ step, staffName }) {
  const steps = [
    { n: 1, label: 'Choose staff' },
    { n: 2, label: staffName ? `Override · ${staffName}` : 'Set balances' },
  ];
  return (
    <ol className="mt-4 flex items-center gap-3 text-sm">
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <li key={s.n} className="flex items-center gap-3">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              done ? 'bg-emerald-600 text-white' : active ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300' : 'bg-slate-100 text-slate-400'
            }`}>
              {done ? <Check className="h-4 w-4" /> : s.n}
            </span>
            <span className={`${active ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="h-px w-8 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}

function GenderChip({ gender }) {
  if (gender === 'female') return <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-700 ring-1 ring-inset ring-pink-200">Female</span>;
  if (gender === 'male') return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">Male</span>;
  return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">Gender not set</span>;
}

const numCls = 'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

function Stat({ label, value, strong }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-lg ${strong ? 'font-bold text-emerald-700' : 'font-semibold text-slate-800'}`}>{value}</p>
    </div>
  );
}

function BalanceCard({ staffId, row, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [allocated, setAllocated] = useState(row.allocated);
  const [carriedOver, setCarriedOver] = useState(row.carriedOver);
  const [used, setUsed] = useState(row.used);
  const [saving, setSaving] = useState(false);

  const startEdit = () => { setAllocated(row.allocated); setCarriedOver(row.carriedOver); setUsed(row.used); setEditing(true); };
  const liveRemaining = (Number(allocated) || 0) + (Number(carriedOver) || 0) - (Number(used) || 0);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/leave-admin/staff/${staffId}/balances/${row.type.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocated: Number(allocated) || 0, carriedOver: Number(carriedOver) || 0, used: Number(used) || 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to save.');
      toast.success(`${row.type.name} updated.`);
      setEditing(false);
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{row.type.name}</h3>
        {row.pending > 0 && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">{row.pending} pending</span>
        )}
      </div>

      {!editing ? (
        <>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Stat label="Allocated" value={row.allocated} />
            <Stat label="Carried" value={row.carriedOver} />
            <Stat label="Used" value={row.used} />
            <Stat label="Left" value={row.remaining} strong />
          </div>
          <button onClick={startEdit} className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
            <Pencil className="h-4 w-4" /> Override
          </button>
        </>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <label className="text-xs font-medium text-slate-500">Allocated<input type="number" min="0" className={`mt-1 ${numCls}`} value={allocated} onChange={(e) => setAllocated(e.target.value)} /></label>
            <label className="text-xs font-medium text-slate-500">Carried<input type="number" min="0" className={`mt-1 ${numCls}`} value={carriedOver} onChange={(e) => setCarriedOver(e.target.value)} /></label>
            <label className="text-xs font-medium text-slate-500">Used<input type="number" min="0" className={`mt-1 ${numCls}`} value={used} onChange={(e) => setUsed(e.target.value)} /></label>
          </div>
          <p className="mt-3 text-sm text-slate-500">Remaining will be <span className="font-bold text-emerald-700">{liveRemaining}</span> days</p>
          <div className="mt-3 flex gap-2">
            <button onClick={save} disabled={saving} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
          </div>
        </>
      )}
    </div>
  );
}

export default function LeaveOverridePage() {
  const { hasAnyRole } = useHubAuth();
  const allowed = hasAnyRole(['admin', 'hr']);

  const [staff, setStaff] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/staff`, { cache: 'no-store', credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load staff.');
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [allowed]);

  const loadDetail = useCallback(async (id) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${BASE}/api/leave-admin/staff/${id}/balances`, { cache: 'no-store', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load balances.');
      setDetail(await res.json());
    } catch (err) {
      toast.error(err.message);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const pick = (s) => { setSelected(s); setDetail(null); loadDetail(s._id); };
  const reset = () => { setSelected(null); setDetail(null); };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...staff].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    if (!q) return list;
    return list.filter((s) => `${s.firstName} ${s.lastName} ${s.email} ${s.staffCode || ''}`.toLowerCase().includes(q));
  }, [staff, query]);

  const step = selected ? 2 : 1;

  if (!allowed) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">You don’t have access to leave overrides.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Scale className="h-5 w-5" /></span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Override</h1>
          <p className="text-sm text-slate-500">Manually set a staff member’s leave counts for the current year.</p>
        </div>
      </div>

      <Stepper step={step} staffName={selected ? `${selected.firstName} ${selected.lastName}` : ''} />

      {/* STEP 1 — Who */}
      {step === 1 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:max-w-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff by name, code, email…" className="w-full text-sm focus:outline-none" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s) => (
              <button key={s._id} onClick={() => pick(s)}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">{initials(s)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-800">{s.firstName} {s.lastName}</span>
                  <span className="block truncate text-xs text-slate-400">{s.staffCode || s.email}</span>
                  <span className="mt-1 inline-block"><GenderChip gender={s.gender} /></span>
                </span>
              </button>
            ))}
            {filtered.length === 0 && <p className="col-span-full py-10 text-center text-sm text-slate-400">No staff found.</p>}
          </div>
        </div>
      )}

      {/* STEP 2 — What */}
      {step === 2 && (
        <div className="mt-6">
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Choose another staff
          </button>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-base font-bold text-emerald-700">{initials(selected)}</span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">{selected.firstName} {selected.lastName}</p>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <UserRound className="h-3.5 w-3.5" /> {selected.staffCode || selected.email}
                {detail && <>· {detail.period}</>}
                <GenderChip gender={selected.gender} />
              </p>
            </div>
          </div>

          {loadingDetail ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />)}
            </div>
          ) : detail && detail.balances.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detail.balances.map((row) => (
                <BalanceCard key={row.type.id} staffId={selected._id} row={row} onSaved={() => loadDetail(selected._id)} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">No applicable leave types for this staff member.</p>
          )}
        </div>
      )}
    </div>
  );
}
