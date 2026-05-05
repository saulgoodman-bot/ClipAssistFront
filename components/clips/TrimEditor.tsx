'use client';

import { useState, useEffect } from 'react';
import { ClipResponse } from '@/types/api';

interface TrimEditorProps {
  clip: ClipResponse;
  videoDuration: number;
  onSave: (start: number, end: number) => void;
  disabled?: boolean;
}

export function TrimEditor({ clip, videoDuration, onSave, disabled }: TrimEditorProps) {
  const [start, setStart] = useState(clip.start_time);
  const [end, setEnd] = useState(clip.end_time);

  const duration = (end - start).toFixed(1);
  const isValid = end > start && (end - start) >= 10 && (end - start) <= 120 && start >= 0 && end <= videoDuration;
  const isChanged = start !== clip.start_time || end !== clip.end_time;

  // deterministic hash for fake waveform
  const getHash = (i: number) => (((i * 9301 + 49297) % 233280) / 233280);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <label className="text-sm text-zinc-400">Start (s)</label>
        <input 
          type="number" 
          step="0.1"
          min="0"
          max={end - 10}
          value={start}
          onChange={(e) => setStart(parseFloat(e.target.value) || 0)}
          className="w-24 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
        />
        
        <label className="text-sm text-zinc-400">End (s)</label>
        <input 
          type="number" 
          step="0.1"
          min={start + 10}
          max={videoDuration || 999}
          value={end}
          onChange={(e) => setEnd(parseFloat(e.target.value) || 0)}
          className="w-24 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
        />

        <div className="ml-auto text-sm bg-zinc-800 px-3 py-1 rounded-full text-zinc-200 font-mono">
          {duration}s
        </div>
      </div>

      {!isValid && (
        <p className="text-red-400 text-xs">Duration must be between 10 and 120 seconds.</p>
      )}

      {/* Waveform placeholder */}
      <div className="h-16 bg-zinc-900 border border-zinc-800 rounded relative overflow-hidden flex items-center justify-around opacity-50 px-2">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="w-1.5 bg-zinc-700 rounded-full" style={{ height: `${getHash(i) * 80 + 20}%` }} />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSave(start, end)}
          disabled={!isValid || !isChanged || disabled}
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          Save trim
        </button>
      </div>
    </div>
  );
}
