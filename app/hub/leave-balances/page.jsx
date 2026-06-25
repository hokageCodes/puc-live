'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useHubAuth } from '../../../components/hub/HubAuthContext';
import { apiConfig } from '../../../utils/api';

const BASE = apiConfig.baseUrl.replace(/\/$/, '');
const input = 'w-20 rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

function BalanceRow({ staffId, row, onSaved }) {
  const [allocated, setAllocated] = useState(row.allocated);
  const [carriedOver, setCarriedOver] = useState(row.carriedOver);
  const [used, setUsed] = useState(row.used);
  const [saving, setSaving] = useState(false);

  const remaining = (Number(allocated) || 0) + (Number(carriedOver) || 0) - (Number(used) || 0);
  const dirty = allocated !== row.allocated || carriedOver !== row.carriedOver || used !== row.used;

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
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-4 py-3 font-medium text-slate-800">{row.type.name}</td>
      <td className="px-3 py-3"><input type="number" min="0" className={input} value={allocated} onChange={(e) => setAllocated(e.target.value)} /></td>
      <td className="px-3 py-3"><input type="number" min="0" className={input} value={carriedOver} onChange={(e) => setCarriedOver(e.target.value)} /></td>
      <td className="px-3 py-3"><input type="number" min="0" className={input} value={used} onChange={(e) => setUsed(e.target.value)} /></td>
      <td className="px-3 py-3 text-slate-500">{row.pending}</td>
      <td className="px-3 py-3 font-semibold text-slate-800">{remaining}</td>
      <td className="px-3 py-3 text-right">
        <button onClick={save} disabled={!dirty || saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
        </button>
      </td>
    </tr>
  );
}

export default function LeaveBalancesPage() {
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

  const pick = (s) => { setSelected(s); loadDetail(s._id); };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...staff].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    if (!q) return list;
    return list.filter((s) => `${s.firstName} ${s.lastName} ${s.email} ${s.staffCode || ''}`.toLowerCase().includes(q));
  }, [staff, query]);

  if (!allowed) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">You don’t have access to leave-balance management.</div>;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Leave balances</h1>
        <p className="text-sm text-slate-500">Manually set or override a staff member’s leave counts (current year).</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem,1fr]">
        {/* Staff list */}
        <aside className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff…" className="w-full text-sm focus:outline-none" />
            </div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.map((s) => {
              const active = selected?._id === s._id;
              return (
                <li key={s._id}>
                  <button onClick={() => pick(s)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <span className="block font-medium">{s.firstName} {s.lastName}</span>
                    <span className="block text-xs text-slate-400">{s.staffCode || s.email}{s.gender ? ` · ${s.gender}` : ' · gender not set'}</span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-400">No staff found.</li>}
          </ul>
        </aside>

        {/* Detail */}
        <section className="rounded-xl border border-slate-200 bg-white">
          {!selected ? (
            <div className="p-10 text-center text-sm text-slate-400">Select a staff member to view and edit balances.</div>
          ) : loadingDetail ? (
            <div className="p-10 text-center text-sm text-slate-400">Loading balances…</div>
          ) : detail ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-800">{detail.staff.name}</h2>
                  <p className="text-xs text-slate-400">{detail.staff.email} · {detail.period}{detail.staff.gender ? ` · ${detail.staff.gender}` : ''}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Leave type</th>
                      <th className="px-3 py-3 text-left font-semibold">Allocated</th>
                      <th className="px-3 py-3 text-left font-semibold">Carried over</th>
                      <th className="px-3 py-3 text-left font-semibold">Used</th>
                      <th className="px-3 py-3 text-left font-semibold">Pending</th>
                      <th className="px-3 py-3 text-left font-semibold">Remaining</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.balances.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No applicable leave types.</td></tr>
                    ) : (
                      detail.balances.map((row) => (
                        <BalanceRow key={row.type.id} staffId={selected._id} row={row} onSaved={() => loadDetail(selected._id)} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 text-xs text-slate-400">Pending reflects in-flight requests and is managed automatically. Editing Used/Allocated overrides the stored counts.</p>
            </>
          ) : (
            <div className="p-10 text-center text-sm text-rose-500">Could not load balances.</div>
          )}
        </section>
      </div>
    </div>
  );
}
