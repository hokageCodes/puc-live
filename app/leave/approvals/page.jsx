'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';

const MOCK_APPROVAL_QUEUE = [
  {
    id: 'req-220',
    staff: 'Chidinma Nwosu',
    type: 'Annual Leave',
    dates: '19 – 23 Aug 2025',
    submitted: '2h ago',
    stage: 'Awaiting Line Manager',
    coverage: 'Handover to Samuel',
  },
  {
    id: 'req-221',
    staff: 'Ibrahim Bello',
    type: 'Sick Leave',
    dates: '05 Aug 2025',
    submitted: '4h ago',
    stage: 'Awaiting Team Lead',
    coverage: 'Pending handover',
  },
];

const isApprover = (roles) =>
  Array.isArray(roles) &&
  roles.some((role) => ['teamLead', 'lineManager', 'hr'].includes(role));

export default function LeaveApprovalsPage() {
  const { user, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();

  const approver = useMemo(() => isApprover(user?.roles), [user?.roles]);
  const isLoading = status === 'loading' || status === 'authenticating';

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Loading approval workspace…
        </div>
      </div>
    );
  }

  if (!approver) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">No approval access</h1>
        <p className="mt-2 text-sm text-slate-600">
          This area is reserved for team leads, line managers, and HR. If you believe you should have access,
          contact HR operations.
        </p>
        <div className="mt-4 text-sm text-slate-500">
          <a href="mailto:hr@paulusoro.com" className="font-medium text-emerald-600 hover:underline">
            hr@paulusoro.com
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Approvals</p>
        <h1 className="text-2xl font-semibold text-slate-900">Team queue</h1>
        <p className="text-sm text-slate-600">
          Review and action the leave requests waiting on you. Full workflow controls coming soon.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Awaiting your decision
          </h2>
          <Link
            href="/leave/calendar"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-500"
          >
            View calendar impact
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Staff</th>
                <th className="px-4 py-3 text-left font-semibold">Leave</th>
                <th className="px-4 py-3 text-left font-semibold">Dates</th>
                <th className="px-4 py-3 text-left font-semibold">Coverage</th>
                <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                <th className="px-4 py-3 text-left font-semibold">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_APPROVAL_QUEUE.map((request) => (
                <tr key={request.id} className="hover:bg-emerald-50/30">
                  <td className="px-4 py-3 text-slate-800">{request.staff}</td>
                  <td className="px-4 py-3 text-slate-600">{request.type}</td>
                  <td className="px-4 py-3 text-slate-600">{request.dates}</td>
                  <td className="px-4 py-3 text-slate-500">{request.coverage}</td>
                  <td className="px-4 py-3 text-slate-500">{request.submitted}</td>
                  <td className="px-4 py-3 text-slate-600">{request.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-sm text-slate-600">
        Approve / decline actions, delegation, and notification settings will slot in once backend endpoints are ready.
      </section>
    </div>
  );
}

