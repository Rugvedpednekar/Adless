"use client";
import Image from "next/image";
import Link from "next/link";
import {useParams,useSearchParams} from "next/navigation";
import {useEffect,useState} from "react";
import {Bookmark,CheckCircle2,MoreHorizontal,Share2,ThumbsUp} from "lucide-react";
import {ViewerShell} from "@/components/navigation/ViewerShell";
import {RecommendedVideo} from "@/components/video/RecommendedVideo";
import {ShoppableVideoPlayer} from "@/components/video/ShoppableVideoPlayer";
import {getVideo,getVideos} from "@/services/video-service";
import {addToHistory,useViewerList} from "@/lib/viewer-library";
import {Video} from "@/types";

export default function WatchPage(){
 const{videoId}=useParams<{videoId:string}>(),previewMode=useSearchParams().get("placementPreview")==="true";
 const[video,setVideo]=useState<Video|null>(null),[videos,setVideos]=useState<Video[]>([]),[error,setError]=useState(false),[copied,setCopied]=useState(false);
 const liked=useViewerList("liked"),saved=useViewerList("watchLater");
 useEffect(()=>{Promise.all([getVideo(videoId),getVideos()]).then(([selected,catalog])=>{setVideo(selected);setVideos(catalog);addToHistory(selected.id)}).catch(()=>setError(true))},[videoId]);
 if(!video)return <ViewerShell><div className="grid min-h-[70vh] place-items-center">{error?<div className="text-center"><h1 className="text-xl font-semibold">Video unavailable</h1><Link href="/" className="mt-3 inline-block text-adless-cyan">Return home</Link></div>:<div className="h-8 w-8 animate-spin rounded-full border-2 border-elevated border-t-white"/>}</div></ViewerShell>;
 const share=async()=>{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1500)};
 return <ViewerShell><main className="mx-auto grid max-w-[1500px] gap-7 px-3 py-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:px-6"><section className="min-w-0"><ShoppableVideoPlayer videoId={video.id} src={video.videoSrc} poster={video.thumbnailUrl} title={video.title} previewMode={previewMode}/><h1 className="font-display mt-4 text-xl font-semibold leading-7">{video.title}</h1><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="relative h-10 w-10 overflow-hidden rounded-full bg-elevated"><Image src={video.creator.avatarUrl} alt={video.creator.name} fill className="object-cover" unoptimized/></div><div><p className="flex items-center gap-1 text-sm font-semibold">{video.creator.name}{video.creator.verified&&<CheckCircle2 className="h-4 w-4 text-adless-cyan"/>}</p><p className="text-xs text-muted-foreground">{video.creator.subscribers||"1.2K"} subscribers</p></div></div><div className="flex flex-wrap gap-2"><Action icon={ThumbsUp} label={liked.contains(video.id)?"Liked":"Like"} active={liked.contains(video.id)} onClick={()=>liked.toggle(video.id)}/><Action icon={Share2} label={copied?"Copied":"Share"} onClick={share}/><Action icon={Bookmark} label={saved.contains(video.id)?"Saved":"Save"} active={saved.contains(video.id)} onClick={()=>saved.toggle(video.id)}/><button aria-label="More actions" className="grid h-9 w-9 place-items-center rounded-full bg-elevated"><MoreHorizontal className="h-5 w-5"/></button></div></div><div className="mt-4 rounded-xl bg-surface p-4 text-sm"><p className="font-semibold">{video.views} • {video.uploadedAt}</p><p className="mt-2 leading-6 text-[#e5e5e5]">{video.description}</p></div><section className="mt-8"><h2 className="text-xl font-semibold">Comments</h2><div className="mt-5 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-adless-cyan text-xs font-bold text-black">RP</div><input aria-label="Add a comment" placeholder="Add a comment..." className="h-9 flex-1 border-b border-border bg-transparent text-sm outline-none"/></div><p className="py-14 text-center text-sm text-muted-foreground">Comments will appear here.</p></section></section><aside className="space-y-3"><h2 className="mb-4 font-semibold">Up next</h2>{videos.filter(item=>item.id!==video.id).map(item=><RecommendedVideo key={item.id} video={item}/>)}</aside></main></ViewerShell>
}
function Action({icon:Icon,label,onClick,active=false}:{icon:typeof ThumbsUp;label:string;onClick:()=>void;active?:boolean}){return <button onClick={onClick} className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold ${active?"bg-adless-cyan/15 text-adless-cyan":"bg-elevated hover:brightness-125"}`}><Icon className={`h-4 w-4 ${active?"fill-current":""}`}/>{label}</button>}
