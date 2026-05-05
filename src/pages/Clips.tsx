import { useParams, Link } from 'react-router-dom';
import { useClips } from '../hooks/useClips';
import { TrimEditor } from '../components/clips/TrimEditor';
import { CaptionEditor } from '../components/clips/CaptionEditor';
import { ArrowLeft, Loader2, Download, PlayCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ClipAssistAPI } from '../lib/api';

export function Clips() {
  const { videoId } = useParams();
  const id = parseInt(videoId || '0', 10);
  
  const { clips, selectedClip, selectClip, updateClip, renderClip, downloadClip, isRendering, isUpdating } = useClips(id);

  const { data: transcript, isLoading: transcriptLoading } = useQuery({
    queryKey: ['transcript', id],
    queryFn: () => ClipAssistAPI.getTranscript(id),
    enabled: !!id,
  });

  return (
    <div className="w-full flex-grow flex gap-6 mx-auto mt-4 max-w-6xl">
      {/* Sidebar: Clip List */}
      <div className="w-80 shrink-0 flex flex-col gap-4 border-r border-zinc-800 pr-6">
        <Link to={`/status/${id}`} className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Status</span>
        </Link>
        
        <h2 className="text-xl font-bold mt-4 tracking-tight">Generated Clips</h2>
        
        <div className="flex flex-col gap-3">
          {clips.map(clip => (
            <button 
              key={clip.id}
              onClick={() => selectClip(clip.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedClip?.id === clip.id 
                  ? 'bg-zinc-900 border-indigo-500/50 relative overflow-hidden' 
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col gap-1 relative z-10">
                <span className="font-semibold text-sm truncate">{clip.title || `Clip ${clip.id}`}</span>
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Score: {clip.score}/100</span>
                  <span className="px-2 py-0.5 bg-zinc-800 rounded uppercase tracking-wider text-[10px]">{clip.status}</span>
                </div>
              </div>
            </button>
          ))}
          {clips.length === 0 && (
            <p className="text-sm text-zinc-500">No clips found.</p>
          )}
        </div>
      </div>

      {/* Main Area: Editor */}
      <div className="flex-grow flex flex-col min-w-0">
        {selectedClip ? (
          <div className="flex flex-col gap-8 pb-12">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{selectedClip.title || `Clip ${selectedClip.id}`}</h1>
                <p className="text-sm text-zinc-400 mt-1">{selectedClip.reason}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => renderClip(selectedClip.id)}
                  disabled={isRendering}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isRendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  Render
                </button>
                <button
                  onClick={() => downloadClip(selectedClip.id)}
                  disabled={selectedClip.status !== 'ready' && selectedClip.status !== 'completed'}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="aspect-[9/16] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center max-h-[600px] shadow-2xl relative overflow-hidden">
                 {/* Video Preview Sandbox placeholder */}
                 {selectedClip.s3_path ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <p className="text-zinc-500 text-xs text-center px-4">Video preview would render here<br/>{selectedClip.s3_path}</p>
                    </div>
                 ) : (
                    <p className="text-zinc-500 text-sm">Preview rendering...</p>
                 )}
                 <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur rounded p-2 text-center text-xs text-white">
                   {selectedClip.status === 'rendering' ? 'Rendering...' : 'Preview Ready'}
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                 <div>
                   <h3 className="text-lg font-semibold mb-3">Timeline</h3>
                   <TrimEditor 
                     clip={selectedClip} 
                     videoDuration={1000} // Mock total duration, API doesn't return full duration here easily unless mapped
                     onSave={async (start, end) => {
                       await updateClip(selectedClip.id, { start_time: start, end_time: end });
                     }}
                   />
                 </div>

                 <div>
                   <h3 className="text-lg font-semibold mb-3">Captions</h3>
                   {transcriptLoading ? (
                     <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
                   ) : (
                     <CaptionEditor 
                       segments={(transcript as any)?.segments || []} 
                       clipStart={selectedClip.start_time}
                       clipEnd={selectedClip.end_time}
                       onUpdate={() => {}} // Could be extended to update transcript edits using backend API
                     />
                   )}
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-zinc-500">
            Select a clip to start editing
          </div>
        )}
      </div>
    </div>
  );
}
