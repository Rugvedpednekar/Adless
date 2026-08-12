"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DEMO_VIDEOS } from "@/lib/demo-videos";
import { Video } from "@/types";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Layers,
  ThumbsUp,
  Share2,
  Bookmark,
  Info,
  X,
  FileVideo
} from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.videoId as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("Home");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (videoId) {
      const found = DEMO_VIDEOS.find((v) => v.id === videoId);
      if (found) {
        setVideo(found);
        setVideoError(false);
      } else {
        // Fallback to first video if ID not found directly
        setVideo(DEMO_VIDEOS[0]);
      }
    }
  }, [videoId]);

  const handleAnalyzeClick = () => {
    setToastMessage("Gemini analysis will be connected in next step.");
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-adless-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading video workspace...</p>
        </div>
      </div>
    );
  }

  const confidenceScore = video.placementConfidence || 95;
  const otherVideos = DEMO_VIDEOS.filter((v) => v.id !== video.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeNavTab}
          setActiveTab={setActiveNavTab}
          isOpen={isSidebarOpen}
        />

        {/* Main Watch Experience */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {/* Back Navigation Bar */}
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-surface border border-surface-border hover:bg-surface-hover hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4 text-adless-cyan" />
              <span>Back to Explore</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Player & Video Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Native HTML5 Video Player Container */}
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-surface-border shadow-2xl flex items-center justify-center">
                {!videoError ? (
                  <video
                    key={video.videoSrc}
                    controls
                    autoPlay={false}
                    poster={video.thumbnailUrl}
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-contain"
                  >
                    <source src={video.videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  /* Friendly Graceful Missing File Handling Banner */
                  <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-surface to-background w-full h-full">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                      <FileVideo className="w-7 h-7" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100">
                      Demo Video Clip File Not Found
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1 leading-relaxed">
                      The video file <code className="text-adless-cyan font-mono bg-surface px-1.5 py-0.5 rounded border border-surface-border">{video.videoSrc}</code> is missing from local storage.
                    </p>
                    
                    <div className="mt-4 p-3 rounded-xl bg-surface border border-surface-border text-left w-full max-w-lg">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>How to add your video file:</span>
                      </div>
                      <code className="text-[11px] text-slate-300 font-mono block overflow-x-auto p-1.5 rounded bg-black/40 border border-slate-800">
                        Copy your MP4 file to: frontend/public{video.videoSrc}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Stats Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                    {video.title}
                  </h1>

                  {/* AI Placement Confidence Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-adless-cyan/15 border border-adless-cyan/40 text-adless-cyan text-xs font-bold shadow-glow-cyan">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Placement {confidenceScore}%</span>
                  </div>
                </div>

                {/* Creator Profile & Action Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-surface-border">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-surface-border bg-slate-800">
                      <Image
                        src={video.creator.avatarUrl}
                        alt={video.creator.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-slate-100">
                          {video.creator.name}
                        </span>
                        {video.creator.verified && (
                          <CheckCircle2 className="w-4 h-4 text-adless-cyan" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {video.creator.subscribers} subscribers
                      </span>
                    </div>

                    <button className="ml-2 px-4 py-1.5 rounded-full text-xs font-bold bg-adless-cyan text-slate-950 hover:opacity-95 transition shadow-glow-cyan">
                      Subscribe
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border hover:bg-surface-hover text-slate-300 hover:text-white transition">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Like</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border hover:bg-surface-hover text-slate-300 hover:text-white transition">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border hover:bg-surface-hover text-slate-300 hover:text-white transition">
                      <Bookmark className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                {/* Description Box */}
                <div className="p-4 rounded-2xl bg-surface/60 border border-surface-border space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span>{video.views}</span>
                    <span>•</span>
                    <span>{video.uploadedAt}</span>
                    <span>•</span>
                    <span className="text-adless-cyan font-mono">{video.category}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {video.description}
                  </p>
                  {video.source && video.source.license && (
                    <div className="pt-2 text-[11px] text-slate-500 font-mono">
                      License: {video.source.license}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Scene Analysis Section (Prepared for Gemini Workflow) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-surface to-background border border-adless-cyan/30 shadow-glow-cyan space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-adless-cyan/15 border border-adless-cyan/40 flex items-center justify-center text-adless-cyan">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        AI Scene Analysis
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Status: Ready for analysis
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Contextual surface detection & advertisement campaign eligibility
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyzeClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-adless-cyan to-blue-600 text-slate-950 shadow-glow-cyan hover:opacity-95 transition active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze with Gemini</span>
                  </button>
                </div>

                {/* API Payload Schema Preview */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase tracking-wider pb-1 border-b border-slate-800">
                    <span>Target API Endpoint: POST /api/videos/{video.id}/analyze</span>
                    <span>Structured Schema</span>
                  </div>
                  <pre className="text-adless-cyan/90 overflow-x-auto whitespace-pre-wrap">
{`{
  "sceneType": "living_room",
  "mood": "casual_positive",
  "detectedObjects": ["coffee_table", "sofa", "lamp"],
  "placementOpportunities": [
    {
      "surface": "coffee_table",
      "category": "snack",
      "confidence": ${confidenceScore / 100},
      "reason": "Large unobstructed tabletop area suitable for natural product placement."
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right Column: Other Preloaded Demo Videos */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-adless-cyan" />
                <span>Preloaded Demo Clips</span>
              </h3>

              <div className="space-y-3">
                {otherVideos.map((item) => (
                  <Link
                    key={item.id}
                    href={`/watch/${item.id}`}
                    className="group flex gap-3 p-2 rounded-xl bg-surface/40 hover:bg-surface border border-transparent hover:border-surface-border transition"
                  >
                    <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                        unoptimized
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                        {item.duration}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <h4 className="font-semibold text-xs text-slate-200 line-clamp-2 group-hover:text-adless-cyan transition">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 mt-1">
                        {item.creator.name}
                      </span>
                      <span className="text-[10px] text-adless-cyan font-mono mt-0.5">
                        AI Placement {item.placementConfidence}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Gemini Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-surface-card border border-adless-cyan/40 px-4 py-3 rounded-2xl shadow-glow-cyan text-slate-100 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-xl bg-adless-cyan/15 flex items-center justify-center text-adless-cyan shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-adless-cyan">Gemini Integration Ready</h4>
            <p className="text-xs text-slate-300">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
