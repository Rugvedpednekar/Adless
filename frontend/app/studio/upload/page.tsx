"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileVideo, UploadCloud } from "lucide-react";

import { uploadVideo } from "@/services/video-service";
import { NavCategory } from "@/types";

const UPLOAD_CATEGORIES: Exclude<NavCategory, "All">[] = [
  "Technology",
  "Gaming",
  "Entertainment",
  "AI & Future",
  "Lifestyle",
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Exclude<NavCategory, "All">>("Lifestyle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || file.type !== "video/mp4") {
      setStatus("error");
      setMessage("Choose an MP4 video file before uploading.");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setMessage("Uploading video to local development storage...");

    try {
      const video = await uploadVideo(
        { file, title, creator, description, category },
        setProgress
      );
      setStatus("success");
      setProgress(100);
      setMessage("Upload complete. Opening the refreshed catalog...");
      router.push(`/?uploaded=${encodeURIComponent(video.id)}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/studio" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-adless-cyan">
          <ArrowLeft className="h-4 w-4" /> Creator Studio
        </Link>

        <div className="rounded-3xl border border-surface-border bg-gradient-to-br from-surface-card to-background p-6 shadow-2xl sm:p-8">
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-adless-cyan/30 bg-adless-cyan/10 px-3 py-1 text-xs font-semibold text-adless-cyan">
              <UploadCloud className="h-4 w-4" /> Local development upload
            </div>
            <h1 className="text-2xl font-extrabold">Upload a video</h1>
            <p className="mt-2 text-sm text-slate-400">Add an MP4 to the local Adless catalog and publish its watch page.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block rounded-2xl border border-dashed border-slate-600 bg-slate-950/40 p-6 text-center hover:border-adless-cyan/60">
              <FileVideo className="mx-auto mb-3 h-8 w-8 text-adless-cyan" />
              <span className="block text-sm font-semibold">{file ? file.name : "Choose an MP4 video"}</span>
              <span className="mt-1 block text-xs text-slate-500">Only .mp4 files are accepted</span>
              <input
                type="file"
                accept="video/mp4,.mp4"
                required
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Title">
                <input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="form-input" placeholder="My new video" />
              </Field>
              <Field label="Creator name">
                <input required maxLength={100} value={creator} onChange={(event) => setCreator(event.target.value)} className="form-input" placeholder="Creator name" />
              </Field>
            </div>

            <Field label="Description">
              <textarea required maxLength={2000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="form-input resize-none" placeholder="Tell viewers about this video" />
            </Field>

            <Field label="Category">
              <select value={category} onChange={(event) => setCategory(event.target.value as Exclude<NavCategory, "All">)} className="form-input">
                {UPLOAD_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>

            {status !== "idle" && (
              <div className={`rounded-xl border p-4 ${status === "error" ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-adless-cyan/30 bg-adless-cyan/10 text-slate-200"}`}>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2">{status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}{message}</span>
                  {status !== "error" && <span>{progress}%</span>}
                </div>
                {status !== "error" && <div className="h-2 overflow-hidden rounded-full bg-slate-900"><div className="h-full bg-gradient-to-r from-adless-cyan to-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>}
              </div>
            )}

            <button disabled={status === "uploading" || status === "success"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-adless-cyan to-blue-600 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-60">
              <UploadCloud className="h-5 w-5" /> {status === "uploading" ? "Uploading..." : "Upload video"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>{children}</label>;
}
