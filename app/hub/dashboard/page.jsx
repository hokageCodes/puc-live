'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CalendarDays, ClipboardList, ListChecks, Plane, ShieldCheck, SlidersHorizontal, Users,
} from 'lucide-react';
import { useHubAuth } from '../../../components/hub/HubAuthContext';
import { apiConfig, getHubAuthHeader, leaveApi } from '../../../utils/api';

const BASE = apiConfig.baseUrl.replace(/\/$/, '');

// The headline label for the person, by most-senior role.
function primaryRole(roles = []) {
  const r = roles.map((x) => String(x).toLowerCase());
  if (r.includes('admin')) return 'Administrator';
  if (r.includes('hr')) return 'HR';
  if (r.includes('cms')) return 'Content Manager';
  if (r.includes('linemanager')) return 'Line Manager';
  if (r.includes('teamlead')) return 'Team Lead';
  return 'Staff';
}

function StatCard({ icon: Icon, label, value, sub, href, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        {sub && <p className="truncate text-xs text-slate-400">{sub}</p>}
      </div>
      {href && <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" />}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function QuickLink({ icon: Icon, label, href }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
      <Icon className="h-5 w-5 text-emerald-600" />
      {label}
      <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
    </Link>
  );
}

export default function HubDashboardPage() {
  const { user, roles, hasAnyRole } = useHubAuth();
  const isManager = hasAnyRole(['admin', 'hr']);
  const isApprover = hasAnyRole(['teamLead', 'lineManager', 'hr', 'admin']);
  const firstName = user?.firstName || (user?.email ? user.email.split('@')[0] : 'there');
  const label = useMemo(() => primaryRole(roles), [roles]);

  const [balances, setBalances] = useState([]);
  const [pending, setPending] = useState([]);
  const [staffCount, setStaffCount] = useState(null);
  const [typesCount, setTypesCount] = useState(null);

  const loadCount = useCallback(async (path, setter) => {
    try {
      const res = await fetch(`${BASE}${path}`, { cache: 'no-store', credentials: 'include', headers: { ...getHubAuthHeader() } });
      if (!res.ok) return;
      const data = await res.json();
      setter(Array.isArray(data) ? data.length : null);
    } catch { /* ignore — dashboard tiles are best-effort */ }
  }, []);

  useEffect(() => {
    leaveApi.getMyBalances().then((d) => setBalances(Array.isArray(d) ? d : [])).catch(() => {});
    if (isApprover) leaveApi.getPendingApprovals().then((d) => setPending(Array.isArray(d) ? d : [])).catch(() => {});
    if (isManager) {
      loadCount('/api/staff', setStaffCount);
      loadCount('/api/leave-types', setTypesCount);
    }
  }, [isManager, isApprover, loadCount]);

  const leaveLeft = useMemo(
    () => balances.reduce((sum, b) => sum + Math.max((b.allocated || 0) + (b.carriedOver || 0) - (b.used || 0), 0), 0),
    [balances]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {firstName}</h1>
          <p className="text-sm text-slate-500">Here's what's happening in your workspace.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
          <ShieldCheck className="h-3.5 w-3.5" /> {label}
        </span>
      </div>

      {/* Manager / HR overview */}
      {isManager && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">HR overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={Users} label="Total staff" value={staffCount} sub="View & manage" href="/hub/staff" tone="blue" />
            <StatCard icon={ListChecks} label="Pending approvals" value={isApprover ? pending.length : '—'} sub="Awaiting review" href="/hub/leave/approvals" tone="amber" />
            <StatCard icon={SlidersHorizontal} label="Leave types" value={typesCount} sub="Configure" href="/hub/leave-types" tone="emerald" />
          </div>
        </section>
      )}

      {/* Approver (non-manager) — just their queue */}
      {isApprover && !isManager && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Your responsibilities</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard icon={ListChecks} label="Pending approvals" value={pending.length} sub="Awaiting your review" href="/hub/leave/approvals" tone="amber" />
          </div>
        </section>
      )}

      {/* Personal — everyone */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Your workspace</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Plane} label="Leave remaining" value={`${leaveLeft} days`} sub="Across all types" href="/hub/leave/dashboard" />
          <QuickLink icon={CalendarDays} label="Request leave" href="/hub/leave/request/new" />
          <QuickLink icon={ClipboardList} label="My requests" href="/hub/leave/requests" />
        </div>
      </section>
    </div>
  );
}
