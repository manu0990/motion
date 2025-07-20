"use client";

import { VideoPlayer } from '@/components/chat/video-player';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';

interface VideoData {
  id: string;
}

const fetchVideos = (url: string) => axios.get(url).then(res => res.data as VideoData[]);

export default function Library() {
  const { open } = useSidebar();

  const { data: videos, isLoading, error } = useSWR('/api/library', fetchVideos);

  return (
    <div className={`overflow-y-auto h-[calc(100vh-3.5rem)] ${open ? "md:w-[calc(100vw-var(--sidebar-width,250px))]" : "w-screen"} transition ease-in-out`}>
      <div className="p-2 md:p-8 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-6 text-primary text-center">Your Video Gallery</h1>

        {isLoading && (
          <div className="flex justify-center items-center h-64 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-4 text-lg">Loading your creations...</span>
          </div>
        )}

        {!isLoading && (error || !videos?.length) && (
          <div className="text-center text-primary/50 py-10">
            <h2 className="text-xl font-semibold">
              {error ? "Error loading videos" : "No Videos Found"}
            </h2>
            <p className="mt-2">
              {error
                ? "Something went wrong while fetching your videos."
                : "Generate some videos in a conversation to see them appear here."}
            </p>
          </div>
        )}

        {!isLoading && videos && videos.length > 0 && (
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6",
            open ? "md:grid-cols-1 xl:grid-cols-3" : ""
          )}>
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
