import { Check, Loader2, Hourglass, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PipelineStepProps {
  label: string;
  sublabel: string;
  state: 'pending' | 'active' | 'done' | 'failed';
  isLast?: boolean;
}

export function PipelineStep({ label, sublabel, state, isLast }: PipelineStepProps) {
  return (
    <div className={cn("relative flex gap-md pb-xs", !isLast && "step-line")}>
      {!isLast && (
        <div className="absolute left-[11px] top-[24px] bottom-[-8px] w-[2px] bg-zinc-800 hidden sm:block"></div>
      )}
      
      {state === 'done' && (
        <div className="z-10 bg-indigo-500 text-zinc-950 rounded-full w-6 h-6 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}
      
      {state === 'active' && (
        <div className="z-10 bg-indigo-500/20 text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center shrink-0 border border-indigo-500 relative">
          <div className="absolute inset-0 rounded-full pulse-indigo"></div>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      )}
      
      {state === 'pending' && (
        <div className="z-10 bg-zinc-800 text-zinc-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0 border border-zinc-700">
           <Hourglass className="w-3 h-3" />
        </div>
      )}

      {state === 'failed' && (
        <div className="z-10 bg-red-500/20 text-red-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0 border border-red-500">
           <XCircle className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="flex flex-col">
        <span className={cn(
          "font-label-md text-label-md",
          state === 'done' ? "text-zinc-200" : 
          state === 'active' ? "text-indigo-400 font-bold" :
          state === 'failed' ? "text-red-400" : "text-zinc-500"
        )}>
          {label}
        </span>
        <span className={cn(
          "font-body-sm text-body-sm",
          state === 'done' ? "text-zinc-500" :
          state === 'active' ? "text-zinc-400" :
          state === 'failed' ? "text-red-400/80" : "text-zinc-600"
        )}>
          {sublabel}
        </span>
      </div>
    </div>
  );
}
