import { useCallback } from 'react';
import { ClipAssistAPI } from '../lib/api';
import { usePolling } from './usePolling';
import { StatusResponse } from '../types/api';

export function useVideoStatus(videoId: number) {
  const fetchFn = useCallback(() => ClipAssistAPI.getStatus(videoId), [videoId]);

  const { data, isLoading, error } = usePolling<StatusResponse>(fetchFn, {
    interval: 3000,
    stopWhen: (res) => res.status === 'completed' || res.status === 'failed',
    enabled: !!videoId,
  });

  return {
    status: data?.status,
    progressStage: data?.progress_stage,
    clips: data?.clips || [],
    duration: data?.duration,
    isComplete: data?.status === 'completed',
    isFailed: data?.status === 'failed',
    errorMessage: data?.error_message,
    isLoading,
    error,
  };
}
