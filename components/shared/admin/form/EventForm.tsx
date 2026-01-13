"use client";

import React from "react";
import { TextInput } from "./inputs/TextInput";
import { DateTimeInput } from "./inputs/DateTimeInput";
import { ImageInput, ImageValue } from "./inputs/ImageInput";

export interface EventFormValue {
  name: string;
  description: string;
  venue: string;
  location: string;
  startTime: string;
  endTime: string;
  banner: ImageValue | null;
}

interface EventFormProps {
  value: EventFormValue;
  onChange: (value: EventFormValue) => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  value,
  onChange,
}) => {
  const update = <K extends keyof EventFormValue>(
    key: K,
    val: EventFormValue[K]
  ): void => {
    onChange({ ...value, [key]: val });
  };

  return (
    <section className="space-y-6 bg-gray-800 p-4 rounded-md">
      <h2 className="text-xl font-semibold">Event Details</h2>
      
      <div className="flex justify-between">
        <ImageInput
            label="Upload Event Banner"
            value={value.banner}
            onChange={(v) => update("banner", v)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          placeholder="Event Name"
          value={value.name}
          onChange={(v) => update("name", v)}
        />

        <TextInput
          placeholder="Venue"
          value={value.venue}
          onChange={(v) => update("venue", v)}
        />

        <DateTimeInput
          value={value.startTime}
          onChange={(v) => update("startTime", v)}
        />

        <DateTimeInput
          value={value.endTime}
          onChange={(v) => update("endTime", v)}
        />

        <TextInput
          placeholder="Location (City)"
          value={value.location}
          onChange={(v) => update("location", v)}
        />
      </div>

      <textarea
        className="  rounded-xl bg-gray-700  p-3 w-full"
        rows={4}
        placeholder="Event Description"
        value={value.description}
        onChange={(e) => update("description", e.target.value)}
      />
    </section>
  );
};
