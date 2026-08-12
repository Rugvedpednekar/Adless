"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Film, Plus, Upload } from "lucide-react";

import { getVideos } from "@/services/video-service";
import { Video } from "@/types";

export default function StudioPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    getVideos().then(setVideos).catch(() => setVideos([]));
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-adless-cyan">
              <ArrowLeft className="h-4 w-4" /> Back to Adless
            </Link>
            <h1 className="text-3xl font-extrabold">Creator Studio</h1>
            <p className="mt-2 text-sm text-slate-400">Manage locally uploaded development videos.</p>
          </div>
          <Link href="/studio/upload" className="inline-flex items-center gap-2 rounded-xl bg-adless-cyan px-5 py-3 text-sm font-bold text-slate-950 shadow-glow-cyan">
            <Plus className="h-4 w-4" /> Upload video
          </Link>
        </div>

        <section className="rounded-2xl border border-surface-border bg-surface/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl border border-adless-cyan/30 bg-adless-cyan/10 p-2 text-adless-cyan">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold">Video catalog</h2>
              <p className="text-xs text-slate-500">{videos.length} videos currently available</p>
            </div>
          </div>

          {videos.length ? (
            <div className="divide-y divide-surface-border">
              {videos.map((video) => (
                <Link key={video.id} href={`/studio/videos/${video.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-adless-cyan">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{video.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{video.creator.name} · {video.category} · {video.uploadedAt}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{video.duration}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center text-slate-400">
              <Upload className="mb-3 h-8 w-8" />
              <p className="text-sm">The catalog is loading or the backend is unavailable.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
