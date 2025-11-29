'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';
import { leaveApi } from '../../../utils/api';

const statusBadge = (status) => {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-700';
  if (status === 'rejected') return 'bg-red-100 text-red-700';
  if (status.startsWith('pending_')) {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-slate-200 text-slate-600';
};

function formatStatus(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Declined';
  if (status.startsWith('pending_')) {
    const role = status.replace('pending_', '');
    return `Pending ${role === 'teamlead' ? 'Team Lead' : role === 'linemanager' ? 'Line Manager' : 'HR'}`;
  }
  return status;
}

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

function getCurrentApprover(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Declined';
  if (status.startsWith('pending_')) {
    const role = status.replace('pending_', '');
    return role === 'teamlead' ? 'Team Lead' : role === 'linemanager' ? 'Line Manager' : 'HR Operations';
  }
  return 'Pending';
}

export default function LeaveRequestsClient() {
  const { token, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = status === 'loading' || status === 'authenticating' || loading;

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await leaveApi.getMyRequests(token);
        setRequests(data || []);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load your leave requests. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated, token]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Loading your request history…
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
          {requests.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No leave requests yet. <Link href="/leave/request/new" className="font-semibold text-emerald-600 hover:underline">Submit your first request</Link> to get started.
            </div>
          ) : (
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
                  <tr key={request._id} className="hover:bg-emerald-50/30">
                    <td className="px-4 py-3 text-slate-800">{request.leaveType?.name || 'Leave'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateRange(request.startDate, request.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                          request.status
                        )}`}
                      >
                        {formatStatus(request.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {getCurrentApprover(request.status)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(request.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
