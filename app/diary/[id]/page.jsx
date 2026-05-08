'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';
import { diaryApi } from '../../../utils/api';
import {
  COURT_OTHER_VALUE,
  mergeCourtFromForm,
  NIGERIAN_COURT_OPTIONS,
  splitCourtForForm,
} from '../../../data/nigerianCourts';

export default function DiaryEntryPage() {
  const { isAuthenticated } = useLeaveGuard({
    preserveNext: true,
    loginPath: '/diary/login',
  });
  const { status } = useLeaveAuth();
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const run = async () => {
      try {
        setLoading(true);
        const entry = await diaryApi.getEntry(id);
        const { courtSelect, courtOther } = splitCourtForForm(entry.court || '');
        setForm({
          matterTitle: entry.matterTitle || '',
          matterRef: entry.matterRef || '',
          courtSelect,
          courtOther,
          appearanceDate: entry.appearanceDate ? new Date(entry.appearanceDate).toISOString().slice(0, 10) : '',
          appearanceTime: entry.appearanceTime || '',
          notes: entry.notes || '',
          status: entry.status || '',
        });
      } catch (err) {
        setError(err.message || 'Failed to load entry.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, isAuthenticated]);

  if (status === 'loading' || status === 'authenticating' || !isAuthenticated || loading) {
    return <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">Loading entry...</div>;
  }

  if (error || !form) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">{error || 'Entry unavailable.'}</div>;
  }

  const onSave = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!form.courtSelect) {
      setError('Please select a court.');
      return;
    }
    if (form.courtSelect === COURT_OTHER_VALUE && !form.courtOther.trim()) {
      setError('Please enter the court name for “Other”.');
      return;
    }
    const court = mergeCourtFromForm(form.courtSelect, form.courtOther);
    if (!court) {
      setError('Please select a court or enter one under “Other”.');
      return;
    }
    if (!form.status) {
      setError('Please select status.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await diaryApi.updateEntry(id, {
        matterTitle: form.matterTitle,
        matterRef: form.matterRef,
        court,
        appearanceDate: form.appearanceDate,
        appearanceTime: form.appearanceTime,
        nextHearingDate: '',
        notes: form.notes,
        status: form.status,
      });
      router.push('/diary');
    } catch (err) {
      setError(err.message || 'Failed to update entry.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this diary entry?')) return;
    setSaving(true);
    setError('');
    try {
      await diaryApi.deleteEntry(id);
      router.push('/diary');
    } catch (err) {
      setError(err.message || 'Failed to delete entry.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Diary Entry</h1>
        <Link href="/diary" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">Back to diary</Link>
      </div>
      <form onSubmit={onSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Matter title"
          value={form.matterTitle}
          onChange={(e) => setForm((f) => ({ ...f, matterTitle: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Matter reference (optional)"
          value={form.matterRef}
          onChange={(e) => setForm((f) => ({ ...f, matterRef: e.target.value }))}
        />
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-500">Court</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.courtSelect}
            onChange={(e) => setForm((f) => ({ ...f, courtSelect: e.target.value, courtOther: e.target.value === COURT_OTHER_VALUE ? f.courtOther : '' }))}
            required
          >
            <option value="">Select court and location</option>
            {NIGERIAN_COURT_OPTIONS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
            <option value={COURT_OTHER_VALUE}>Other (type below)</option>
          </select>
          {form.courtSelect === COURT_OTHER_VALUE && (
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Court name and location"
              value={form.courtOther}
              onChange={(e) => setForm((f) => ({ ...f, courtOther: e.target.value }))}
            />
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.appearanceDate}
              onChange={(e) => setForm((f) => ({ ...f, appearanceDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Time (optional)</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. 10:00"
              value={form.appearanceTime}
              onChange={(e) => setForm((f) => ({ ...f, appearanceTime: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            required
          >
            <option value="">Please select status</option>
            <option value="scheduled">Scheduled</option>
            <option value="held">Held</option>
            <option value="adjourned">Adjourned</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={5} placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" disabled={saving} onClick={onDelete} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
