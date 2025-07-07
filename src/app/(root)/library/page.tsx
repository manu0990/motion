"use client";

import { VideoPlayer } from '@/components/chat/video-player';
import { useEffect, useState } from 'react';

interface VideoData {
  id: string;
}

export default function Library() {
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/library');
        if (!response.ok) {
          throw new Error('Failed to fetch videos.');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gmanim-dark text-white">
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gmanim-text-primary font-spartan">Your Video Gallery</h1>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-gmanim-accent border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-lg text-gmanim-text-secondary">Loading your creations...</span>
          </div>
        )}

        {!isLoading && videos.length === 0 && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gmanim-text-primary">No Videos Found</h2>
            <p className="mt-2 text-gmanim-text-secondary">Generate some videos in a conversation to see them appear here.</p>
          </div>
        )}

        {!isLoading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-gmanim-surface-dark rounded-[13px] h-[400px] relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center p-6">
                  <VideoPlayer videoId={video.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
