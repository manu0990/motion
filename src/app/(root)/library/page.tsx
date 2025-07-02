"use client";

import { VideoPlayer } from '@/components/chat/video-player';
import { useSidebar } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VideoData {
  id: string;
}

export default function Library() {
  const { open } = useSidebar();
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
    <div className={`overflow-y-auto h-[calc(100vh-3.5rem)] ${open ? "w-[calc(100vw-var(--sidebar-width,250px))]" : "w-screen"} transition ease-in-out`}>
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Your Video Gallery</h1>

        {isLoading && (
          <div className="flex justify-center items-center h-64 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-4 text-lg">Loading your creations...</span>
          </div>
        )}

        {!isLoading && videos.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            <h2 className="text-xl font-semibold">No Videos Found</h2>
            <p className="mt-2">Generate some videos in a conversation to see them appear here.</p>
          </div>
        )}

        {!isLoading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="rounded-xl overflow-hidden shadow-lg bg-neutral-800/50 aspect-video border border-neutral-700">
                <VideoPlayer videoId={video.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
