import { useEffect, useState } from 'react';

/** How often a visible page re-reads the clock, so "5 minutes ago" does not go stale. */
export const NOW_TICK_MS = 30_000;

/** The current time in milliseconds, re-read every `tickMs` while the tab is visible. */
export const useNow = (tickMs = NOW_TICK_MS) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      setNow(Date.now());
      timer = setInterval(() => setNow(Date.now()), tickMs);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        start();
      } else {
        stop();
      }
    };

    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tickMs]);

  return now;
};
