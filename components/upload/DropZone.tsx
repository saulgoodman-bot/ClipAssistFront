'use client';

import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFile, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcess = (file: File) => {
    setError('');
    
    // Check file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Supports MP4, MOV, MKV, WebM.');
      return;
    }

    // Check size (<= 500 MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('File size exceeds 500 MB limit.');
      return;
    }

    onFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) validateAndProcess(file);
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 transition-colors cursor-pointer group ${
          isDragOver 
            ? 'border-indigo-500 bg-indigo-500/5' 
            : 'border-zinc-700 bg-zinc-950 hover:border-indigo-500/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndProcess(file);
          }}
        />
        
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <div className="space-y-1">
          <p className="font-medium text-sm text-zinc-200">Drag and drop your video here</p>
          <p className="text-sm text-zinc-500 italic">or</p>
        </div>
        
        <button 
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors active:scale-95 disabled:pointer-events-none"
          disabled={disabled}
        >
          Browse files
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center font-medium">{error}</p>
      )}
    </div>
  );
}
