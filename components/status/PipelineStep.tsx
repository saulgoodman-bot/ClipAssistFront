'use client';

import { Check, Loader2, X, Hourglass, Film, AlignEndVertical, MonitorPlay } from 'lucide-react';

interface PipelineStepProps {
  label: string;
  sublabel: string;
  state: 'pending' | 'active' | 'done' | 'failed';
  iconType?: string; // used for custom icons if not done/failed
}

export function PipelineStep({ label, sublabel, state, iconType }: PipelineStepProps) {
  const getIcon = () => {
    if (state === 'done') return <Check className="w-4 h-4" />;
    if (state === 'failed') return <X className="w-4 h-4" />;
    if (state === 'active') return <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />;
    
    // Pending icons based on general label
    if (iconType === 'extracting') return <Film className="w-4 h-4" />;
    if (iconType === 'transcribing') return <Hourglass className="w-4 h-4" />;
    if (iconType === 'analyzing') return <Hourglass className="w-4 h-4" />;
    if (iconType === 'selecting') return <MonitorPlay className="w-4 h-4" />;
    if (iconType === 'rendering') return <AlignEndVertical className="w-4 h-4" />;

    return <Hourglass className="w-4 h-4" />;
  };

  const ringClass = () => {
    if (state === 'done') return 'bg-indigo-500 text-zinc-950 border-transparent';
    if (state === 'failed') return 'bg-red-500 text-zinc-950 border-transparent';
    if (state === 'active') return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500 shadow-[0_0_0_0_rgba(99,102,241,0.4)] animate-[pulse_2s_infinite]';
    return 'bg-zinc-800 text-zinc-500 border border-zinc-700';
  };

  const textClass = () => {
    if (state === 'active') return 'text-indigo-400 font-medium';
    if (state === 'done') return 'text-zinc-200 font-medium';
    if (state === 'failed') return 'text-red-400 font-medium';
    return 'text-zinc-500 font-medium';
  };

  return (
    <div className="relative flex gap-4 pb-4">
      {/* Connector line (drawn via CSS ideally, or manually checking if not last child in parent) */}
      <div className="absolute left-3 top-6 bottom-0 w-px bg-zinc-800 -translate-x-[0.5px] last:hidden" style={{ zIndex: 0 }} />
      
      <div className={`z-10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 ${ringClass()} mt-1 relative bg-zinc-900`}>
        {getIcon()}
      </div>
      <div className="flex flex-col pt-1 relative bg-zinc-900/0">
        <span className={`text-sm ${textClass()}`}>{label}</span>
        <span className={`text-sm ${state === 'active' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {sublabel}
        </span>
      </div>
    </div>
  );
}
