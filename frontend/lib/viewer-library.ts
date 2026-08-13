"use client";
import {useCallback,useEffect,useState} from "react";
export type ViewerList="liked"|"watchLater"|"history";
const keys:Record<ViewerList,string>={liked:"adless-liked-videos",watchLater:"adless-watch-later",history:"adless-watch-history"};
function read(list:ViewerList):string[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(keys[list])||"[]") as string[]}catch{return[]}}
function write(list:ViewerList,ids:string[]){localStorage.setItem(keys[list],JSON.stringify(ids));window.dispatchEvent(new CustomEvent("adless-library-change"))}
export function addToHistory(id:string){const ids=read("history").filter(item=>item!==id);write("history",[id,...ids].slice(0,50))}
export function useViewerList(list:ViewerList){const[ids,setIds]=useState<string[]>([]);const refresh=useCallback(()=>setIds(read(list)),[list]);useEffect(()=>{refresh();window.addEventListener("adless-library-change",refresh);return()=>window.removeEventListener("adless-library-change",refresh)},[refresh]);const toggle=useCallback((id:string)=>{const current=read(list);write(list,current.includes(id)?current.filter(item=>item!==id):[id,...current]);refresh()},[list,refresh]);return{ids,toggle,contains:(id:string)=>ids.includes(id),clear:()=>{write(list,[]);refresh()}}}
