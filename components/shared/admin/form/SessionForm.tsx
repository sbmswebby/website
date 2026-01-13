"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { TextInput } from "./inputs/TextInput";
import { DateTimeInput } from "./inputs/DateTimeInput";
import { Toggle } from "./inputs/Toggle";
import { ImageInput, ImageValue } from "./inputs/ImageInput";

export interface SessionFormValue {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isDefault: boolean;
  banner: ImageValue | null;
}

interface SessionFormProps {
  value: SessionFormValue;
  onChange: (value: SessionFormValue) => void;
  onDelete: () => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({
  value,
  onChange,
  onDelete,
}) => {
  const update = <K extends keyof SessionFormValue>(
    key: K,
    val: SessionFormValue[K]
  ): void => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className=" rounded-lg p-4 space-y-4 bg-gray-800">
        <div className=" h-2 flex justify-end"> 
            <button onClick={onDelete} className="p-1  rounded-full transition-colors">
            <Trash2 className="text-red-400 hover:text-red-600 w-6 h-6" />
            </button>
        </div>
      <div className="flex justify-between">
        <ImageInput
          label="Upload Session Banner"
          value={value.banner}
          onChange={(v) => update("banner", v)}
        />
      </div>

      <TextInput
        placeholder="Session Name"
        value={value.name}
        onChange={(v) => update("name", v)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateTimeInput
          value={value.startTime}
          onChange={(v) => update("startTime", v)}
        />
        <DateTimeInput
          value={value.endTime}
          onChange={(v) => update("endTime", v)}
        />
      </div>

      <div className=" flex rounded-lg p-3 w-60 bg-gray-700">
      <Toggle
        label="Make Default Session"
        checked={value.isDefault}
        onChange={(v) => update("isDefault", v)}
      />
      </div>

      <textarea
        value={value.description}
        onChange={(e) => update("description", e.target.value)}
        className=" rounded-xl bg-gray-700 p-3 w-full"
        rows={3}
        placeholder="Session Description"
      />
    </div>
  );
};
