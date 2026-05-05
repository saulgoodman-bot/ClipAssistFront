import { useState } from 'react';
import { ClipResponse } from '../../types/api';

interface TrimEditorProps {
  clip: ClipResponse;
  videoDuration: number;
  onSave: (start: number, end: number) => void;
}

export function TrimEditor({ clip, videoDuration, onSave }: TrimEditorProps) {
  const [start, setStart] = useState(clip.start_time);
  const [end, setEnd] = useState(clip.end_time);

  const duration = Math.max(0, Number((end - start).toFixed(1)));
  const isValid = duration >= 10 && duration <= 120 && start >= 0 && end <= videoDuration && start < end;
  const isChanged = start !== clip.start_time || end !== clip.end_time;

  return (
    <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-100 font-label-md">Trim Clip</h3>
        <span className="text-zinc-400 font-code text-sm">{duration}s selected</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Start Time (sec)</label>
          <input 
            type="number" 
            step="0.1"
            min="0"
            max={end}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500 font-code"
          />
        </div>
        <div>
          <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">End Time (sec)</label>
          <input 
            type="number" 
            step="0.1"
            min={start}
            max={videoDuration}
            value={end}
            onChange={(e) => setEnd(Number(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500 font-code"
          />
        </div>
      </div>

      {!isValid && (
        <p className="text-red-400 text-xs">Duration must be between 10 and 120 seconds.</p>
      )}

      {/* Waveform Placeholder Strip */}
      <div className="relative h-12 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-end opacity-50 px-1 py-1 gap-0.5">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="flex-1 bg-zinc-700 rounded-sm" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button 
          disabled={!isValid || !isChanged}
          onClick={() => onSave(start, end)}
          className="bg-indigo-500 text-white px-4 py-2 rounded font-label-md hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save trim
        </button>
      </div>
    </div>
  );
}
