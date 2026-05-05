import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropZone } from '../components/upload/DropZone';
import { UploadProgress } from '../components/upload/UploadProgress';
import { useVideoUpload } from '../hooks/useVideoUpload';

export function Upload() {
  const navigate = useNavigate();
  const { upload, ingestUrl, progress, isUploading, error, reset } = useVideoUpload();
  const [filename, setFilename] = useState('');

  const handleFile = async (file: File) => {
    setFilename(file.name);
    try {
      const vid = await upload(file);
      navigate(`/status/${vid}`);
    } catch (e) {
      // error is handled by hook
    }
  };

  const handleUrl = async (url: string) => {
    setFilename(url);
    try {
      const vid = await ingestUrl(url);
      navigate(`/status/${vid}`);
    } catch (e) {
      // error handled by hook
    }
  };

  const handleCancel = () => {
    reset();
    setFilename('');
    // Ideally we'd abort the XHR, but basic reset visually aborts.
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-8 mt-12 mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload your video</h1>
        <p className="text-zinc-400 text-sm">Supports MP4, MOV, MKV, WebM up to 500 MB</p>
      </div>

      <div className="w-full">
        {!isUploading ? (
          <DropZone onFile={handleFile} onUrlIngest={handleUrl} disabled={false} />
        ) : (
          <UploadProgress progress={progress} filename={filename} onCancel={handleCancel} />
        )}
      </div>

      {error && (
         <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
           <strong>Error:</strong> {error}
         </div>
      )}
    </div>
  );
}
