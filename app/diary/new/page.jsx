'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';
import { ApiError, diaryApi } from '../../../utils/api';
import {
  COURT_OTHER_VALUE,
  mergeCourtFromForm,
  NIGERIAN_COURT_OPTIONS,
} from '../../../data/nigerianCourts';
import { DiaryConflictModal } from '../DiaryConflictModal.jsx';
import {
  partitionByCreator,
  SelfCalendarConflictMessage,
  SelfSemanticConflictMessage,
  staffIdFromUser,
  TeammateCalendarConflictMessage,
  TeammateSemanticConflictMessage,
} from '../diaryConflictCopy.jsx';
import { useDiaryDuplicatePreview } from '../useDiaryDuplicatePreview';

export default function NewDiaryEntryPage() {
  const { isAuthenticated } = useLeaveGuard({
    preserveNext: true,
    loginPath: '/diary/login',
  });
  const { status, user } = useLeaveAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [blockingSemantic, setBlockingSemantic] = useState([]);
  const [blockingTeam, setBlockingTeam] = useState([]);
  const [acknowledgeDuplicate, setAcknowledgeDuplicate] = useState(false);
  const [acknowledgeTeamOverlap, setAcknowledgeTeamOverlap] = useState(false);
  const [conflictModal, setConflictModal] = useState(null);
  const [form, setForm] = useState({
    matterTitle: '',
    matterRef: '',
    courtSelect: '',
    courtOther: '',
    appearanceDate: '',
    appearanceTime: '',
    notes: '',
    status: '',
  });

  const preview = useDiaryDuplicatePreview(form, {});
  const myId = staffIdFromUser(user);

  useEffect(() => {
    setAcknowledgeDuplicate(false);
    setAcknowledgeTeamOverlap(false);
    setBlockingSemantic([]);
    setBlockingTeam([]);
    setConflictModal(null);
  }, [form.matterTitle, form.matterRef, form.courtSelect, form.courtOther, form.appearanceDate, form.appearanceTime]);

  if (status === 'loading' || status === 'authenticating' || !isAuthenticated) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-600 shadow-sm">
        Preparing form...
      </div>
    );
  }

  const semanticRows = blockingSemantic.length > 0 ? blockingSemantic : preview.semanticConflicts;
  const teamRows = blockingTeam.length > 0 ? blockingTeam : preview.teamSameDayEntries;
  const semanticBlock = semanticRows.length > 0;
  const teamBlock = preview.teamCalendarRequiresAck || blockingTeam.length > 0;

  const runCreate = async (flags) => {
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
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        matterTitle: form.matterTitle,
        matterRef: form.matterRef,
        court,
        appearanceDate: form.appearanceDate,
        appearanceTime: form.appearanceTime,
        notes: form.notes,
        status: form.status,
      };
      if (flags.semantic || acknowledgeDuplicate) payload.acknowledgeDuplicate = true;
      if (flags.team || acknowledgeTeamOverlap) payload.acknowledgeTeamOverlap = true;
      await diaryApi.createEntry(payload);
      router.push('/diary');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.code === 'DIARY_DUPLICATE') {
        const rows = Array.isArray(err.conflicts) ? err.conflicts : [];
        setBlockingSemantic(rows);
        setConflictModal({
          needsSemanticAck: true,
          needsTeamAck: false,
          court,
          semanticRows: rows,
          teamRows: [],
        });
      } else if (err instanceof ApiError && err.status === 409 && err.code === 'DIARY_TEAM_CALENDAR') {
        const rows = Array.isArray(err.conflicts) ? err.conflicts : [];
        setBlockingTeam(rows);
        setConflictModal({
          needsSemanticAck: false,
          needsTeamAck: true,
          court,
          semanticRows: [],
          teamRows: rows,
        });
      } else {
        setError(err.message || 'Could not create diary entry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
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

    const needsSemanticAck = semanticBlock && !acknowledgeDuplicate;
    const needsTeamAck = teamBlock && !acknowledgeTeamOverlap;

    if (needsSemanticAck || needsTeamAck) {
      setConflictModal({
        needsSemanticAck,
        needsTeamAck,
        court,
        semanticRows,
        teamRows,
      });
      return;
    }

    await runCreate({ semantic: false, team: false });
  };

  const closeConflictModal = () => {
    setConflictModal(null);
    setBlockingSemantic([]);
    setBlockingTeam([]);
  };

  const confirmConflictModal = async () => {
    if (!conflictModal) return;
    const { needsSemanticAck, needsTeamAck } = conflictModal;
    if (needsSemanticAck) setAcknowledgeDuplicate(true);
    if (needsTeamAck) setAcknowledgeTeamOverlap(true);
    setConflictModal(null);
    await runCreate({
      semantic: needsSemanticAck,
      team: needsTeamAck,
    });
  };

  const candidateMatter = {
    matterTitle: form.matterTitle,
    matterRef: form.matterRef,
    court: conflictModal?.court || '',
  };

  const modalBody = conflictModal ? (
    <div className="space-y-4">
      {conflictModal.needsSemanticAck && (
        <div>
          {(() => {
            const { others, mine } = partitionByCreator(conflictModal.semanticRows, myId);
            const refRow = others[0] || mine[0];
            if (!refRow) return null;
            if (others.length > 0) {
              return (
                <TeammateSemanticConflictMessage
                  row={others[0]}
                  appearanceDateIso={form.appearanceDate}
                  candidate={candidateMatter}
                />
              );
            }
            return (
              <SelfSemanticConflictMessage
                appearanceDateIso={form.appearanceDate}
                candidate={candidateMatter}
                row={refRow}
              />
            );
          })()}
        </div>
      )}
      {conflictModal.needsTeamAck && (
        <div>
          {(() => {
            const { others } = partitionByCreator(conflictModal.teamRows, myId);
            const allRows = conflictModal.teamRows;
            if (others.length > 0) {
              return (
                <TeammateCalendarConflictMessage
                  row={others[0]}
                  appearanceDateIso={form.appearanceDate}
                  candidateCourt={conflictModal.court}
                  candidateTime={form.appearanceTime}
                  allRows={allRows}
                />
              );
            }
            return (
              <SelfCalendarConflictMessage
                appearanceDateIso={form.appearanceDate}
                court={conflictModal.court}
                appearanceTime={form.appearanceTime}
                teamRows={allRows}
              />
            );
          })()}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col space-y-6 overflow-y-auto overscroll-contain py-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New diary entry</h1>
          <p className="mt-1 text-sm text-slate-500">Add a court appearance for your team diary.</p>
        </div>
        <Link href="/diary" className="shrink-0 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          ← Back to calendar
        </Link>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.04] sm:p-8">
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
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                courtSelect: e.target.value,
                courtOther: e.target.value === COURT_OTHER_VALUE ? f.courtOther : '',
              }))
            }
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
              placeholder="e.g. 10:00 or 10:30am"
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
            <option value="adjourned">Adjourned</option>
          </select>
        </div>
        <textarea
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={5}
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
        >
          {submitting ? 'Saving...' : 'Save entry'}
        </button>
      </form>

      <DiaryConflictModal
        open={Boolean(conflictModal)}
        title="Confirm diary entry"
        onClose={closeConflictModal}
        onProceed={confirmConflictModal}
      >
        {modalBody}
      </DiaryConflictModal>
    </div>
  );
}
