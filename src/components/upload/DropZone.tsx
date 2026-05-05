import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { CloudUpload, Link as LinkIcon, Download } from 'lucide-react';

interface DropZoneProps {
  onFile: (file: File) => void;
  onUrlIngest: (url: string) => void;
  disabled?: boolean;
}

export function DropZone({ onFile, onUrlIngest, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelectFile = (file: File) => {
    setError(null);
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Supports MP4, MOV, MKV, WebM.');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('File is too large. Max size is 500 MB.');
      return;
    }
    onFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-lg space-y-lg shadow-2xl relative overflow-hidden">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl bg-zinc-950 p-xl flex flex-col items-center justify-center text-center space-y-md transition-colors",
          isDragOver ? "border-indigo-500/80 bg-indigo-500/5" : "border-zinc-700 hover:border-indigo-500/50 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed hover:border-zinc-700"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
          <CloudUpload className="w-8 h-8" />
        </div>
        <div className="space-y-xs">
          <p className="font-label-md text-label-md text-zinc-200">Drag and drop your video here</p>
          <p className="font-body-sm text-body-sm text-zinc-500 italic">or</p>
        </div>
        <button 
          disabled={disabled}
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-indigo-600 transition-colors active:scale-95 disabled:hover:bg-indigo-500"
        >
          Browse files
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".mp4,.mov,.mkv,.webm" 
          onChange={handleFileInput}
          disabled={disabled}
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex items-center gap-md">
        <div className="h-px flex-grow bg-zinc-800"></div>
        <span className="text-zinc-500 text-label-sm font-label-sm uppercase tracking-widest">or</span>
        <div className="h-px flex-grow bg-zinc-800"></div>
      </div>

      <div className="space-y-sm">
        <label className="font-label-sm text-label-sm text-zinc-400 block ml-1">Import from URL</label>
        <div className="flex gap-sm">
          <div className="relative flex-grow">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={disabled}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-body-base text-body-base disabled:opacity-50 disabled:cursor-not-allowed" 
              placeholder="https://youtube.com/watch?v=..." 
            />
          </div>
          <button 
            disabled={disabled || !url.trim()}
            onClick={() => onUrlIngest(url)}
            className="bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-indigo-600 transition-colors flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
