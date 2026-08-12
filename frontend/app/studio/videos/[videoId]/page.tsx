"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BrainCircuit, Clock3, Film, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { analyzeVideoWithGemini, getVideo } from "@/services/video-service";
import { Video, VideoAnalysis } from "@/types";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function displayLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function StudioVideoDetailPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const [video, setVideo] = useState<Video | null>(null);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [status, setStatus] = useState<"ready" | "loading" | "success" | "error">("ready");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVideo(videoId).then(setVideo).catch(() => setError("Unable to load this video."));
  }, [videoId]);

  async function analyze(force = false) {
    setStatus("loading");
    setError(null);
    try {
      setAnalysis(await analyzeVideoWithGemini(videoId, force));
      setStatus("success");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Analysis failed.");
      setStatus("error");
    }
  }

  if (!video) {
    return <main className="min-h-screen bg-background p-8 text-slate-300">{error || "Loading video..."}</main>;
  }

  const opportunityCount = analysis?.scenes.reduce((count, scene) => count + scene.placementOpportunities.length, 0) || 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-adless-cyan">
          <ArrowLeft className="h-4 w-4" /> Back to Creator Studio
        </Link>

        <section className="rounded-2xl border border-surface-border bg-surface/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-adless-cyan"><Film className="h-4 w-4" /> Creator video</div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">{video.title}</h1>
              <p className="mt-2 text-sm text-slate-400">{video.creator.name} · {video.category} · {video.uploadedAt}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{video.description}</p>
            </div>
            <Link href={`/watch/${video.id}`} className="rounded-xl border border-surface-border px-4 py-2 text-sm font-semibold hover:border-adless-cyan/50">Open watch page</Link>
          </div>
        </section>

        <section className="rounded-2xl border border-adless-cyan/20 bg-gradient-to-br from-surface to-background p-6 shadow-glow-cyan">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-adless-cyan"><BrainCircuit className="h-5 w-5" /><h2 className="font-bold">Adless AI Scene Intelligence</h2></div>
              <p className="mt-2 text-sm text-slate-400">Gemini analyzes scenes, surfaces, safety, and natural product categories.</p>
            </div>
            <button
              onClick={() => analyze(status === "success")}
              disabled={status === "loading" || !video.storagePath}
              className="inline-flex items-center gap-2 rounded-xl bg-adless-cyan px-5 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "success" ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {status === "loading" ? "Gemini is analyzing video..." : status === "success" ? "Analyze again" : "Analyze with Adless AI"}
            </button>
          </div>

          {!video.storagePath && <p className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">Upload this video to Google Cloud Storage before running Adless AI analysis.</p>}
          {status === "loading" && <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-3"><span>Understanding scenes</span><span>Detecting safe surfaces</span><span>Ranking product categories</span></div>}
          {status === "error" && <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}<button onClick={() => analyze(true)} className="ml-3 font-bold underline">Retry</button></div>}

          {analysis && status === "success" && (
            <div className="mt-7 space-y-6">
              <div className="rounded-xl border border-surface-border bg-slate-950/50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Video summary</p>
                <p className="mt-2 leading-relaxed text-slate-200">{analysis.summary}</p>
                <p className="mt-3 text-xs text-adless-cyan">{analysis.scenes.length} scenes · {opportunityCount} placement opportunities</p>
              </div>

              <div className="space-y-4">
                {analysis.scenes.map((scene, sceneIndex) => (
                  <article key={`${scene.startTime}-${sceneIndex}`} className="rounded-xl border border-surface-border bg-slate-950/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-bold">Scene {sceneIndex + 1} · <span className="capitalize text-adless-cyan">{displayLabel(scene.environment)}</span></h3>
                      <span className="flex items-center gap-2 text-xs text-slate-400"><Clock3 className="h-4 w-4" />{formatTime(scene.startTime)} – {formatTime(scene.endTime)}</span>
                    </div>
                    <p className="mt-2 text-sm capitalize text-slate-400">Mood: {displayLabel(scene.mood)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{scene.objects.map((object) => <span key={object} className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">{displayLabel(object)}</span>)}</div>
                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      {scene.placementOpportunities.length ? scene.placementOpportunities.map((opportunity, index) => (
                        <div key={`${opportunity.surface}-${index}`} className="rounded-xl border border-adless-purple/30 bg-adless-purple/5 p-4">
                          <div className="flex items-center justify-between gap-3"><p className="font-bold capitalize">{displayLabel(opportunity.surface)}</p><span className="text-sm font-bold text-adless-cyan">{Math.round(opportunity.confidence * 100)}%</span></div>
                          <div className="mt-3 flex flex-wrap gap-2">{opportunity.recommendedCategories.map((category) => <span key={category} className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs capitalize">{displayLabel(category)}</span>)}</div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-400">{opportunity.reason}</p>
                        </div>
                      )) : <p className="text-sm text-slate-500">No safe, natural placement opportunity detected in this scene.</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
