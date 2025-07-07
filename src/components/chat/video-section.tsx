"use client";

import {    X } from "lucide-react";
import { VideoPlayer } from "./video-player";

interface SimpleVideoDisplayProps {
  videoId?: string;
  isGenerating?: boolean;
  onFolderClick?: () => void;
}

export function VideoSection({ 
  videoId, 
  isGenerating = false,  
}: SimpleVideoDisplayProps) {
 // const videoSrc = videoId ? `/api/video/${videoId}` : null;

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
          <div className="flex flex-col items-center gap-3 p-6">
            <X className="w-8 h-8 text-gmanim-text-secondary" />
            <span className="text-sm text-gmanim-text-secondary">
              No video generated
            </span>
          </div>
      </div>
    );
  }

  return (
    <div className="bg-gmanim-surface-dark rounded-[13px] h-[400px] relative overflow-hidden">
    
      {/* Video Display */}
      <div className="w-full h-full flex items-center justify-center p-6">
     {/*   <video
          src={videoSrc}
          controls
          className="max-w-full max-h-full object-contain rounded-[15px]"
          preload="metadata"
        /> */}

        <VideoPlayer videoId={videoId} /> 
      </div>
    </div>
  );
}
