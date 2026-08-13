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
    <div className="flex items-center gap-3 overflow-x-auto py-3 scrollbar-none">
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isSelected
                ? "bg-[#f1f1f1] text-[#0f0f0f]"
                : "bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
