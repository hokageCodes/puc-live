'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';
import { leaveApi } from '../../../utils/api';
import { toast } from 'react-toastify';

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
  const [actionLoading, setActionLoading] = useState({});

  const approver = useMemo(() => isApprover(user?.roles), [user?.roles]);
  const isLoading = status === 'loading' || status === 'authenticating' || loading;

  // Debug: surface current auth/approver state in console to help diagnose missing CTAs
  useEffect(() => {
    try {
      console.debug('[Approvals] auth state:', { user, token: !!token, approver });
    } catch (e) {
      // ignore
    }
  }, [user, token, approver]);

  const fetchApprovals = async () => {
    if (!isAuthenticated || !token || !approver) {
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  const pendingStep = (request.approverChain || []).find((s) => s.status === 'pending');
                  // Normalize assignee id whether the approverChain was populated or not
                  const assigneeId = pendingStep?.assignee
                    ? pendingStep.assignee._id
                      ? pendingStep.assignee._id.toString()
                      : pendingStep.assignee.toString()
                    : null;

                  // Allow action if the current user is the assignee OR
                  // if their role matches the pending step (fallback UX). The backend still enforces authorization.
                  const roleMatchFallback = (pendingStep?.role === 'hr' && (user?.roles || []).includes('hr')) ||
                    (pendingStep?.role === 'teamLead' && (user?.roles || []).includes('teamLead')) ||
                    (pendingStep?.role === 'lineManager' && (user?.roles || []).includes('lineManager'));

                  const canAct = Boolean(
                    pendingStep &&
                      ((assigneeId && assigneeId === user?.id) || roleMatchFallback)
                  );

                  // Debug per-row: show pending step and computed permission
                  try {
                    console.debug('[Approvals] row:', { requestId: request._id, pendingStep, assigneeId, canAct, userId: user?.id, userRoles: user?.roles });
                  } catch (e) {
                    // ignore
                  }
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
                      <td className="px-4 py-3 text-right">
                        {canAct ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              disabled={Boolean(actionLoading[request._id])}
                              onClick={async () => {
                                  if (actionLoading[request._id]) return; // guard against double clicks
                                  console.log('Approve clicked for', request._id);
                                  if (!token) {
                                    window.alert('Unable to approve: not authenticated');
                                    return;
                                  }
                                  // Set loading state immediately and mark as approve
                                  setActionLoading((s) => ({ ...s, [request._id]: 'approve' }));
                                  const comment = window.prompt('Optional note for approval (press OK to confirm)');
                                  if (comment === null) {
                                    // cancelled by user — clear loading
                                    setActionLoading((s) => { const c = { ...s }; delete c[request._id]; return c; });
                                    return; // cancelled
                                  }
                                  try {
                                    await leaveApi.approveRequest(token, request._id, comment || undefined);
                                    if (typeof toast?.success === 'function') toast.success('Request approved'); else window.alert('Request approved');
                                    // refresh list
                                    await fetchApprovals();
                                  } catch (err) {
                                    console.error('Approve error:', err);
                                    if (typeof toast?.error === 'function') toast.error(err?.message || 'Failed to approve'); else window.alert(err?.message || 'Failed to approve');
                                  } finally {
                                    setActionLoading((s) => { const c = { ...s }; delete c[request._id]; return c; });
                                  }
                                }}
                            >
                              {actionLoading[request._id] === 'approve' ? (
                                <>
                                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                                    <path d="M12 2v4" />
                                    <path d="M12 18v4" />
                                    <path d="M4.93 4.93l2.83 2.83" />
                                    <path d="M16.24 16.24l2.83 2.83" />
                                  </svg>
                                  Approving...
                                </>
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                              disabled={Boolean(actionLoading[request._id])}
                              onClick={async () => {
                                if (actionLoading[request._id]) return; // guard
                                console.log('Reject clicked for', request._id);
                                if (!token) {
                                  window.alert('Unable to reject: not authenticated');
                                  return;
                                }
                                // Set loading state immediately and mark as reject
                                setActionLoading((s) => ({ ...s, [request._id]: 'reject' }));
                                const reason = window.prompt('Please provide a reason for rejection');
                                if (!reason) {
                                  // cancelled / empty - clear loading
                                  setActionLoading((s) => { const c = { ...s }; delete c[request._id]; return c; });
                                  return; // require reason
                                }
                                try {
                                  await leaveApi.rejectRequest(token, request._id, reason);
                                  if (typeof toast?.info === 'function') toast.info('Request rejected'); else window.alert('Request rejected');
                                  await fetchApprovals();
                                } catch (err) {
                                  console.error('Reject error:', err);
                                  if (typeof toast?.error === 'function') toast.error(err?.message || 'Failed to reject'); else window.alert(err?.message || 'Failed to reject');
                                } finally {
                                  setActionLoading((s) => { const c = { ...s }; delete c[request._id]; return c; });
                                }
                              }}
                            >
                              {actionLoading[request._id] === 'reject' ? (
                                <>
                                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                                    <path d="M12 2v4" />
                                    <path d="M12 18v4" />
                                    <path d="M4.93 4.93l2.83 2.83" />
                                    <path d="M16.24 16.24l2.83 2.83" />
                                  </svg>
                                  Rejecting...
                                </>
                              ) : (
                                'Reject'
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">No action</div>
                        )}
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
