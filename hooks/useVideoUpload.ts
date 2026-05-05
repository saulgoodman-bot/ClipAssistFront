import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipAssistAPI } from '../lib/api';

export function useVideoUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const reset = () => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  };

  const upload = async (file: File): Promise<number> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const res = await ClipAssistAPI.uploadVideo(file, (pct) => setProgress(pct));
      router.push(`/status/${res.video_id}`);
      return res.video_id;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setIsUploading(false);
      throw err;
    }
  };

  const ingestUrl = async (url: string): Promise<number> => {
    setIsUploading(true);
    setError(null);
    setProgress(0); // Fake progress could be handled differently

    try {
      const res = await ClipAssistAPI.ingestUrl(url);
      router.push(`/status/${res.video_id}`);
      return res.video_id;
    } catch (err: any) {
      setError(err.message || 'Ingest failed');
      setIsUploading(false);
      throw err;
    }
  };

  return { upload, ingestUrl, progress, isUploading, error, reset };
}
