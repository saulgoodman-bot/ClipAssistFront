import { useState, useCallback } from 'react';
import { ClipAssistAPI } from '../lib/api';

export function useVideoUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    try {
      const res = await ClipAssistAPI.uploadVideo(file, setProgress);
      return res.video_id;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const ingestUrl = useCallback(async (url: string) => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await ClipAssistAPI.ingestUrl(url);
      return res.video_id;
    } catch (err: any) {
      setError(err.message || 'Ingestion failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return { upload, ingestUrl, progress, isUploading, error, reset };
}
