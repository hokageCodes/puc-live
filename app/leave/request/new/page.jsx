'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FilePlus2,
  Loader2,
  Users,
} from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../../components/leave/LeaveAuthContext';

const LEAVE_TYPES = [
  { key: 'annual', label: 'Annual Leave', notice: 'Min. 14 days notice recommended.' },
  { key: 'sick', label: 'Sick Leave', notice: 'Attach medical report if applicable.' },
  { key: 'compassionate', label: 'Compassionate Leave', notice: 'Contact HR for extended periods.' },
  { key: 'study', label: 'Study Leave', notice: 'Requires HR approval and supporting documents.' },
];

const COVERAGE_OPTIONS = [
  { key: 'handover', label: 'Shared handover notes' },
  { key: 'delegated', label: 'Delegated to a colleague' },
  { key: 'pending', label: 'To be delegated' },
];

const MOCK_REPORTING_CHAIN = (user) => {
  const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Staff member';
  return [
    {
      id: 'tl-001',
      label: 'Team Lead',
      name: 'Chinwe Okafor',
      status: 'Pending',
      meta: 'Team Lead approval required first.',
    },
    {
      id: 'lm-002',
      label: 'Line Manager',
      name: 'Babatunde Adeyemi',
      status: 'Locked',
      meta: 'Opens after Team Lead approval.',
    },
    {
      id: 'hr-003',
      label: 'HR',
      name: 'HR Operations',
      status: 'Locked',
      meta: 'Final endorsement from HR.',
    },
  ].map((step, index) => ({
    ...step,
    order: index + 1,
  }));
};

export default function LeaveRequestCreatePage() {
  const router = useRouter();
  const { user, status } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverage, setCoverage] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isLoading = status === 'loading' || status === 'authenticating';
  const reportingChain = useMemo(() => MOCK_REPORTING_CHAIN(user), [user]);

  const isValid = useMemo(() => {
    if (!leaveType) return false;
    if (!startDate || !endDate) return false;
    if (new Date(startDate) > new Date(endDate)) return false;
    if (!reason.trim()) return false;
    return true;
  }, [leaveType, startDate, endDate, reason]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isValid || isSubmitting) return;

      setSubmitError('');
      setSubmitSuccess(false);
      setIsSubmitting(true);

      try {
        const payload = {
          leaveType,
          startDate,
          endDate,
          coverage,
          handoverNotes,
          reason,
        };

        console.table(payload);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/leave/dashboard');
        }, 1200);
      } catch (error) {
        console.error('Mock submit failed:', error);
        setSubmitError(
          error?.message || 'Unable to save the request right now. Please try again shortly.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [coverage, endDate, handoverNotes, isSubmitting, isValid, leaveType, reason, router, startDate]
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Preparing your request form…
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">New Leave Request</p>
          <h1 className="text-2xl font-semibold text-slate-900">Let’s plan your time off</h1>
          <p className="text-sm text-slate-600">
            Complete the form below to notify your approvers and HR operations.
          </p>
        </div>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Request details</h2>
              <p className="text-xs text-slate-500">Fields marked with * are required.</p>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isValid ? 'Ready to submit' : 'Incomplete'}
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Leave type *
                </span>
                <select
                  value={leaveType}
                  onChange={(event) => setLeaveType(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select a leave type</option>
                  {LEAVE_TYPES.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {leaveType && (
                  <span className="text-xs text-slate-500">
                    {LEAVE_TYPES.find((type) => type.key === leaveType)?.notice}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Coverage plan
                </span>
                <select
                  value={coverage}
                  onChange={(event) => setCoverage(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select an option</option>
                  {COVERAGE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start date *
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  End date *
                </span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason / notes for approvers *
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={8}
                rows={4}
                placeholder="Provide additional context—e.g. travel plans, supporting details."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Handover notes
              </span>
              <textarea
                value={handoverNotes}
                onChange={(event) => setHandoverNotes(event.target.value)}
                rows={3}
                placeholder="Outline any pending tasks, client updates, or handover details."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                  <FilePlus2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-slate-700">Supporting documents (optional)</p>
                  <p className="text-xs text-slate-500">
                    Attach medical certificates or supporting files after submitting—upload coming soon.
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Request submitted! Redirecting to your dashboard…
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/leave/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4" />
                    Submit request
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Approval chain
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Your request will move through each stage automatically once the prior step is complete.
          </p>

          <ol className="mt-5 space-y-4">
            {reportingChain.map((step) => (
              <li key={step.id} className="relative flex gap-3 rounded-xl border border-slate-100 px-4 py-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Step {step.order} · {step.label}
                  </p>
                  <p className="text-sm font-medium text-slate-900">{step.name}</p>
                  <p className="text-xs text-slate-500">{step.meta}</p>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {step.status}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-xs text-emerald-700">
            HR will receive a notification after your team lead and line manager approve the request.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Helpful links
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                href="/leave/policy"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600"
              >
                Leave policy handbook
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <Link
                href="/leave/history"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600"
              >
                View past requests
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <a
                href="mailto:hr@paulusoro.com"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600"
              >
                Contact HR support
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

