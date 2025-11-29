'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plane,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';
import { leaveApi } from '../../../utils/api';

const toneStyles = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  default: 'bg-slate-100 text-slate-600',
};

function BalanceCard({ label, total, used, upcoming }) {
  const remaining = Math.max(total - used - upcoming, 0);
  const usagePercentage = Math.min(Math.round(((used + upcoming) / total) * 100), 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {remaining}
            <span className="text-sm font-normal text-slate-400 ml-1">days left</span>
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Plane className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>Used</span>
          <span className="font-medium text-slate-700">{used} days</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Scheduled</span>
          <span className="font-medium text-slate-700">{upcoming} days</span>
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${usagePercentage}%` }}
        />
      </div>
    </div>
  );
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (startStr === endStr.split(' ').slice(0, 2).join(' ')) {
    return startStr;
  }
  return `${startStr} – ${endStr}`;
}

function formatStatus(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Declined';
  if (status.startsWith('pending_')) {
    const role = status.replace('pending_', '');
    return `Pending ${role === 'teamlead' ? 'Team Lead' : role === 'linemanager' ? 'Line Manager' : 'HR'}`;
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

export default function LeaveDashboardPage() {
  const { user, token, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();
  const [balances, setBalances] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = status === 'loading' || status === 'authenticating' || loading;

  const isApprover = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    return roles.some((role) => ['teamLead', 'lineManager', 'hr'].includes(role));
  }, [user?.roles]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [balancesData, requestsData, approvalsData] = await Promise.all([
          leaveApi.getMyBalances(token).catch(() => []),
          leaveApi.getMyRequests(token).catch(() => []),
          isApprover ? leaveApi.getPendingApprovals(token).catch(() => []) : Promise.resolve([]),
        ]);

        setBalances(balancesData);
        setMyRequests(requestsData);
        setPendingApprovals(approvalsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, isApprover]);

  // Get upcoming leave (approved or pending, within next 30 days)
  const upcomingLeave = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return myRequests
      .filter((req) => {
        const startDate = new Date(req.startDate);
        return (
          (req.status === 'approved' || req.status.startsWith('pending_')) &&
          startDate >= now &&
          startDate <= thirtyDaysFromNow
        );
      })
      .slice(0, 5)
      .map((req) => ({
        id: req._id,
        type: req.leaveType?.name || 'Leave',
        dates: formatDateRange(req.startDate, req.endDate),
        status: formatStatus(req.status),
        submittedBy: 'You',
      }));
  }, [myRequests]);

  // Build activity feed from requests timeline
  const activity = useMemo(() => {
    const activities = [];
    myRequests.slice(0, 5).forEach((req) => {
      if (req.timeline && req.timeline.length > 0) {
        const latest = req.timeline[req.timeline.length - 1];
        if (latest.event === 'approved') {
          activities.push({
            id: `activity-${req._id}-approved`,
            label: `${formatStatus(req.status)} your ${req.leaveType?.name || 'Leave'} request`,
            meta: getTimeAgo(latest.timestamp),
            icon: CheckCircle2,
            tone: 'success',
          });
        } else if (latest.event === 'submitted') {
          activities.push({
            id: `activity-${req._id}-submitted`,
            label: `You submitted a ${req.leaveType?.name || 'Leave'} request`,
            meta: getTimeAgo(latest.timestamp),
            icon: CalendarDays,
            tone: 'default',
          });
        }
      }
    });
    return activities.sort((a, b) => new Date(b.meta) - new Date(a.meta)).slice(0, 3);
  }, [myRequests]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Loading your workspace…
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
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your balances and upcoming leave at a glance. Jump into a request whenever you're ready.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/leave/request/new"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <CalendarDays className="h-4 w-4" />
            Request leave
          </Link>
          <Link
            href="/leave/requests"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            View history
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {balances.length === 0 ? (
          <div className="col-span-3 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            No leave balances found. Contact HR if this is unexpected.
          </div>
        ) : (
          balances.map((balance) => (
            <BalanceCard
              key={balance.type?.id || balance.type?.code}
              label={balance.type?.name || 'Leave'}
              total={balance.allocated + balance.carriedOver}
              used={balance.used}
              upcoming={balance.pending}
            />
          ))
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Upcoming leave
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Approved and pending days off scheduled over the next 30 days.
              </p>
            </div>
            <Link
              href="/leave/calendar"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500"
            >
              Open calendar
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {upcomingLeave.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                No upcoming leave on the books. Request time off whenever you're ready.
              </div>
            ) : (
              upcomingLeave.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{item.type}</p>
                    <p className="text-xs text-slate-500">{item.dates}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-emerald-600">
                      {item.status}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">{item.submittedBy}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Quick actions
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Plane className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Plan time off</p>
                  <p className="text-xs text-slate-500">
                    Submit a new request and automatically notify your approvers.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Check entitlement</p>
                  <p className="text-xs text-slate-500">
                    Review your annual allocation and remaining balances before you book.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <AlertCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Need assistance?</p>
                  <p className="text-xs text-slate-500">
                    Email{' '}
                    <a href="mailto:hr@paulusoro.com" className="font-medium text-emerald-600 hover:underline">
                      hr@paulusoro.com
                    </a>{' '}
                    for urgent support.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Latest activity
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {activity.length === 0 ? (
                <li className="text-xs text-slate-500">No recent activity</li>
              ) : (
                activity.map((item) => {
                  const Icon = item.icon;
                  const tone = toneStyles[item.tone] || toneStyles.default;
                  return (
                    <li key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3">
                      <span className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full ${tone}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.meta}</p>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </section>

      {isApprover && pendingApprovals.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Pending approvals
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Requests waiting for your review. Approve promptly to keep the workflow moving.
              </p>
            </div>
            <Link
              href="/leave/approvals"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500"
            >
              Manage all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pending approvals table: make swipeable on mobile */}
          <div className="mt-5 rounded-xl border border-slate-200" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Staff</th>
                  <th className="px-4 py-3 text-left font-semibold">Leave</th>
                  <th className="px-4 py-3 text-left font-semibold">Dates</th>
                  <th className="px-4 py-3 text-left font-semibold">Stage</th>
                  <th className="px-4 py-3 text-left font-semibold">Waiting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.slice(0, 5).map((item) => {
                  const staffName = item.staff
                    ? `${item.staff.firstName || ''} ${item.staff.lastName || ''}`.trim()
                    : 'Unknown';
                  const stage = formatStatus(item.status);
                  return (
                    <tr key={item._id} className="hover:bg-emerald-50/40">
                      <td className="px-4 py-3 text-slate-800">{staffName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.leaveType?.name || 'Leave'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateRange(item.startDate, item.endDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{stage}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {getTimeAgo(item.createdAt || item.timeline?.[0]?.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
              </div>
            </div>
          </section>
      )}
    </div>
  );
}
