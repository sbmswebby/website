"use client";

import React from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

export interface ImageValue {
  file: File | null;
  url: string;
}

interface ImageInputProps {
  label: string;
  value: ImageValue | null;
  onChange: (value: ImageValue) => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const handleFile = (file: File): void => {
    onChange({
      file,
      url: URL.createObjectURL(file),
    });
  };

  return (
    <label className="group relative flex flex-col sm:flex-row items-center justify-center sm:justify-start m-4 p-6 bg-gray-800 border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-gray-750 transition-all cursor-pointer rounded-xl gap-6">
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Image Preview Box */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-900 border border-gray-600 group-hover:border-blue-500 rounded-lg flex items-center justify-center overflow-hidden shrink-0 transition-colors">
        {value ? (
          <img src={value.url} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <ImageIcon className="text-gray-500 group-hover:text-blue-500" />
        )}
      </div>

      {/* Label and Helper Text */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="flex items-center gap-2 text-white font-medium mb-1">
          <Upload className="w-5 h-5 text-blue-500" />
          <span>{value ? "Change Photo" : label}</span>
        </div>
        <p className="text-xs text-gray-400">
          {value ? "Click anywhere to replace" : "Supports JPG, PNG (Max 5MB)"}
        </p>
      </div>
    </label>
  );
};