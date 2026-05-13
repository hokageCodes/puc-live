'use client';

import { useEffect, useRef, useState } from 'react';
import { COURT_OTHER_VALUE, mergeCourtFromForm } from '../../data/nigerianCourts';
import { diaryApi } from '../../utils/api';

const emptyPreview = () => ({
  semanticConflicts: [],
  teamSameDayEntries: [],
  teamSameTimeEntries: [],
  teamCalendarRequiresAck: false,
});

/**
 * Debounced conflict preview (semantic duplicate + team same-day / same-time rules).
 * @param {object} form — matterTitle, matterRef, courtSelect, courtOther, appearanceDate, appearanceTime
 * @param {object} [options]
 * @param {string} [options.excludeEntryId] — edit mode entry id
 * @param {string} [options.baselineDate] — original appearance date (YYYY-MM-DD) when editing
 * @param {string} [options.baselineTime] — original appearance time when editing
 */
export function useDiaryDuplicatePreview(form, options = {}) {
  const { excludeEntryId, baselineDate, baselineTime } = options;

  const [preview, setPreview] = useState(emptyPreview);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!form?.appearanceDate) {
      setPreview(emptyPreview());
      return;
    }

    const court =
      form.courtSelect && (form.courtSelect !== COURT_OTHER_VALUE || form.courtOther?.trim())
        ? mergeCourtFromForm(form.courtSelect, form.courtOther)
        : null;

    timerRef.current = setTimeout(async () => {
      try {
        const params = { appearanceDate: form.appearanceDate };
        if (form.appearanceTime && String(form.appearanceTime).trim()) {
          params.appearanceTime = String(form.appearanceTime).trim();
        }
        if (court && String(form.matterTitle || '').trim()) {
          params.court = court;
          params.matterTitle = String(form.matterTitle).trim();
          if (form.matterRef && String(form.matterRef).trim()) {
            params.matterRef = String(form.matterRef).trim();
          }
        }
        if (excludeEntryId) {
          params.excludeEntryId = excludeEntryId;
          if (baselineDate) params.baselineAppearanceDate = baselineDate;
          if (baselineTime !== undefined && baselineTime !== null) {
            params.baselineAppearanceTime = baselineTime;
          }
        }
        const data = await diaryApi.previewConflicts(params);
        setPreview({
          semanticConflicts: Array.isArray(data?.semanticConflicts) ? data.semanticConflicts : [],
          teamSameDayEntries: Array.isArray(data?.teamSameDayEntries) ? data.teamSameDayEntries : [],
          teamSameTimeEntries: Array.isArray(data?.teamSameTimeEntries) ? data.teamSameTimeEntries : [],
          teamCalendarRequiresAck: Boolean(data?.teamCalendarRequiresAck),
        });
      } catch {
        setPreview(emptyPreview());
      }
    }, 450);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    form?.appearanceDate,
    form?.appearanceTime,
    form?.matterTitle,
    form?.matterRef,
    form?.courtSelect,
    form?.courtOther,
    excludeEntryId,
    baselineDate,
    baselineTime,
  ]);

  return preview;
}
