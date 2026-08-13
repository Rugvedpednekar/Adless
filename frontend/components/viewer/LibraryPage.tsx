"use client";
import {useEffect,useState} from "react";
import {ViewerShell} from "@/components/navigation/ViewerShell";
import {VideoGrid} from "@/components/video/VideoGrid";
import {getVideos} from "@/services/video-service";
import {ViewerList,useViewerList} from "@/lib/viewer-library";
import {Video} from "@/types";
export function LibraryPage({list,title,description}:{list:ViewerList;title:string;description:string}){const[videos,setVideos]=useState<Video[]>([]);const{ids,clear}=useViewerList(list);useEffect(()=>{getVideos().then(setVideos).catch(()=>setVideos([]))},[]);const selected=ids.map(id=>videos.find(video=>video.id===id)).filter((video):video is Video=>Boolean(video));return <ViewerShell><main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-3xl font-semibold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>{selected.length>0&&<button onClick={clear} className="rounded-full bg-elevated px-4 py-2 text-sm font-medium">Clear all</button>}</div><div className="mt-8">{selected.length?<VideoGrid videos={selected}/>:<div className="rounded-2xl border border-border bg-surface px-6 py-20 text-center"><h2 className="text-lg font-semibold">Nothing here yet</h2><p className="mt-2 text-sm text-muted-foreground">Videos you add will appear here automatically.</p></div>}</div></main></ViewerShell>}
