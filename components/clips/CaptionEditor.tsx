'use client';

import { useState } from 'react';
import { TranscriptSegment } from '@/types/api';

interface CaptionEditorProps {
  segments: TranscriptSegment[];
  clipStart: number;
  clipEnd: number;
  onUpdate: (segments: TranscriptSegment[]) => void;
  disabled?: boolean;
}

export function CaptionEditor({ segments, clipStart, clipEnd, onUpdate, disabled }: CaptionEditorProps) {
  const [captionStyle, setCaptionStyle] = useState('Default');

  // Filter segments to only show ones inside the clip
  const clipSegments = segments.filter(s => s.start >= clipStart && s.start <= clipEnd);

  const handleTextChange = (index: number, newText: string) => {
    // We create a new array mapped correctly back to the original if possible,
    // but for simplicity in UI, we just fire onUpdate.
    // In a real app we'd map this back to the global segments.
    // Here we just modify the local copy and emit it.
    const newSegments = [...segments];
    const targetSegment = clipSegments[index];
    const globalIndex = segments.findIndex(s => s === targetSegment);
    
    if (globalIndex !== -1) {
      newSegments[globalIndex] = { ...newSegments[globalIndex], text: newText };
      onUpdate(newSegments);
    }
  };

  const formatTime = (seconds: number) => {
    const s = seconds.toFixed(1);
    return `${s}s`;
  };

  return (
    <div className="space-y-4">
      {/* Style Presets */}
      <div className="flex gap-2">
        {['Default', 'Bold', 'Minimal', 'Neon'].map(style => (
          <button
            key={style}
            onClick={() => setCaptionStyle(style)}
            disabled={disabled}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              captionStyle === style
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-h-64 overflow-y-auto p-4 space-y-3">
        {clipSegments.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-4">No spoken content found in this clip interval.</p>
        )}
        
        {clipSegments.map((segment, idx) => (
          <div key={idx} className="flex gap-3 items-start group">
            <div className="flex flex-col gap-1 items-end shrink-0 mt-1">
              <span className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {formatTime(segment.start)}
              </span>
            </div>
            
            <input
              type="text"
              value={segment.text}
              onChange={(e) => handleTextChange(idx, e.target.value)}
              disabled={disabled}
              className="bg-transparent border-b border-transparent focus:border-indigo-500/50 hover:border-zinc-700 w-full text-zinc-200 text-sm outline-none px-1 py-0.5 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
