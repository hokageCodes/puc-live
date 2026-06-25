'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, FilePlus2, Loader2, Upload, X } from 'lucide-react';
import { apiConfig, getHubAuthHeader, leaveApi } from '../../utils/api';

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB (matches backend limit)
const ATTACHMENT_ACCEPT = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

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
  const [leaveAllowance, setLeaveAllowance] = useState(false);
  const [allowanceMonth, setAllowanceMonth] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverLeaveTypes, setServerLeaveTypes] = useState([]);
  const [file, setFile] = useState(null);

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after removal
    if (!f) return;
    if (f.size > MAX_ATTACHMENT_BYTES) {
      setSubmitError('File is too large. Maximum size is 10MB.');
      return;
    }
    setSubmitError('');
    setFile(f);
  }, []);

  // Working days only (Mon–Fri); mirrors the backend so the user sees the real cost.
  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) return 0;
    s.setUTCHours(0, 0, 0, 0);
    e.setUTCHours(0, 0, 0, 0);
    let n = 0;
    const cursor = new Date(s);
    while (cursor <= e) {
      const day = cursor.getUTCDay();
      if (day !== 0 && day !== 6) n += 1;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return n;
  }, [startDate, endDate]);

  // Next 12 months as { value: 'YYYY-MM', label: 'July 2026' } for the allowance payment month.
  const monthOptions = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      out.push({ value, label });
    }
    return out;
  }, []);

  const isValid = useMemo(() => {
    if (!leaveType) return false;
    if (!startDate || !endDate) return false;
    if (new Date(startDate) > new Date(endDate)) return false;
    if (workingDays <= 0) return false;
    if (!reason.trim()) return false;
    if (leaveAllowance && !allowanceMonth) return false; // month required when requesting allowance
    return true;
  }, [leaveType, startDate, endDate, reason, workingDays, leaveAllowance, allowanceMonth]);

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

        // Send multipart/form-data so an optional document can ride along. The backend
        // accepts the `attachment` field and also reads the text fields from the form.
        const fd = new FormData();
        if (serverLeaveTypes.length) fd.append('leaveTypeId', leaveType);
        else fd.append('leaveType', leaveType);
        fd.append('startDate', startDate);
        fd.append('endDate', endDate);
        if (coverage) fd.append('coveragePlan', coverage);
        if (handoverNotes) fd.append('handoverNotes', handoverNotes);
        fd.append('reason', reason);
        fd.append('leaveAllowance', leaveAllowance ? 'true' : 'false');
        if (leaveAllowance && allowanceMonth) fd.append('allowanceMonth', allowanceMonth);
        if (file) fd.append('attachment', file);

        const base = apiConfig.baseUrl.replace(/\/$/, '');
        const res = await fetch(`${base}/api/leave/requests`, {
          method: 'POST',
          credentials: 'include',
          headers: { ...getHubAuthHeader() }, // no Content-Type — browser sets the multipart boundary
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || data?.error || 'Unable to save the request.');

        setSubmitSuccess(true);
        onSuccess?.(data);
      } catch (error) {
        console.error('Submit failed:', error);
        setSubmitError(error?.message || 'Unable to save the request right now. Please try again shortly.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [allowanceMonth, coverage, endDate, file, handoverNotes, isSubmitting, isValid, leaveAllowance, leaveType, onSuccess, reason, serverLeaveTypes, startDate]
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

      {startDate && endDate && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
          workingDays > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <CalendarDays className="h-3.5 w-3.5" />
          {workingDays > 0 ? (
            <span><b className="font-semibold">{workingDays}</b> working day{workingDays === 1 ? '' : 's'} · weekends are not counted</span>
          ) : (
            <span>No working days in this range (weekends are not counted).</span>
          )}
        </div>
      )}

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

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={leaveAllowance}
            onChange={(e) => {
              setLeaveAllowance(e.target.checked);
              if (!e.target.checked) setAllowanceMonth('');
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            <span className="text-sm font-medium text-slate-700">Request leave allowance</span>
            <span className="block text-xs text-slate-500">Tick this if you'd like your leave allowance paid out for this leave.</span>
          </span>
        </label>

        {leaveAllowance && (
          <label className="mt-3 flex flex-col gap-2 sm:max-w-xs">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pay in month *</span>
            <select
              value={allowanceMonth}
              onChange={(e) => setAllowanceMonth(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Select a month</option>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700">
            <FilePlus2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700">Supporting document (optional)</p>
            <p className="text-xs text-slate-500">PDF, DOC, DOCX, TXT, JPG or PNG · max 10MB</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {file ? 'Replace file' : 'Choose file'}
            <input type="file" className="hidden" accept={ATTACHMENT_ACCEPT} onChange={handleFileChange} />
          </label>
          {file && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200">
              <span className="max-w-[200px] truncate">{file.name}</span>
              <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
              <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="text-slate-400 hover:text-red-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
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
