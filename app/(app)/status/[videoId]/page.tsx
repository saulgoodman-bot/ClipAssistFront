'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ArrowRight, AlertCircle, FileText, ChevronDown } from 'lucide-react';
import { useVideoStatus } from '@/hooks/useVideo';
import { PipelineStep } from '@/components/status/PipelineStep';
import { useQuery } from '@tanstack/react-query';
import { ClipAssistAPI } from '@/lib/api';

export default function StatusPage({ params }: { params: Promise<{ videoId: string }> }) {
  const resolvedParams = use(params);
  const videoId = parseInt(resolvedParams.videoId, 10);
  
  const { 
    status, progressStage, duration, isComplete, isFailed, errorMessage 
  } = useVideoStatus(videoId);

  const { data: transcript } = useQuery({
    queryKey: ['transcript', videoId],
    queryFn: () => ClipAssistAPI.getTranscript(videoId),
    enabled: !!videoId && (status === 'completed' || progressStage === 'analyzing' || progressStage === 'rendering'),
  });

  // Derived state mapping
  // Map progressStage to step states
  // "metadata" -> 1 active
  // "extracting_audio" -> 1 done, 2 active
  // "transcribing" -> 2 active (actually extracting is done, transcribing active)
  // "analyzing" -> 3 active
  // "rendering" -> 4 active
  // "completed" -> all done

  const getStepState = (stepIndex: number): 'pending' | 'active' | 'done' | 'failed' => {
    if (isFailed) return 'failed';
    if (isComplete) return 'done';

    const stageMap: Record<string, number> = {
      'metadata': 0,
      'extracting_audio': 1,
      'transcribing': 2,
      'analyzing': 3,
      'rendering': 4,
      'completed': 5
    };

    const currentStageIndex = stageMap[progressStage || 'metadata'] || 0;

    if (stepIndex < currentStageIndex) return 'done';
    if (stepIndex === currentStageIndex) return 'active';
    return 'pending';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pt-8 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors group">
            <ArrowLeft className="w-5 h-5 group-active:scale-90 transition-transform" />
            <span className="text-sm font-medium">Back to Projects</span>
          </Link>
        </div>

        {/* Video Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">Video #{videoId}</h1>
              <p className="text-sm text-zinc-500">Processing • Uploaded just now</p>
            </div>
            
            {!isComplete && !isFailed && (
              <div className="bg-amber-950/30 border border-amber-900/50 text-amber-500 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-medium">Processing</span>
              </div>
            )}
            {isComplete && (
              <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 px-3 py-1 rounded-full flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Completed</span>
              </div>
            )}
            {isFailed && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-500 px-3 py-1 rounded-full flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Failed</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-500">Duration</span>
              <span className="text-base text-zinc-200">{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stepper */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-zinc-100">Processing Pipeline</h3>
          
          <div className="flex flex-col">
            <PipelineStep 
              label="Extracting audio" 
              sublabel={getStepState(1) === 'done' ? 'Complete' : 'Working...'} 
              state={getStepState(1)} 
              iconType="extracting"
            />
            <PipelineStep 
              label="Transcribing speech" 
              sublabel={getStepState(2) === 'active' ? 'Analyzing...' : getStepState(2) === 'done' ? 'Complete' : 'Pending'} 
              state={getStepState(2)}
              iconType="transcribing"
            />
            <PipelineStep 
              label="Analyzing content &amp; selecting best clips" 
              sublabel={getStepState(3) === 'active' ? 'Finding highlights...' : getStepState(3) === 'done' ? 'Complete' : 'Pending'} 
              state={getStepState(3)}
              iconType="analyzing"
            />
            <PipelineStep 
              label="Rendering vertical clips" 
              sublabel={getStepState(4) === 'active' ? 'Waiting...' : getStepState(4) === 'done' ? 'Complete' : 'Pending'} 
              state={getStepState(4)}
              iconType="rendering"
            />
          </div>
        </div>

        {/* Transcript Preview */}
        {transcript && transcript.segments.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <button className="w-full p-6 flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-100">Transcript preview</span>
              </div>
              <ChevronDown className="w-5 h-5 text-zinc-500" />
            </button>
            <div className="px-6 pb-6 pt-2">
              <div className="bg-zinc-950 p-4 rounded border border-zinc-800 font-mono text-[13px] text-zinc-300 h-32 overflow-y-auto">
                {transcript.segments.map((seg, i) => (
                  <p key={i} className="mb-2">
                    <span className="text-zinc-500 mr-2">[{formatDuration(seg.start)}]</span>
                    &quot;{seg.text}&quot;
                  </p>
                ))}
                {!isComplete && (
                  <div className="flex items-center gap-2 mt-4 text-zinc-500">
                    <span className="w-1.5 h-4 bg-indigo-500 animate-pulse inline-block"></span>
                    Processing live...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complete State */}
        {isComplete && (
          <div className="relative bg-indigo-500/10 border-2 border-indigo-500/50 rounded-xl p-6 overflow-hidden group mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="bg-indigo-500 text-zinc-950 rounded-full p-2 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold text-indigo-100 tracking-tight">Processing Complete!</h3>
                  <p className="text-sm text-indigo-300/80">Clips have been generated and are ready for review.</p>
                </div>
              </div>
              
              <Link 
                href={`/clips/${videoId}`}
                className="bg-indigo-500 hover:bg-indigo-400 text-zinc-950 px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 active:scale-95 shrink-0 whitespace-nowrap"
              >
                View Clips
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {isFailed && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 flex flex-col gap-4 mt-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-7 h-7 text-red-500 shrink-0" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-red-500">Processing Error</h3>
                <p className="text-sm text-red-200/70">{errorMessage || 'We encountered an error processing the video.'}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <Link
                href="/upload"
                className="bg-red-900/50 text-red-300 px-4 py-2 rounded text-sm font-medium hover:bg-red-900/80 transition-colors"
              >
                Upload Again
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
