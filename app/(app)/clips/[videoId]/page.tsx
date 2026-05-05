'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Download, Settings, Layout, AlignLeft, RefreshCw, Scissors } from 'lucide-react';
import { useClips } from '@/hooks/useClips';
import { useQuery } from '@tanstack/react-query';
import { ClipAssistAPI } from '@/lib/api';
import { TrimEditor } from '@/components/clips/TrimEditor';
import { CaptionEditor } from '@/components/clips/CaptionEditor';

export default function ClipsPage({ params }: { params: Promise<{ videoId: string }> }) {
  const resolvedParams = use(params);
  const videoId = parseInt(resolvedParams.videoId, 10);
  
  const { 
    clips, 
    selectedClip, 
    selectClip, 
    updateClip, 
    renderClip, 
    downloadClip, 
    isUpdating, 
    isRendering 
  } = useClips(videoId);

  const { data: transcript } = useQuery({
    queryKey: ['transcript', videoId],
    queryFn: () => ClipAssistAPI.getTranscript(videoId),
    enabled: !!videoId,
  });

  const { data: statusResp } = useQuery({
    queryKey: ['status', videoId],
    queryFn: () => ClipAssistAPI.getStatus(videoId),
    enabled: !!videoId,
  });

  if (!clips.length) {
    return (
      <div className="flex h-full items-center justify-center pt-24 text-zinc-500">
        Loading clips or no clips available yet...
      </div>
    );
  }

  const handleTrimSave = async (start: number, end: number) => {
    if (selectedClip) {
      await updateClip(selectedClip.id, { start_time: start, end_time: end });
    }
  };

  const handleTitleSave = async (title: string) => {
    if (selectedClip) {
      await updateClip(selectedClip.id, { title });
    }
  };

  const handleLayoutToggle = async (mode: string) => {
    if (selectedClip && selectedClip.layout_mode !== mode) {
      await updateClip(selectedClip.id, { layout_mode: mode });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Sidebar - Clips List */}
      <aside className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-64px)] overflow-hidden shrink-0 fixed top-16 left-0 bottom-0 z-10 md:static">
        <div className="p-4 border-b border-zinc-800">
          <Link href={`/status/${videoId}`} className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to status</span>
          </Link>
          <h2 className="text-lg font-semibold text-zinc-50">Generated Clips</h2>
          <p className="text-sm text-zinc-500">{clips.length} clips found</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {clips.map(clip => (
            <div 
              key={clip.id}
              onClick={() => selectClip(clip.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedClip?.id === clip.id
                  ? 'bg-zinc-900 border-indigo-500/50'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="font-medium text-sm text-zinc-200 mb-1 line-clamp-2" title={clip.title}>
                {clip.title || `Clip ${clip.id}`}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                  Score: {clip.score}/10
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {(clip.end_time - clip.start_time).toFixed(0)}s
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content - Selected Clip Editor */}
      <main className="flex-1 p-6 md:pl-80 bg-zinc-950 flex justify-center">
        {selectedClip ? (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end border-b border-zinc-800 pb-4">
              <div className="w-full">
                <input
                  type="text"
                  defaultValue={selectedClip.title}
                  onBlur={(e) => handleTitleSave(e.target.value)}
                  className="bg-transparent border-b border-transparent focus:border-indigo-500/50 hover:border-zinc-800 w-full text-2xl font-semibold text-zinc-50 outline-none pb-1 transition-colors"
                  placeholder="Clip Title"
                />
                <p className="text-sm text-zinc-500 mt-1">{selectedClip.reason}</p>
              </div>

              <div className="flex gap-3 shrink-0 mt-4 md:mt-0 w-full justify-end md:w-auto">
                <button
                  onClick={() => renderClip(selectedClip.id)}
                  disabled={isRendering || selectedClip.status === 'rendering'}
                  className="bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {(isRendering || selectedClip.status === 'rendering') ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Render Clip
                </button>

                <button
                  onClick={() => downloadClip(selectedClip.id)}
                  disabled={selectedClip.status !== 'ready' && selectedClip.status !== 'completed'}
                  className="bg-indigo-500 hover:bg-indigo-400 text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:bg-indigo-500/20 disabled:text-indigo-500"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-0">
              
              {/* Left Column: Player & Layout */}
              <div className="space-y-6">
                <div className="aspect-[9/16] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative shadow-2xl mx-auto w-full max-w-sm">
                  {/* Fake Player */}
                  <Play className="w-12 h-12 text-zinc-700 absolute opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 w-full text-center px-4 font-bold text-white uppercase tracking-wider text-xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    CAPTION PREVIEW
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-medium pb-2 border-b border-zinc-800">
                    <Layout className="w-4 h-4" />
                    Layout Mode
                  </div>
                  <div className="flex gap-2">
                    {['Split', 'Fullscreen', 'Facecam'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => handleLayoutToggle(mode)}
                        className={`flex-1 py-2 rounded border text-sm font-medium transition-colors ${
                          selectedClip.layout_mode === mode
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Editor Tools */}
              <div className="space-y-6">
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-medium pb-2 border-b border-zinc-800">
                    <Scissors className="w-4 h-4" />
                    Trim Editor
                  </div>
                  <TrimEditor 
                    key={selectedClip.id}
                    clip={selectedClip} 
                    videoDuration={statusResp?.duration || 999}
                    onSave={handleTrimSave}
                    disabled={isUpdating}
                  />
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-medium pb-2 border-b border-zinc-800">
                    <AlignLeft className="w-4 h-4" />
                    Captions &amp; Styling
                  </div>
                  {transcript && transcript.segments.length > 0 ? (
                    <CaptionEditor
                      segments={[...transcript.segments]}
                      clipStart={selectedClip.start_time}
                      clipEnd={selectedClip.end_time}
                      onUpdate={() => {}} // dummy update
                      disabled={isUpdating}
                    />
                  ) : (
                    <div className="text-sm text-zinc-500 py-4 text-center">
                      Transcript not available for this video.
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="text-zinc-500 self-center">Select a clip to edit</div>
        )}
      </main>
    </div>
  );
}
