import { useEffect, useRef, useCallback } from 'react';

/**
 * Calls the latest `refetch` when the user returns to the tab after it was in the background
 * (e.g. another admin updated data while this tab was hidden).
 * Uses a ref so callers can pass an inline function without re-subscribing every render.
 */
export function useRefetchOnVisible(refetch, { enabled = true } = {}) {
  const debounceRef = useRef(null);
  const wasHiddenRef = useRef(
    typeof document !== 'undefined' && document.visibilityState === 'hidden'
  );
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const schedule = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      wasHiddenRef.current = true;
      return;
    }
    if (document.visibilityState !== 'visible' || !wasHiddenRef.current) return;
    wasHiddenRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const fn = refetchRef.current;
      if (typeof fn === 'function') void Promise.resolve(fn());
    }, 200);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    document.addEventListener('visibilitychange', schedule);
    return () => {
      document.removeEventListener('visibilitychange', schedule);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, schedule]);
}
