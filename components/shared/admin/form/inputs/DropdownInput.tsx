"use client";

import React from "react";

interface DropdownInputProps<T extends string> {
  label?: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}

export function DropdownInput<T extends string>({
  label,
  value,
  options,
  onChange,
}: DropdownInputProps<T>) {
  return (
    <div className="space-y-1 bg-gray-700 rounded-md">
      {label && <label className="text-sm font-medium">{label}</label>}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg bg-gray-700 p-3 w-full"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
