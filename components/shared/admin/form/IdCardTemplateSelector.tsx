"use client";

import React from "react";
import Image from "next/image";

interface IdCardLayout {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface Props {
  layouts: IdCardLayout[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const IdCardTemplateSelector: React.FC<Props> = ({
  layouts,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 rounded-lg p-6 bg-gray-900">
      {layouts.map((layout) => {
        const isSelected = selectedId === layout.id;
        return (
          <div
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            className="group flex flex-col items-center space-y-2 cursor-pointer"
          >
            {/* 1. Portrait Container using aspect-ratio */}
            <div 
              className={`relative aspect-[2/3] w-full overflow-hidden rounded-xl  transition-all ${
                isSelected 
                ? "border-gray-400 ring-4 ring-gray-500/20 shadow-lg scale-105" 
                : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <Image
                src={layout.thumbnailUrl}
                alt={layout.name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            
            {/* Label */}
            <p className={`text-xs font-semibold p-4 uppercase tracking-wider ${
              isSelected ? "text-gray-200" : "text-gray-400"
            }`}>
              {layout.name}
            </p>
          </div>
        );
      })}
    </div>
  );
};