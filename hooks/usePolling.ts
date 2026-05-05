import { useState, useEffect } from 'react';

interface PollingOptions<T> {
  interval: number;
  stopWhen: (data: T) => boolean;
  enabled?: boolean;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions<T>
) {
  const { interval, stopWhen, enabled = true } = options;
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    if (!enabled) {
      setTimeout(() => { if (mounted) setIsLoading(false); }, 0);
      return;
    }

    const poll = async () => {
      try {
        const result = await fetchFn();
        if (!mounted) return;
        
        setData(result);
        setError(null);
        setIsLoading(false);

        if (stopWhen(result)) {
           return; // Stop polling
        }

        timer = setTimeout(poll, interval);
      } catch (err: any) {
        if (!mounted) return;
        setError(err);
        setIsLoading(false);
        // decide if we should stop polling on error?
        // for now, we'll try again
        timer = setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [fetchFn, interval, stopWhen, enabled]);

  return { data, isLoading, error };
}
