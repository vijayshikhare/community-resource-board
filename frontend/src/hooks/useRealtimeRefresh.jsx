import { useEffect, useRef } from 'react';

const useRealtimeRefresh = (callback, options = {}) => {
  const {
    enabled = true,
    intervalMs = 10000,
    runOnMount = true,
  } = options;

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || typeof callbackRef.current !== 'function') return undefined;

    const runRefresh = () => {
      try {
        void callbackRef.current();
      } catch {
        // callback owns error handling
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        runRefresh();
      }
    };

    if (runOnMount) {
      runRefresh();
    }

    const intervalId = window.setInterval(runRefresh, intervalMs);
    window.addEventListener('focus', runRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', runRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs, runOnMount]);
};

export default useRealtimeRefresh;
