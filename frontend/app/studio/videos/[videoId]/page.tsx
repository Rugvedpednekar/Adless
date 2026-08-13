"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BarChart3, BrainCircuit, Check, Clock3, Film, Loader2, RefreshCw, Sparkles, X } from "lucide-react";

import { analyzeVideoWithGemini, createPlacementPreview, getVideo, runPlacementQA, selectBestCampaign } from "@/services/video-service";
import { PlacementPreview, PlacementQAResult, SelectedCampaign, Video, VideoAnalysis } from "@/types";

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
  const [campaigns, setCampaigns] = useState<Record<number, SelectedCampaign>>({});
  const [campaignLoading, setCampaignLoading] = useState<number | null>(null);
  const [campaignErrors, setCampaignErrors] = useState<Record<number, string>>({});
  const [previews, setPreviews] = useState<Record<number, PlacementPreview>>({});
  const [previewLoading, setPreviewLoading] = useState<number | null>(null);
  const [previewErrors, setPreviewErrors] = useState<Record<number, string>>({});
  const [decisions, setDecisions] = useState<Record<number, "approved" | "rejected">>({});
  const [qaResults, setQaResults] = useState<Record<number, PlacementQAResult>>({});
  const [qaLoading, setQaLoading] = useState<number | null>(null);
  const [qaErrors, setQaErrors] = useState<Record<number, string>>({});

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

  async function findCampaign(placementIndex: number) {
    setCampaignLoading(placementIndex);
    setCampaignErrors((current) => ({ ...current, [placementIndex]: "" }));
    try {
      const selected = await selectBestCampaign(videoId, placementIndex);
      setCampaigns((current) => ({ ...current, [placementIndex]: selected }));
    } catch (requestError) {
      setCampaignErrors((current) => ({ ...current, [placementIndex]: requestError instanceof Error ? requestError.message : "Campaign selection failed." }));
    } finally {
      setCampaignLoading(null);
    }
  }

  async function renderPreview(placementIndex: number, force = false) {
    setPreviewLoading(placementIndex);
    setPreviewErrors((current) => ({ ...current, [placementIndex]: "" }));
    setDecisions((current) => { const next = { ...current }; delete next[placementIndex]; return next; });
    try {
      const preview = await createPlacementPreview(videoId, placementIndex, force);
      setPreviews((current) => ({ ...current, [placementIndex]: preview }));
      if (force) setQaResults((current) => { const next = { ...current }; delete next[placementIndex]; return next; });
    } catch (requestError) {
      setPreviewErrors((current) => ({ ...current, [placementIndex]: requestError instanceof Error ? requestError.message : "Preview rendering failed." }));
    } finally {
      setPreviewLoading(null);
    }
  }

  async function runQualityCheck(placementIndex: number) {
    setQaLoading(placementIndex);
    setQaErrors((current) => ({ ...current, [placementIndex]: "" }));
    try {
      const result = await runPlacementQA(videoId, placementIndex);
      setQaResults((current) => ({ ...current, [placementIndex]: result }));
    } catch (requestError) {
      setQaErrors((current) => ({ ...current, [placementIndex]: requestError instanceof Error ? requestError.message : "AI quality check failed." }));
    } finally {
      setQaLoading(null);
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
                          {(() => {
                            const placementIndex = analysis.scenes.slice(0, sceneIndex).reduce((count, priorScene) => count + priorScene.placementOpportunities.length, 0) + index;
                            const selected = campaigns[placementIndex];
                            const preview = previews[placementIndex];
                            const qa = qaResults[placementIndex];
                            return <>
                          <div className="flex items-center justify-between gap-3"><p className="font-bold capitalize">{displayLabel(opportunity.surface)}</p><span className="text-sm font-bold text-adless-cyan">{Math.round(opportunity.confidence * 100)}%</span></div>
                          <div className="mt-3 flex flex-wrap gap-2">{opportunity.recommendedCategories.map((category) => <span key={category} className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs capitalize">{displayLabel(category)}</span>)}</div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-400">{opportunity.reason}</p>
                          <div className="mt-4 border-t border-slate-800 pt-4">
                            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"><BarChart3 className="h-3.5 w-3.5 text-adless-cyan" /> Campaign intelligence powered by ClickHouse</p>
                            <button onClick={() => findCampaign(placementIndex)} disabled={campaignLoading === placementIndex} className="inline-flex items-center gap-2 rounded-lg border border-adless-cyan/40 bg-adless-cyan/10 px-3 py-2 text-xs font-bold text-adless-cyan disabled:opacity-60">{campaignLoading === placementIndex && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{selected ? "Find Again" : "Find Best Campaign"}</button>
                            {campaignErrors[placementIndex] && <p className="mt-3 text-xs text-rose-300">{campaignErrors[placementIndex]}</p>}
                            {selected && <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Selected campaign</p><h4 className="mt-1 font-bold">{selected.brand} · {selected.productName}</h4><p className="mt-1 text-xs capitalize text-slate-400">{selected.category} · {selected.market}</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">{Math.round(selected.selectionConfidence * 100)}% AI confidence</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div><span className="text-slate-500">Score</span><p className="font-bold">{selected.performanceScore}</p></div><div><span className="text-slate-500">Success</span><p className="font-bold">{Math.round(selected.successRate * 100)}%</p></div><div><span className="text-slate-500">Exposure</span><p className="font-bold">{selected.avgExposureSeconds.toFixed(1)}s</p></div></div><p className="mt-3 text-sm leading-relaxed text-slate-300">{selected.reason}</p></div>}
                            {selected && !preview && previewLoading !== placementIndex && <button onClick={() => renderPreview(placementIndex)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-adless-purple px-4 py-2 text-xs font-bold text-white"><Sparkles className="h-3.5 w-3.5" />Preview Placement</button>}
                            {previewLoading === placementIndex && <div className="mt-4 rounded-xl border border-adless-purple/30 bg-adless-purple/5 p-4"><p className="flex items-center gap-2 text-sm font-bold"><Loader2 className="h-4 w-4 animate-spin text-adless-cyan" />Creating product-placement preview</p><div className="mt-3 grid gap-2 text-xs text-slate-400"><span>Analyzing placement surface</span><span>Positioning product</span><span>Rendering preview</span></div></div>}
                            {previewErrors[placementIndex] && <p className="mt-3 text-xs text-rose-300">{previewErrors[placementIndex]}</p>}
                            {preview && <div className="mt-5 rounded-xl border border-adless-cyan/25 bg-slate-950/70 p-4">
                              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-adless-cyan">Preview ready</p><h4 className="mt-1 font-bold">{preview.brand} · {preview.productName}</h4></div><span className="text-xs font-bold text-emerald-300">{Math.round(preview.placementConfidence * 100)}% localized</span></div>
                              <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><p className="mb-2 text-[10px] font-bold tracking-widest text-slate-500">BEFORE</p><video controls preload="metadata" src={video.videoSrc} className="aspect-video w-full rounded-lg bg-black" /></div><div><p className="mb-2 text-[10px] font-bold tracking-widest text-adless-cyan">AFTER</p><video key={preview.previewUrl} controls preload="metadata" src={preview.previewUrl} className="aspect-video w-full rounded-lg bg-black" /></div></div>
                              <div className="mt-4 grid grid-cols-3 gap-2 text-xs"><div><span className="text-slate-500">Surface</span><p className="font-bold capitalize">{displayLabel(preview.surface)}</p></div><div><span className="text-slate-500">Visible</span><p className="font-bold">{formatTime(preview.startTime)}–{formatTime(preview.endTime)}</p></div><div><span className="text-slate-500">ClickHouse score</span><p className="font-bold">{preview.performanceScore}</p></div></div>
                              <p className="mt-3 text-xs leading-relaxed text-slate-400">{preview.geometry.reason}</p>
                              <div className="mt-5 border-t border-slate-800 pt-4">
                                <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-adless-purple">Adless AI Quality Check</p><p className="mt-1 text-xs text-slate-500">Gemini visually inspects a real frame from the rendered preview.</p></div><button onClick={() => runQualityCheck(placementIndex)} disabled={qaLoading === placementIndex} className="inline-flex items-center gap-2 rounded-lg border border-adless-purple/50 bg-adless-purple/10 px-3 py-2 text-xs font-bold text-purple-200 disabled:opacity-60">{qaLoading === placementIndex && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{qa ? "Run Again" : "Run AI Quality Check"}</button></div>
                                {qaLoading === placementIndex && <p className="mt-3 text-xs text-slate-400">Gemini is inspecting the rendered placement frame...</p>}
                                {qaErrors[placementIndex] && <p className="mt-3 text-xs text-rose-300">{qaErrors[placementIndex]}</p>}
                                {qa && <div className={`mt-4 rounded-xl border p-4 ${qa.approved ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Quality Check</p><h5 className={`mt-1 text-lg font-extrabold ${qa.approved ? "text-emerald-300" : "text-amber-300"}`}>{qa.approved ? "Approved" : "Needs Adjustment"}</h5></div><div className="text-right"><p className="text-xs text-slate-500">Quality</p><p className="text-xl font-extrabold">{Math.round(qa.qualityScore * 100)}%</p></div></div>
                                  <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                                    {[
                                      ["Surface alignment", qa.checks.surfaceAlignment], ["Realistic scale", qa.checks.realisticScale],
                                      ["Realistic position", qa.checks.realisticPosition], ["Plausible perspective", qa.checks.plausiblePerspective],
                                      ["Believable contact shadow", qa.checks.believableContactShadow], ["Product visibility", qa.checks.productVisibility],
                                      ["No face obstruction", !qa.checks.faceObstruction], ["No subtitle obstruction", !qa.checks.subtitleObstruction],
                                      ["No object obstruction", !qa.checks.importantObjectObstruction], ["No mug intersection", !qa.checks.mugIntersection],
                                      ["Not floating", !qa.checks.floatingProduct], ["Not excessively prominent", !qa.checks.excessiveProminence],
                                      ["Context appropriate", qa.checks.contextuallyAppropriate], ["Safe context", qa.checks.safeContext],
                                    ].map(([label, passed]) => <div key={String(label)} className="flex items-center gap-2"><span className={passed ? "text-emerald-400" : "text-rose-400"}>{passed ? "✓" : "✕"}</span><span className="text-slate-300">{label}</span></div>)}
                                  </div>
                                  {qa.issues.length > 0 && <div className="mt-4 rounded-lg bg-amber-500/10 p-3"><p className="text-xs font-bold text-amber-300">Detected issues</p><ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-100">{qa.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
                                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{qa.reason}</p><p className="mt-2 text-[10px] text-slate-500">Representative frame: {formatTime(qa.representativeFrameTime)}</p>
                                </div>}
                              </div>
                              <div className="mt-5 border-t border-slate-800 pt-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Creator Approval · Separate from AI review</p><div className="flex flex-wrap gap-2"><button onClick={() => setDecisions((current) => ({ ...current, [placementIndex]: "approved" }))} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950"><Check className="h-3.5 w-3.5" />Approve Placement</button><button onClick={() => renderPreview(placementIndex, true)} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-bold"><RefreshCw className="h-3.5 w-3.5" />Regenerate Placement</button><button onClick={() => setDecisions((current) => ({ ...current, [placementIndex]: "rejected" }))} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-300"><X className="h-3.5 w-3.5" />Reject</button></div></div>
                              {decisions[placementIndex] && <p className={`mt-3 text-xs font-bold ${decisions[placementIndex] === "approved" ? "text-emerald-300" : "text-rose-300"}`}>Placement {decisions[placementIndex]} for this review session.</p>}
                            </div>}
                          </div>
                          </>;
                          })()}
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
