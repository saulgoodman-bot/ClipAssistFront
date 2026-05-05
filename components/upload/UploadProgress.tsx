'use client';

import { X, Film } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  filename: string;
  filesize?: string; // e.g., '42.8 MB'
  onCancel: () => void;
}

export function UploadProgress({ progress, filename, filesize, onCancel }: UploadProgressProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
            <Film className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-200 text-sm font-medium">{filename}</span>
            {filesize && <span className="text-zinc-500 text-xs font-medium">{filesize}</span>}
          </div>
        </div>
        <button onClick={onCancel} className="text-zinc-500 hover:text-red-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-medium text-zinc-400">
          <span>Uploading...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
