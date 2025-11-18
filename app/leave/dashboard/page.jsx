'use client';

import { useMemo } from 'react';
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

const MOCK_BALANCES = [
  { code: 'annual', label: 'Annual Leave', total: 20, used: 0, upcoming: 0 },
  { code: 'sick', label: 'Sick Leave', total: 10, used: 0, upcoming: 0 },
  { code: 'compassionate', label: 'Compassionate', total: 5, used: 0, upcoming: 0 },
];

const MOCK_UPCOMING_LEAVE = [
  {
    id: 'req-201',
    type: 'Annual Leave',
    dates: '12 – 16 Aug 2025',
    submittedBy: 'You',
    status: 'Approved',
  },
  {
    id: 'req-198',
    type: 'Sick Leave',
    dates: '30 Jul 2025',
    submittedBy: 'You',
    status: 'Pending HR',
  },
];

const MOCK_APPROVALS = [
  {
    id: 'req-204',
    staff: 'Chioma Daniels',
    type: 'Annual Leave',
    dates: '22 – 26 Aug 2025',
    since: '2h ago',
    stage: 'Awaiting Team Lead',
  },
  {
    id: 'req-205',
    staff: 'Abayomi Kale',
    type: 'Sick Leave',
    dates: '07 Aug 2025',
    since: '18h ago',
    stage: 'Awaiting Line Manager',
  },
];

const MOCK_ACTIVITY = [
  {
    id: 'activity-1',
    label: 'HR approved your Annual Leave request',
    meta: 'Today • 09:45',
    icon: CheckCircle2,
    tone: 'success',
  },
  {
    id: 'activity-2',
    label: 'You submitted a Sick Leave request',
    meta: 'Yesterday • 14:10',
    icon: CalendarDays,
    tone: 'default',
  },
  {
    id: 'activity-3',
    label: 'Awaiting HR review for Abayomi Kale',
    meta: 'Yesterday • 09:02',
    icon: Clock,
    tone: 'warning',
  },
];

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

export default function LeaveDashboardPage() {
  const { user, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();

  const isLoading = status === 'loading' || status === 'authenticating';

  const isApprover = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    return roles.some((role) => ['teamLead', 'lineManager', 'hr'].includes(role));
  }, [user?.roles]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Loading your workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your balances and upcoming leave at a glance. Jump into a request whenever you’re ready.
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
            href="/leave/history"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            View history
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {MOCK_BALANCES.map((balance) => {
          const { code, ...cardProps } = balance;
          return <BalanceCard key={code} {...cardProps} />;
        })}
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
              {MOCK_UPCOMING_LEAVE.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                  No upcoming leave on the books. Request time off whenever you’re ready.
                </div>
              ) : (
                MOCK_UPCOMING_LEAVE.map((item) => (
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
                {MOCK_ACTIVITY.map((item) => {
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
                })}
              </ul>
            </div>
          </div>
        </section>

      {isApprover && (
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

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
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
                {MOCK_APPROVALS.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/40">
                    <td className="px-4 py-3 text-slate-800">{item.staff}</td>
                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3 text-slate-600">{item.dates}</td>
                    <td className="px-4 py-3 text-slate-600">{item.stage}</td>
                    <td className="px-4 py-3 text-slate-500">{item.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

