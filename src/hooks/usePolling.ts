import { useEffect, useState } from 'react';

interface UsePollingOptions<T> {
  interval: number;
  stopWhen: (data: T) => boolean;
  enabled?: boolean;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: UsePollingOptions<T>
) {
  const { interval, stopWhen, enabled = true } = options;
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timeoutId: number;
    let mounted = true;

    const poll = async () => {
      if (!enabled) return;
      setIsLoading(true);
      try {
        const result = await fetchFn();
        if (!mounted) return;
        setData(result);
        setError(null);
        if (!stopWhen(result)) {
          timeoutId = window.setTimeout(poll, interval);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        // Could decide whether to stop polling on error or keep trying.
        // For now, we will probably stop on error to avoid spamming the backend if it's dead.
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (enabled) {
      void poll();
    }

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, interval, fetchFn, stopWhen]);

  return { data, isLoading, error };
}
