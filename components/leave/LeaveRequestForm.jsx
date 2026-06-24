'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, FilePlus2, Loader2 } from 'lucide-react';
import { leaveApi } from '../../utils/api';

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

/**
 * Reusable leave-request form. Renders just the form (no page chrome) so it can be
 * used both on the standalone page and inside a modal.
 *
 * Props:
 *  - onSuccess(createdRequest?)  called after a successful submission
 *  - onCancel()                  optional; when provided a Cancel button is shown
 *  - submitLabel                 optional submit button text
 */
export default function LeaveRequestForm({ onSuccess, onCancel, submitLabel = 'Submit request' }) {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverage, setCoverage] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverLeaveTypes, setServerLeaveTypes] = useState([]);

  const isValid = useMemo(() => {
    if (!leaveType) return false;
    if (!startDate || !endDate) return false;
    if (new Date(startDate) > new Date(endDate)) return false;
    if (!reason.trim()) return false;
    return true;
  }, [leaveType, startDate, endDate, reason]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const types = await leaveApi.getLeaveTypes();
        if (mounted) setServerLeaveTypes(Array.isArray(types) ? types : []);
      } catch (err) {
        console.warn('Unable to fetch leave types:', err); // keep fallback LEAVE_TYPES
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isValid || isSubmitting) return;

      setSubmitError('');
      setSubmitSuccess(false);
      setIsSubmitting(true);
      try {
        if (serverLeaveTypes.length && !leaveType) throw new Error('Please select a leave type');
        const payload = {
          leaveTypeId: serverLeaveTypes.length ? leaveType : undefined,
          leaveType: serverLeaveTypes.length ? undefined : leaveType,
          startDate,
          endDate,
          coveragePlan: coverage,
          handoverNotes,
          reason,
        };
        const created = await leaveApi.createRequest(payload);
        setSubmitSuccess(true);
        onSuccess?.(created);
      } catch (error) {
        console.error('Submit failed:', error);
        setSubmitError(error?.message || 'Unable to save the request right now. Please try again shortly.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [coverage, endDate, handoverNotes, isSubmitting, isValid, leaveType, onSuccess, reason, serverLeaveTypes, startDate]
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-end">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isValid ? 'Ready to submit' : 'Incomplete'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leave type *</span>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Select a leave type</option>
            {serverLeaveTypes.length > 0
              ? serverLeaveTypes.map((type) => (
                  <option key={type._id} value={type._id}>{type.name}</option>
                ))
              : LEAVE_TYPES.map((type) => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
          </select>
          {leaveType && (
            <span className="text-xs text-slate-500">
              {serverLeaveTypes.length > 0
                ? serverLeaveTypes.find((t) => t._id === leaveType)?.description || ''
                : LEAVE_TYPES.find((type) => type.key === leaveType)?.notice}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coverage plan</span>
          <select
            value={coverage}
            onChange={(e) => setCoverage(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Select an option</option>
            {COVERAGE_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start date *</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">End date *</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason / notes for approvers *</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          minLength={8}
          rows={4}
          placeholder="Provide additional context—e.g. travel plans, supporting details."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Handover notes</span>
        <textarea
          value={handoverNotes}
          onChange={(e) => setHandoverNotes(e.target.value)}
          rows={3}
          placeholder="Outline any pending tasks, client updates, or handover details."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700">
            <FilePlus2 className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-700">Supporting documents (optional)</p>
            <p className="text-xs text-slate-500">Attach medical certificates or supporting files after submitting—upload coming soon.</p>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{submitError}</div>
      )}
      {submitSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Request submitted!</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : (
            <><CalendarDays className="h-4 w-4" /> {submitLabel}</>
          )}
        </button>
      </div>
    </form>
  );
}
