"use client";

import React from "react";
import { Video } from "@/types";
import { VideoCard } from "./VideoCard";
import { VideoOff } from "lucide-react";

interface VideoGridProps {
  videos: Video[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-surface border border-surface-border flex items-center justify-center text-slate-500 mb-4">
          <VideoOff className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">No videos found</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1">
          Try searching for another topic or selecting a different category pill.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};
