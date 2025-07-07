"use client";

import { Folder } from "lucide-react";

interface SimpleVideoDisplayProps {
  videoId?: string;
  isGenerating?: boolean;
  onFolderClick?: () => void;
}

export function SimpleVideoDisplay({ 
  videoId, 
  isGenerating = false, 
  onFolderClick 
}: SimpleVideoDisplayProps) {
  const videoSrc = videoId ? `/api/video/${videoId}` : null;

  if (isGenerating) {
    return (
      <div className="bg-gmanim-surface-dark rounded-[13px] h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6">
          <div className="w-8 h-8 border-2 border-gmanim-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gmanim-text-secondary">
            Generating video...
          </span>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="bg-gmanim-surface-dark rounded-[13px] h-[400px] flex items-center justify-center">
        <button
          onClick={onFolderClick}
          className="flex flex-col items-center gap-3 p-6 hover:bg-gmanim-surface-light/20 rounded-lg transition-colors group"
        >
          <Folder className="w-8 h-8 text-gmanim-text-secondary group-hover:text-white transition-colors" />
          <span className="text-sm text-gmanim-text-secondary group-hover:text-white transition-colors">
            Click to view results
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gmanim-surface-dark rounded-[13px] h-[523px] relative overflow-hidden">
      {/* Small Folder Icon in Top Right */}
      <button
        onClick={onFolderClick}
        className="absolute top-4 right-4 z-10 w-8 h-8 bg-gmanim-accent/80 rounded-full flex items-center justify-center hover:bg-gmanim-accent transition-all"
      >
        <Folder className="w-4 h-4 text-white" />
      </button>

      {/* Video Display */}
      <div className="w-full h-full flex items-center justify-center p-6">
        <video
          src={videoSrc}
          controls
          className="max-w-full max-h-full object-contain rounded-[15px]"
          preload="metadata"
        />
      </div>
    </div>
  );
}
