"use client";
import { useState } from "react";
import { Header } from "./Header";
import { ViewerSidebar } from "./ViewerSidebar";
export function ViewerShell({children,search="",onSearch}:{children:React.ReactNode;search?:string;onSearch?:(value:string)=>void}) { const [open,setOpen]=useState(true); return <div className="min-h-screen bg-background"><Header onMenu={()=>setOpen(value=>!value)} search={search} onSearch={onSearch}/><ViewerSidebar open={open}/><div className={`pb-16 pt-14 transition-[padding] md:pb-0 ${open?"md:pl-60":"md:pl-[72px]"}`}>{children}</div></div>; }
