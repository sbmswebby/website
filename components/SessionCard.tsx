// components/SessionCard.tsx
"use client";
import Image from "next/image";
import React from "react";

type Props = {
  id: string;
  title: string;
  description: string;
  cost: number;
  imageUrl: string;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function SessionCard({ id, title, description, cost, imageUrl, selected, onSelect }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(id)}
      className={`border rounded-xl p-4 flex flex-col gap-3 cursor-pointer focus:outline-2 focus:outline-offset-2 ${
        selected ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200 hover:shadow"
      }`}
    >
      <div className="relative h-36 w-full rounded-md overflow-hidden bg-gray-50">
        {/* next/image will handle optimization */}
        <Image src={imageUrl} alt={title} fill style={{ objectFit: "cover" }} />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <div className="text-lg font-medium">₹{cost}</div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(id); }}
          className={`px-3 py-1 rounded-md ${selected ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}
          aria-label={`Select ${title}`}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
}
