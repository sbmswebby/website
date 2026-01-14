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
    <div className="flex items-start m-4 p-4 bg-gray-700 w-full gap-4 rounded-lg">
      <div className="w-28 h-28 border rounded flex items-center justify-center overflow-hidden">
        {value ? (
          <img src={value.url} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon />
        )}
      </div>

      <label className="cursor-pointer flex items-center gap-2 text-sm">
        <Upload className="w-4 h-4" />
        {label}
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
    </div>
  );
};
