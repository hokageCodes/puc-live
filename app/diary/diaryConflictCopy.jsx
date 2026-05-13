import React from 'react';

/** Stable staff id from leave session user object */
export function staffIdFromUser(user) {
  if (!user) return '';
  return String(user.id ?? user._id ?? '').trim();
}

export function rowCreatorId(row) {
  if (!row?.createdById) return '';
  return String(row.createdById);
}

export function partitionByCreator(rows, myId) {
  const mine = [];
  const others = [];
  const mid = myId ? String(myId) : '';
  for (const r of rows || []) {
    const rid = rowCreatorId(r);
    if (mid && rid && rid === mid) mine.push(r);
    else others.push(r);
  }
  return { mine, others };
}

/** `YYYY-MM-DD` → e.g. 16 May 2026 (UTC calendar) */
export function formatDiaryDate(isoYYYYMMDD) {
  if (!isoYYYYMMDD || !/^\d{4}-\d{2}-\d{2}$/.test(String(isoYYYYMMDD).trim())) {
    return String(isoYYYYMMDD || '').trim() || 'this date';
  }
  const [y, m, d] = String(isoYYYYMMDD).trim().split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function B({ children }) {
  return <strong className="font-semibold text-slate-900">{children}</strong>;
}

export const normalizeLoose = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/** Match backend `normalizeAppearanceTime` for client-side overlap hints */
export function normalizeAppearanceTime(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  let s = raw.toLowerCase().replace(/\s+/g, '');
  let meridiem = null;
  if (s.endsWith('am')) {
    meridiem = 'am';
    s = s.slice(0, -2);
  } else if (s.endsWith('pm')) {
    meridiem = 'pm';
    s = s.slice(0, -2);
  }

  let hours;
  let minutes;

  if (s.includes(':')) {
    const [a, b] = s.split(':', 2);
    hours = parseInt(String(a).replace(/\D/g, ''), 10);
    minutes = parseInt(String(b).replace(/\D/g, '').slice(0, 2), 10);
  } else {
    const digits = s.replace(/\D/g, '');
    if (digits.length < 3 || digits.length > 4) return null;
    hours = parseInt(digits.slice(0, -2), 10);
    minutes = parseInt(digits.slice(-2), 10);
  }

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes > 59 || minutes < 0) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
  } else if (hours > 23 || hours < 0) {
    return null;
  }

  if (hours > 23 || minutes > 59 || hours < 0 || minutes < 0) return null;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function analyzeTeamCalendarOverlap(candidate, rows) {
  const courtN = normalizeLoose(candidate.court || '');
  const cTime = normalizeAppearanceTime(candidate.appearanceTime);
  let sameCourt = false;
  let sameTime = false;
  for (const r of rows || []) {
    if (courtN && normalizeLoose(r.court || '') === courtN) sameCourt = true;
    const rt = normalizeAppearanceTime(r.appearanceTime);
    if (cTime && rt && rt === cTime) sameTime = true;
  }
  return {
    sameDate: true,
    sameCourt,
    sameTime,
    candidateHasParsedTime: Boolean(cTime),
  };
}

function semanticDuplicateKind(candidate, row) {
  const cRef = String(candidate.matterRef || '').trim().toLowerCase();
  const rRef = String(row.matterRef || '').trim().toLowerCase();
  if (cRef && rRef && cRef === rRef) return 'ref';
  return 'titleCourt';
}

export function CalendarOverlapExplanation({ overlap, dateIso, court, timeRaw }) {
  const d = formatDiaryDate(dateIso);
  const c = String(court || '').trim() || 'your court';
  const t = String(timeRaw || '').trim();
  const { sameCourt, sameTime, candidateHasParsedTime } = overlap;

  if (sameCourt && sameTime && candidateHasParsedTime && t) {
    return (
      <p className="mt-2 text-slate-600">
        What overlaps: <B>{d}</B>, <B>{c}</B>, and <B>{t}</B> — same calendar date, same court, and same clock time as
        another diary line.
      </p>
    );
  }
  if (sameCourt && !sameTime) {
    return (
      <p className="mt-2 text-slate-600">
        What overlaps: <B>{d}</B> and <B>{c}</B> (same date and court).
        {!candidateHasParsedTime
          ? ' You have not set a time on this draft, so it is not a time clash.'
          : ' The other line uses a different time (or has no time set).'}
      </p>
    );
  }
  if (!sameCourt && sameTime && candidateHasParsedTime && t) {
    return (
      <p className="mt-2 text-slate-600">
        What overlaps: <B>{d}</B> and <B>{t}</B> (same date and time). The other line is at a different court.
      </p>
    );
  }
  return (
    <p className="mt-2 text-slate-600">
      What overlaps: <B>{d}</B> only — another diary line exists that day, but your court and time do not match that
      line.
    </p>
  );
}

export function SelfCalendarConflictMessage({ appearanceDateIso, court, appearanceTime, teamRows }) {
  const d = formatDiaryDate(appearanceDateIso);
  const c = String(court || '').trim() || 'your court';
  const t = String(appearanceTime || '').trim();
  const overlap = analyzeTeamCalendarOverlap({ court, appearanceTime }, teamRows);

  return (
    <>
      <p className="text-slate-600">
        You are saving <B>{d}</B>
        {t ? (
          <>
            {' '}
            at <B>{t}</B>
          </>
        ) : null}{' '}
        at <B>{c}</B>. Another diary line of yours already sits on this calendar day.
      </p>
      <CalendarOverlapExplanation overlap={overlap} dateIso={appearanceDateIso} court={court} timeRaw={appearanceTime} />
      <p className="mt-3 text-slate-600">Continue with this submission?</p>
    </>
  );
}

export function TeammateCalendarConflictMessage({
  row,
  appearanceDateIso,
  candidateCourt,
  candidateTime,
  allRows,
}) {
  const name = row?.createdByDisplayName || 'A team member';
  const d = formatDiaryDate(appearanceDateIso);
  const theirCourt = String(row?.court || '').trim() || 'a court';
  const theirTime = String(row?.appearanceTime || '').trim();
  const overlap = analyzeTeamCalendarOverlap(
    { court: candidateCourt, appearanceTime: candidateTime },
    allRows
  );

  return (
    <>
      <p className="text-slate-600">
        <B>{name}</B> made an entry for <B>{d}</B>
        {theirTime ? (
          <>
            {' '}
            at <B>{theirTime}</B>
          </>
        ) : (
          ' (no time set on their line)'
        )}{' '}
        at <B>{theirCourt}</B>.
      </p>
      <CalendarOverlapExplanation
        overlap={overlap}
        dateIso={appearanceDateIso}
        court={candidateCourt}
        timeRaw={candidateTime}
      />
      <p className="mt-3 text-slate-600">Proceed with your submission anyway?</p>
    </>
  );
}

export function SelfSemanticConflictMessage({ appearanceDateIso, candidate, row }) {
  const kind = semanticDuplicateKind(candidate, row);
  const d = formatDiaryDate(appearanceDateIso);

  return (
    <>
      <p className="text-slate-600">
        You already have another diary line on <B>{d}</B>.
      </p>
      <p className="mt-2 text-slate-600">
        {kind === 'ref' ? (
          <>
            The duplicate is the <B>same matter reference</B> as this draft.
          </>
        ) : (
          <>
            The duplicate is the <B>same matter title</B> and <B>same court</B> as this draft.
          </>
        )}
      </p>
      <p className="mt-3 text-slate-600">Continue with this submission?</p>
    </>
  );
}

export function TeammateSemanticConflictMessage({ row, appearanceDateIso, candidate }) {
  const kind = semanticDuplicateKind(candidate, row);
  const name = row?.createdByDisplayName || 'A team member';
  const d = formatDiaryDate(appearanceDateIso);

  return (
    <>
      <p className="text-slate-600">
        <B>{name}</B> already has a diary entry on <B>{d}</B>.
      </p>
      <p className="mt-2 text-slate-600">
        {kind === 'ref' ? (
          <>
            The clash is the <B>same matter reference</B> as yours.
          </>
        ) : (
          <>
            The clash is the <B>same matter title</B> and <B>same court</B> as yours.
          </>
        )}
      </p>
      <p className="mt-3 text-slate-600">Proceed with your submission anyway?</p>
    </>
  );
}
