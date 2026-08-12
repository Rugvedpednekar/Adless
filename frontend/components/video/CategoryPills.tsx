"use client";

import React from "react";
import { NavCategory } from "@/types";
import { CATEGORIES } from "@/lib/categories";

interface CategoryPillsProps {
  selectedCategory: NavCategory;
  onSelectCategory: (category: NavCategory) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isSelected
                ? "bg-gradient-to-r from-adless-cyan to-blue-600 text-slate-950 shadow-glow-cyan font-bold"
                : "bg-surface border border-surface-border text-slate-300 hover:text-white hover:bg-surface-hover hover:border-slate-600"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
