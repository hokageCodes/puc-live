'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext.jsx';

// Force dynamic rendering since this page uses client-side auth hooks
export const dynamic = 'force-dynamic';

const MOCK_REQUESTS = [
  {
    id: 'req-210',
    type: 'Annual Leave',
    dates: '12 – 16 Aug 2025',
    status: 'Approved',
    approver: 'HR Operations',
    submitted: '07 Jul 2025',
  },
  {
    id: 'req-211',
    type: 'Sick Leave',
    dates: '30 Jul 2025',
    status: 'Pending HR',
    approver: 'HR Operations',
    submitted: '29 Jul 2025',
  },
  {
    id: 'req-189',
    type: 'Compassionate Leave',
    dates: '04 – 05 Jun 2025',
    status: 'Declined',
    approver: 'Line Manager',
    submitted: '28 May 2025',
  },
];

const statusBadge = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-100 text-emerald-700';
    case 'Pending HR':
    case 'Pending Team Lead':
      return 'bg-amber-100 text-amber-700';
    case 'Declined':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-200 text-slate-600';
  }
};

export default function LeaveRequestsPage() {
  const { status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();

  const isLoading = status === 'loading' || status === 'authenticating';
  const requests = useMemo(() => MOCK_REQUESTS, []);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Loading your request history…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Requests</p>
        <h1 className="text-2xl font-semibold text-slate-900">My leave history</h1>
        <p className="text-sm text-slate-600">
          A consolidated view of your submitted requests. Detailed filtering and exports coming soon.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Recent activity
          </h2>
          <Link
            href="/leave/request/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Book new leave
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Leave</th>
                <th className="px-4 py-3 text-left font-semibold">Dates</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Current approver</th>
                <th className="px-4 py-3 text-left font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-emerald-50/30">
                  <td className="px-4 py-3 text-slate-800">{request.type}</td>
                  <td className="px-4 py-3 text-slate-600">{request.dates}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{request.approver}</td>
                  <td className="px-4 py-3 text-slate-500">{request.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-sm text-slate-600">
        Enhanced filtering, CSV exports, and per-request drilldowns will arrive with the data backend.
      </section>
    </div>
  );
}

