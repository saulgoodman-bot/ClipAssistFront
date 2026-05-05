import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVideoStatus } from '../hooks/useVideo';
import { PipelineStep } from '../components/status/PipelineStep';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

function getPipelineStates(progressStage?: string, status?: string) {
  //  "metadata"          → step 1 active
  //  "extracting_audio"  → step 1 done, step 2 active
  //  "transcribing"      → step 2 active
  //  "analyzing"         → step 2 done, step 3 active
  //  "rendering"         → steps 1-4 done, step 5 active
  //  "completed"         → all done

  const states = {
    metadata: 'pending',
    extracting: 'pending',
    transcribing: 'pending',
    analyzing: 'pending',
    clip_selection: 'pending',
    rendering: 'pending',
    done: 'pending'
  };

  if (status === 'failed') {
    return { ...states, metadata: 'failed' }; // simplistic for now
  }

  if (status === 'completed') {
    return { metadata: 'done', extracting: 'done', transcribing: 'done', analyzing: 'done', clip_selection: 'done', rendering: 'done', done: 'done' };
  }

  if (progressStage === 'metadata') {
    states.metadata = 'active';
  } else if (progressStage === 'extracting_audio') {
    states.metadata = 'done';
    states.extracting = 'active';
  } else if (progressStage === 'transcribing') {
    states.metadata = 'done';
    states.extracting = 'done';
    states.transcribing = 'active';
  } else if (progressStage === 'analyzing') {
    states.metadata = 'done';
    states.extracting = 'done';
    states.transcribing = 'done';
    states.analyzing = 'active';
  } else if (progressStage === 'rendering') {
    states.metadata = 'done';
    states.extracting = 'done';
    states.transcribing = 'done';
    states.analyzing = 'done';
    states.clip_selection = 'done';
    states.rendering = 'active';
  }

  return states as Record<string, "pending" | "active" | "done" | "failed">;
}

export function Status() {
  const { videoId } = useParams();
  const id = parseInt(videoId || '0', 10);
  const navigate = useNavigate();
  const { status, progressStage, isComplete, isFailed, errorMessage, duration } = useVideoStatus(id);

  const pStates = getPipelineStates(progressStage, status);

  const formatDuration = (d?: number) => {
    if (!d) return '--:--';
    const m = Math.floor(d / 60);
    const s = Math.floor(d % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6 mx-auto mt-4">
      <div className="flex items-center">
        <Link to="/upload" className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-active:scale-90 transition-transform" />
          <span className="font-label-md text-sm">Back to Projects</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Video Processing</h1>
            <p className="text-sm text-zinc-500">ID: {id}</p>
          </div>
          {status === 'processing' && (
            <div className="bg-amber-950/30 border border-amber-900/50 text-amber-400 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs font-medium uppercase tracking-widest">Processing</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-500">Duration</span>
            <span className="text-base text-zinc-200">{formatDuration(duration)}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-xs font-medium text-zinc-500">Video Quality</span>
             <span className="text-base text-zinc-200">Source</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 flex flex-col gap-8">
        <h3 className="text-lg font-semibold text-zinc-100">Processing Pipeline</h3>
        <div className="flex flex-col gap-4">
          <PipelineStep label="Extracting data" sublabel="Metadata" state={pStates.metadata} />
          <PipelineStep label="Extracting audio" sublabel="Processing track" state={pStates.extracting} />
          <PipelineStep label="Transcribing speech" sublabel="AI Analysis" state={pStates.transcribing} />
          <PipelineStep label="Analyzing content" sublabel="Finding highlights" state={pStates.analyzing} />
          <PipelineStep label="Selecting best clips" sublabel="Curating" state={pStates.clip_selection} />
          <PipelineStep label="Rendering vertical clips" sublabel="Generating MP4" state={pStates.rendering} />
          <PipelineStep label="Done" sublabel="" state={pStates.done} isLast />
        </div>
      </div>

      {isComplete && (
        <div className="bg-indigo-500/10 border-2 border-indigo-500/50 rounded-xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 text-zinc-950 rounded-full p-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-indigo-100">Processing Complete!</h3>
                <p className="text-sm text-indigo-300/80">Clips have been generated and are ready.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/clips/${id}`)}
              className="bg-indigo-500 hover:bg-indigo-400 text-zinc-950 px-6 py-3 rounded-lg font-medium transition-all active:scale-95 whitespace-nowrap"
            >
              View Clips
            </button>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-7 h-7 text-red-500 shrink-0" />
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-red-500">Processing Error</h3>
              <p className="text-sm text-red-400/80">{errorMessage || 'An unknown error occurred during processing.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
