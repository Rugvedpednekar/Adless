"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CategoryPills } from "@/components/video/CategoryPills";
import { VideoGrid } from "@/components/video/VideoGrid";
import { MOCK_VIDEOS } from "@/lib/mock-data";
import { NavCategory } from "@/types";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NavCategory>("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState("Home");

  // Client-side local filtering
  const filteredVideos = useMemo(() => {
    return MOCK_VIDEOS.filter((video) => {
      const matchesCategory =
        selectedCategory === "All" || video.category === selectedCategory;
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeNavTab}
          setActiveTab={setActiveNavTab}
          isOpen={isSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Platform Highlight Banner */}
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-surface-card via-surface to-background border border-surface-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-adless-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-adless-cyan/10 border border-adless-cyan/30 text-adless-cyan text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI In-Scene Compositing</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Watch without interruptions.
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Adless places contextual brand products directly into video scenes using Gemini AI & ClickHouse analytics, eliminating mid-roll ad interruptions for viewers.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-surface/80 px-3.5 py-2 rounded-xl border border-surface-border">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Zero Ad Interruptions</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-surface/80 px-3.5 py-2 rounded-xl border border-surface-border">
                  <Zap className="w-4 h-4 text-adless-cyan" />
                  <span>Instant Scene Matching</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-6">
            <CategoryPills
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Video Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{selectedCategory === "All" ? "Recommended Videos" : `${selectedCategory} Videos`}</span>
                <span className="text-xs font-normal text-slate-500 font-mono">
                  ({filteredVideos.length})
                </span>
              </h2>
            </div>
            <VideoGrid videos={filteredVideos} />
          </section>
        </main>
      </div>
    </div>
  );
}
