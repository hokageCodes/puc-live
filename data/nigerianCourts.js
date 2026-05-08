/**
 * Lagos court venues for diary entries (label = stored value).
 */
export const NIGERIAN_COURT_OPTIONS = [
  'Court of Appeal, Lagos',
  'FHC, Ikoyi',
  'FHC, Ikeja',
  'FHC, Apapa',
  'NICN, Lagos',
  'Lagos State High Court, Ikeja',
  'Lagos State High Court, Lagos Island',
  'Lagos State High Court, Eti-Osa',
  'Lagos State High Court, Yaba',
  'Lagos State High Court, Igbosere',
];

export const COURT_OTHER_VALUE = '__other__';

export function splitCourtForForm(stored) {
  if (!stored) return { courtSelect: '', courtOther: '' };
  if (NIGERIAN_COURT_OPTIONS.includes(stored)) return { courtSelect: stored, courtOther: '' };
  return { courtSelect: COURT_OTHER_VALUE, courtOther: stored };
}

export function mergeCourtFromForm(courtSelect, courtOther) {
  if (courtSelect === COURT_OTHER_VALUE) return (courtOther || '').trim();
  return courtSelect || '';
}
