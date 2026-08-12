"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Video } from "@/types";
import { VideoThumbnail } from "./VideoThumbnail";

interface VideoCardProps {
  video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const confidenceScore = video.placementConfidence || video.aiMatchScore || 95;

  return (
    <Link href={`/watch/${video.id}`} className="group flex flex-col glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        <VideoThumbnail
          thumbnailUrl={video.thumbnailUrl}
          videoSrc={video.videoSrc}
          alt={video.title}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Video Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-background/90 backdrop-blur-md text-white text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border border-slate-700/60">
          {video.duration}
        </div>

        {/* AI Product Placement Confidence Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-background/85 backdrop-blur-md text-adless-cyan text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full border border-adless-cyan/40 shadow-glow-cyan">
          <Sparkles className="w-3 h-3 text-adless-cyan" />
          <span>AI Placement {confidenceScore}%</span>
        </div>
      </div>

      {/* Video Details */}
      <div className="p-4 flex gap-3">
        {/* Creator Avatar */}
        <div className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden border border-surface-border bg-slate-800">
          <Image
            src={video.creator.avatarUrl}
            alt={video.creator.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Metadata */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-adless-cyan transition-colors">
            {video.title}
          </h3>
          
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
            <span className="truncate hover:text-slate-200 transition font-medium">
              {video.creator.name}
            </span>
            {video.creator.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-adless-cyan shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
            <span>{video.category}</span>
            <span>•</span>
            <span>{video.views}</span>
            <span>•</span>
            <span>{video.uploadedAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
