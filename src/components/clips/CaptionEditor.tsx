import { useState, useEffect } from 'react';
import { TranscriptSegment } from '../../types/api';
import { cn } from '../../lib/utils';

interface CaptionEditorProps {
  segments: TranscriptSegment[];
  clipStart: number;
  clipEnd: number;
  onUpdate: (segments: TranscriptSegment[]) => void;
}

const PRESETS = ['Default', 'Bold', 'Minimal', 'Neon'];

export function CaptionEditor({ segments, clipStart, clipEnd, onUpdate }: CaptionEditorProps) {
  const [stylePreset, setStylePreset] = useState('Default');
  const [localSegments, setLocalSegments] = useState<TranscriptSegment[]>([]);

  useEffect(() => {
    // Filter segments
    const filtered = segments.filter(s => 
      (s.start >= clipStart && s.start <= clipEnd) || 
      (s.end >= clipStart && s.end <= clipEnd) ||
      (s.start <= clipStart && s.end >= clipEnd)
    );
    setLocalSegments(JSON.parse(JSON.stringify(filtered)));
  }, [segments, clipStart, clipEnd]);

  const handleChange = (index: number, newText: string) => {
    const updated = [...localSegments];
    updated[index] = { ...updated[index], text: newText };
    setLocalSegments(updated);
  };

  const handleBlur = () => {
    onUpdate(localSegments);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 p-1 bg-zinc-950 rounded-lg w-fit">
        {PRESETS.map(preset => (
          <button
            key={preset}
            onClick={() => setStylePreset(preset)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-label-md transition-colors",
              stylePreset === preset 
                ? "bg-zinc-800 text-zinc-100" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {localSegments.map((seg, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col shrink-0 text-[10px] font-code text-zinc-500 bg-zinc-950 p-1.5 rounded min-w-[50px] items-center justify-center">
              <span>{seg.start.toFixed(1)}</span>
              <span className="text-zinc-700">-</span>
              <span>{seg.end.toFixed(1)}</span>
            </div>
            <textarea
              value={seg.text}
              onChange={(e) => handleChange(idx, e.target.value)}
              onBlur={handleBlur}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800/50 rounded p-2 text-zinc-300 font-body-sm focus:outline-none focus:border-indigo-500/50 resize-none font-sans"
            />
          </div>
        ))}
        {localSegments.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-4">No speech detected in this time range.</p>
        )}
      </div>
    </div>
  );
}
