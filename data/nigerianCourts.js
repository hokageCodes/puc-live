/**
 * Court diary dropdown: court type + venue (Lagos / Abuja / Uyo where the firm works).
 * Stored `court` string is the full label shown in lists and used for duplicate checks.
 */

export const COURT_OTHER_VALUE = '__other__';

/** @typedef {{ value: string, label: string }} CourtOption */
/** @typedef {{ label: string, options: CourtOption[] }} CourtGroup */

/** @type {CourtGroup[]} */
export const COURT_DROPDOWN_GROUPS = [
  {
    label: 'Supreme Court',
    options: [
      {
        value: 'Supreme Court of Nigeria — Abuja',
        label: 'Abuja (only venue of the Supreme Court)',
      },
    ],
  },
  {
    label: 'Court of Appeal',
    options: [
      { value: 'Court of Appeal — Lagos Division', label: 'Lagos Division' },
      { value: 'Court of Appeal — Abuja Division', label: 'Abuja Division' },
      { value: 'Court of Appeal — Port Harcourt Division', label: 'Port Harcourt Division' },
      { value: 'Court of Appeal — Calabar Division', label: 'Calabar Division (South-South)' },
    ],
  },
  {
    label: 'Federal High Court',
    options: [
      { value: 'Federal High Court — Lagos', label: 'Lagos' },
      { value: 'Federal High Court — Abuja', label: 'Abuja' },
      { value: 'Federal High Court — Uyo', label: 'Uyo' },
    ],
  },
  {
    label: 'High Court of the Federal Capital Territory',
    options: [
      {
        value: 'High Court of the Federal Capital Territory — Abuja',
        label: 'Abuja',
      },
    ],
  },
  {
    label: 'State High Court',
    options: [
      { value: 'Lagos State High Court — Lagos', label: 'Lagos State High Court (Lagos)' },
      { value: 'Akwa Ibom State High Court — Uyo', label: 'Akwa Ibom State High Court (Uyo)' },
    ],
  },
  {
    label: 'Magistrate Court',
    options: [
      { value: 'Magistrate Court — Lagos', label: 'Lagos' },
      { value: 'Magistrate Court — Abuja', label: 'Abuja' },
      { value: 'Magistrate Court — Uyo', label: 'Uyo' },
    ],
  },
];

/** Values removed from the dropdown but may still exist on saved entries. */
const REMOVED_PRESET_COURTS = new Set([
  'High Court of Justice, Rivers State — Port Harcourt',
  'High Court of Justice, Plateau State — Jos',
]);

/** Flat list of all preset values (for split / validation). */
export const ALL_PRESET_COURT_VALUES = COURT_DROPDOWN_GROUPS.flatMap((g) => g.options.map((o) => o.value));

/**
 * @deprecated Use COURT_DROPDOWN_GROUPS / ALL_PRESET_COURT_VALUES. Kept for imports that expect a flat array.
 */
export const NIGERIAN_COURT_OPTIONS = ALL_PRESET_COURT_VALUES;

/** Map legacy stored labels from the old Lagos-only list to the new taxonomy where obvious. */
const LEGACY_COURT_ALIASES = {
  'Court of Appeal, Lagos': 'Court of Appeal — Lagos Division',
  'FHC, Ikoyi': 'Federal High Court — Lagos',
  'FHC, Ikeja': 'Federal High Court — Lagos',
  'FHC, Apapa': 'Federal High Court — Lagos',
  'NICN, Lagos': 'National Industrial Court of Nigeria, Lagos',
  'Lagos State High Court, Ikeja': 'Lagos State High Court — Lagos',
  'Lagos State High Court, Lagos Island': 'Lagos State High Court — Lagos',
  'Lagos State High Court, Eti-Osa': 'Lagos State High Court — Lagos',
  'Lagos State High Court, Yaba': 'Lagos State High Court — Lagos',
  'Lagos State High Court, Igbosere': 'Lagos State High Court — Lagos',
};

export function splitCourtForForm(stored) {
  if (!stored) return { courtSelect: '', courtOther: '' };
  const trimmed = String(stored).trim();
  if (ALL_PRESET_COURT_VALUES.includes(trimmed)) {
    return { courtSelect: trimmed, courtOther: '' };
  }
  if (REMOVED_PRESET_COURTS.has(trimmed)) {
    return { courtSelect: COURT_OTHER_VALUE, courtOther: trimmed };
  }
  const mapped = LEGACY_COURT_ALIASES[trimmed];
  if (mapped) {
    if (ALL_PRESET_COURT_VALUES.includes(mapped)) {
      return { courtSelect: mapped, courtOther: '' };
    }
    return { courtSelect: COURT_OTHER_VALUE, courtOther: mapped };
  }
  return { courtSelect: COURT_OTHER_VALUE, courtOther: trimmed };
}

export function mergeCourtFromForm(courtSelect, courtOther) {
  if (courtSelect === COURT_OTHER_VALUE) return (courtOther || '').trim();
  return courtSelect || '';
}
