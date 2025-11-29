'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState, Fragment } from 'react';
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
  const [expanded, setExpanded] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'list' (mobile)

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
        {/* Controls: allow mobile users to switch to a list/card view */}
        <div className="mt-4 mb-3 sm:hidden flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${viewMode === 'table' ? 'bg-[#014634] text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${viewMode === 'list' ? 'bg-[#014634] text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>

        {/* Table container: allow horizontal swipe on small screens */}
        <div className="mt-5 rounded-xl border border-slate-200" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
          {requests.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No leave requests yet. <Link href="/leave/request/new" className="font-semibold text-emerald-600 hover:underline">Submit your first request</Link> to get started.
            </div>
          ) : viewMode === 'table' ? (
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
                  <Fragment key={request._id}>
                    <tr className="hover:bg-emerald-50/30">
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
                      <td className="px-4 py-3 text-right">
                        <button
                          className="text-xs font-semibold text-emerald-600 hover:underline"
                          onClick={() => setExpanded((s) => ({ ...s, [request._id]: !s[request._id] }))}
                        >
                          {expanded[request._id] ? 'Hide chain' : 'View chain'}
                        </button>
                      </td>
                    </tr>

                    {expanded[request._id] && (
                      <tr key={`${request._id}-chain`} className="bg-slate-50">
                        <td colSpan={6} className="px-6 py-4 text-sm text-slate-700">
                          <div className="space-y-2">
                            {(request.approverChain || []).map((step, i) => {
                              const stepKey = step.assignee && (step.assignee._id || step.assignee)
                                ? (step.assignee._id ? step.assignee._id : step.assignee)
                                : `${request._id}-step-${i}`;

                              return (
                                <div key={stepKey} className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2">
                                  <div>
                                    <div className="text-xs font-semibold uppercase text-slate-500">Step {i + 1} · {step.role === 'teamLead' ? 'Team Lead' : step.role === 'lineManager' ? 'Line Manager' : 'HR'}</div>
                                    <div className="text-sm font-medium text-slate-900">
                                      {step.assignee ? (step.assignee.firstName ? `${step.assignee.firstName} ${step.assignee.lastName}` : step.assignee) : 'Unassigned'}
                                    </div>
                                    <div className="text-xs text-slate-500">Status: {step.status}</div>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {step.actedAt ? new Date(step.actedAt).toLocaleString() : ''}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
              </table>
            ) : (
              <div className="space-y-3 px-4 py-2">
                {requests.map((request) => (
                  <div key={request._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{request.leaveType?.name || 'Leave'}</div>
                        <div className="text-xs text-slate-500">{formatDateRange(request.startDate, request.endDate)}</div>
                        <div className="mt-2 text-xs text-slate-500">{request.reason || ''}</div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(request.status)}`}>{formatStatus(request.status)}</div>
                        <div className="text-xs text-slate-400 mt-2">{new Date(request.createdAt).toLocaleDateString()}</div>
                        <div className="mt-2">
                          <button
                            className="text-xs font-semibold text-emerald-600 hover:underline"
                            onClick={() => setExpanded((s) => ({ ...s, [request._id]: !s[request._id] }))}
                          >
                            {expanded[request._id] ? 'Hide chain' : 'View chain'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {expanded[request._id] && (
                      <div className="mt-3 border-t pt-3 text-sm text-slate-700">
                        {(request.approverChain || []).map((step, i) => (
                          <div key={i} className="mb-2">
                            <div className="text-xs text-slate-500">Step {i + 1} · {step.role === 'teamLead' ? 'Team Lead' : step.role === 'lineManager' ? 'Line Manager' : 'HR'}</div>
                            <div className="text-sm font-medium text-slate-900">{step.assignee ? (step.assignee.firstName ? `${step.assignee.firstName} ${step.assignee.lastName}` : step.assignee) : 'Unassigned'}</div>
                            <div className="text-xs text-slate-500">Status: {step.status} {step.actedAt ? `· ${new Date(step.actedAt).toLocaleString()}` : ''}</div>
                            {step.comment ? <div className="mt-1 text-xs text-slate-500">Note: {step.comment}</div> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
