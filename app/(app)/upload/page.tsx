'use client';

import { useState } from 'react';
import { DropZone } from '@/components/upload/DropZone';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { Link2, Clock } from 'lucide-react';

export default function UploadPage() {
  const { upload, ingestUrl, progress, isUploading, error, reset } = useVideoUpload();
  const [url, setUrl] = useState('');
  const [fileDetails, setFileDetails] = useState<{name: string, size: string} | null>(null);

  const handleFile = async (file: File) => {
    setFileDetails({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
    });
    try {
      await upload(file);
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleUrlSubmit = async () => {
    if (!url) return;
    try {
      await ingestUrl(url);
    } catch (e) {
      // Error handled by hook
    }
  };

  const cancelUpload = () => {
    reset();
    setFileDetails(null);
  };

  return (
    <div className="flex items-center justify-center pt-16 pb-12 px-6">
      <div className="w-full max-w-[560px] flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-[30px] font-semibold text-zinc-50 tracking-tight leading-tight">Upload your video</h1>
          <p className="text-sm text-zinc-400">Supports MP4, MOV, MKV, WebM up to 500 MB</p>
        </div>

        {isUploading && fileDetails ? (
          <UploadProgress 
            progress={progress} 
            filename={fileDetails.name} 
            filesize={fileDetails.size} 
            onCancel={cancelUpload} 
          />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
            <DropZone onFile={handleFile} disabled={isUploading} />

            <div className="flex items-center gap-4">
              <div className="h-px flex-grow bg-zinc-800" />
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">or</span>
              <div className="h-px flex-grow bg-zinc-800" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 block ml-1">Import from URL</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="url" 
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm disabled:opacity-50"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <button 
                  onClick={handleUrlSubmit}
                  disabled={!url || isUploading}
                  className="bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  Import
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-4 border-t border-zinc-800/50">
              <Clock className="w-4 h-4 text-zinc-500" />
              <p className="text-sm text-zinc-500">Clips are ready in ~2–5 minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
