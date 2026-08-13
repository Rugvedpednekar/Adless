"use client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Play } from "lucide-react";
import { Video } from "@/types";
import { VideoThumbnail } from "./VideoThumbnail";

export function VideoCard({video,priority=false}:{video:Video;priority?:boolean}){
  return <Link href={`/watch/${video.id}`} className="group block min-w-0"><div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface"><VideoThumbnail thumbnailUrl={video.thumbnailUrl} videoSrc={video.videoSrc} alt={video.title} priority={priority} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"/><div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/90"><Play className="h-5 w-5 translate-x-px fill-black text-black"/></span></div><span className="absolute bottom-2 right-2 rounded-md bg-black/85 px-1.5 py-0.5 text-xs font-medium text-white">{video.duration}</span></div><div className="mt-3 flex gap-3"><div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-elevated"><Image src={video.creator.avatarUrl} alt={video.creator.name} fill className="object-cover" unoptimized/></div><div className="min-w-0"><h3 className="line-clamp-2 text-sm font-semibold leading-snug">{video.title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">{video.creator.name}{video.creator.verified&&<CheckCircle2 className="h-3.5 w-3.5 text-adless-cyan"/>}</p><p className="text-xs text-muted-foreground">{video.views} • {video.uploadedAt}</p></div></div></Link>;
}
