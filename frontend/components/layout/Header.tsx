"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, Video, Menu, Sparkles, X } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  toggleSidebar,
}) => {
  return (
      <header className="sticky top-0 z-50 glass-header px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Branding & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2 text-slate-400 hover:text-white hover:bg-surface-hover rounded-full transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-adless-purple via-blue-600 to-adless-cyan p-[2px] shadow-glow-cyan">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-adless-cyan group-hover:rotate-12 transition transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Adless
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-adless-cyan/10 text-adless-cyan border border-adless-cyan/30">
                  AI MVP
                </span>
              </span>
            </div>
          </a>
        </div>

        {/* Middle Search Input */}
        <div className="flex-1 max-w-xl hidden md:flex items-center relative">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, creators, or AI topics..."
              className="w-full bg-surface border border-surface-border focus:border-adless-cyan/60 rounded-full py-2 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-adless-cyan/50 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/studio/upload"
            title="Upload Video"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface border border-surface-border hover:border-adless-cyan/50 hover:bg-surface-hover text-slate-200 transition active:scale-95"
          >
            <Video className="w-4 h-4 text-adless-cyan" />
            <span>Upload</span>
          </Link>

          <button
            title="Notifications"
            className="p-2 text-slate-400 hover:text-white hover:bg-surface-hover rounded-full transition relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-adless-cyan animate-pulse"></span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-adless-cyan p-[2px] cursor-pointer hover:scale-105 transition">
            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-xs text-white">
              V
            </div>
          </div>
        </div>
      </header>
  );
};
