"use client";
import {useEffect,useState} from "react";
import {Compass,Flame,Gamepad2,Lightbulb,Music} from "lucide-react";
import {ViewerShell} from "@/components/navigation/ViewerShell";
import {VideoGrid} from "@/components/video/VideoGrid";
import {getVideos} from "@/services/video-service";
import {Video} from "@/types";
const topics=[{label:"Trending",icon:Flame},{label:"Gaming",icon:Gamepad2},{label:"Technology",icon:Lightbulb},{label:"Music",icon:Music}];
export default function ExplorePage(){const[videos,setVideos]=useState<Video[]>([]);const[selected,setSelected]=useState("Trending");useEffect(()=>{getVideos().then(setVideos).catch(()=>setVideos([]))},[]);const shown=selected==="Trending"?videos:videos.filter(video=>video.category===selected);return <ViewerShell><main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6"><h1 className="font-display flex items-center gap-3 text-3xl font-semibold"><Compass className="h-7 w-7 text-adless-cyan"/>Explore</h1><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{topics.map(topic=><button key={topic.label} onClick={()=>setSelected(topic.label)} className={`rounded-xl border p-5 text-left transition ${selected===topic.label?"border-adless-cyan/40 bg-adless-cyan/10":"border-border bg-surface hover:bg-elevated"}`}><topic.icon className={`h-6 w-6 ${selected===topic.label?"text-adless-cyan":"text-muted-foreground"}`}/><p className="mt-4 font-semibold">{topic.label}</p></button>)}</div><div className="mt-10"><VideoGrid title={selected} videos={shown}/></div></main></ViewerShell>}
