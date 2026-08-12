"use client";

import React from "react";
import { Home, Compass, Tv2, History, ThumbsUp, Clock, Sparkles } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
}) => {
  const mainNav = [
    { name: "Home", icon: Home },
    { name: "Explore", icon: Compass },
    { name: "Subscriptions", icon: Tv2 },
    { name: "History", icon: History },
  ];

  const libraryNav = [
    { name: "Liked Videos", icon: ThumbsUp },
    { name: "Watch Later", icon: Clock },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-background border-r border-surface-border transition-all duration-300 ${
        isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-20"
      } flex flex-col justify-between p-3 overflow-y-auto`}
    >
      <div className="space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? "bg-adless-cyan/15 text-adless-cyan font-semibold border border-adless-cyan/30"
                    : "text-slate-400 hover:text-white hover:bg-surface-hover"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-adless-cyan" : "text-slate-400"}`} />
                <span className={!isOpen ? "lg:hidden" : ""}>{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-surface-border pt-4 space-y-1">
          <div className={`px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${!isOpen ? "lg:hidden" : ""}`}>
            Library
          </div>
          {libraryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? "bg-adless-purple/15 text-adless-purple font-semibold border border-adless-purple/30"
                    : "text-slate-400 hover:text-white hover:bg-surface-hover"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-adless-purple" : "text-slate-400"}`} />
                <span className={!isOpen ? "lg:hidden" : ""}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Adless Studio Teaser Pill */}
      <div className={`mt-auto p-3 rounded-2xl bg-gradient-to-br from-surface to-surface-hover stroke-surface-border border border-surface-border ${!isOpen ? "lg:hidden" : ""}`}>
        <div className="flex items-center gap-2 mb-1 text-adless-cyan font-semibold text-xs uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Engine</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          Contextual product placement active. No mid-roll interruptions.
        </p>
        <div className="text-[11px] font-mono text-adless-purple font-medium bg-adless-purple/10 px-2 py-1 rounded border border-adless-purple/20">
          Adless Phase 1 Foundation
        </div>
      </div>
    </aside>
  );
};
