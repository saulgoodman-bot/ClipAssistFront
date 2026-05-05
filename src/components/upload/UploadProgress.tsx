import { X, Film } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  filename: string;
  onCancel: () => void;
}

export function UploadProgress({ progress, filename, onCancel }: UploadProgressProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-lg space-y-md shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0 pr-4">
            <span className="text-zinc-200 font-label-md text-label-md truncate block">{filename}</span>
            <span className="text-zinc-500 text-label-sm font-label-sm block">Uploading {progress}%</span>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="text-zinc-500 hover:text-red-400 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
