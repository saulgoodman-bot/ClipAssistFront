import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipAssistAPI } from '../lib/api';
import { ClipUpdateRequest } from '../types/api';

export function useClips(videoId: number) {
  const queryClient = useQueryClient();
  const [selectedClipId, setSelectedClipId] = useState<number | null>(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['clips', videoId],
    queryFn: () => ClipAssistAPI.getClips(videoId),
    enabled: !!videoId,
  });

  const selectedClip = clips.find(c => c.id === selectedClipId) || clips[0] || null;

  const selectClip = (id: number) => {
    setSelectedClipId(id);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClipUpdateRequest }) => 
      ClipAssistAPI.updateClip(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips', videoId] });
    },
  });

  const renderMutation = useMutation({
    mutationFn: (id: number) => ClipAssistAPI.renderClip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips', videoId] });
    },
  });

  const downloadClip = async (id: number) => {
    try {
      const url = await ClipAssistAPI.downloadClip(id);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clip-${id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  return {
    clips,
    selectedClip,
    selectClip,
    updateClip: async (id: number, data: ClipUpdateRequest) => { await updateMutation.mutateAsync({ id, data }); },
    renderClip: async (id: number) => { await renderMutation.mutateAsync(id); },
    downloadClip,
    isUpdating: updateMutation.isPending,
    isRendering: renderMutation.isPending,
  };
}
