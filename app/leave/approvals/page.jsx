'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';
import { leaveApi } from '../../../utils/api';

const isApprover = (roles) =>
  Array.isArray(roles) &&
  roles.some((role) => ['teamLead', 'lineManager', 'hr'].includes(role));

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (start.getTime() === end.getTime()) {
    return startStr;
  }
  return `${startStr} – ${endStr}`;
}

function formatStatus(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Declined';
  if (status.startsWith('pending_')) {
    const role = status.replace('pending_', '');
    return `Awaiting ${role === 'teamlead' ? 'Team Lead' : role === 'linemanager' ? 'Line Manager' : 'HR'}`;
  }
  return status;
}

function getTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function LeaveApprovalsPage() {
  const { user, token, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const approver = useMemo(() => isApprover(user?.roles), [user?.roles]);
  const isLoading = status === 'loading' || status === 'authenticating' || loading;

  useEffect(() => {
    if (!isAuthenticated || !token || !approver) {
      setLoading(false);
      return;
    }

    const fetchApprovals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await leaveApi.getPendingApprovals(token);
        setApprovals(data || []);
      } catch (err) {
        console.error('Error fetching approvals:', err);
        setError('Failed to load pending approvals. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [isAuthenticated, token, approver]);

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

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
          {error}
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
          {approvals.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No pending approvals at this time. All caught up! 🎉
            </div>
          ) : (
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
                {approvals.map((request) => {
                  const staffName = request.staff
                    ? `${request.staff.firstName || ''} ${request.staff.lastName || ''}`.trim()
                    : 'Unknown';
                  return (
                    <tr key={request._id} className="hover:bg-emerald-50/30">
                      <td className="px-4 py-3 text-slate-800">{staffName}</td>
                      <td className="px-4 py-3 text-slate-600">{request.leaveType?.name || 'Leave'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateRange(request.startDate, request.endDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {request.coveragePlan || 'Pending handover'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {getTimeAgo(request.createdAt || request.timeline?.[0]?.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatStatus(request.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
