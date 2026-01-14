import React from "react";
import { Trash2 } from "lucide-react";
import { TextInput } from "./inputs/TextInput";
import { DateTimeInput } from "./inputs/DateTimeInput";
import { Toggle } from "./inputs/Toggle";
import { ImageInput, ImageValue } from "./inputs/ImageInput";
import { IdCardTemplateSelector } from "./IdCardTemplateSelector";

interface Props {
  value: SessionFormValue;
  layouts: {
    id: string;
    name: string;
    thumbnailUrl: string;
  }[];
  onChange: (value: SessionFormValue) => void;
  onDelete: () => void;
}
export interface SessionFormValue {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isDefault: boolean;
  banner: ImageValue | null;

  /** NEW: explicit flag */
  issuesIdCard: boolean;

  /** Optional template */
  idCardTemplateId?: string;
}


export const SessionForm: React.FC<Props> = ({
  value,
  layouts,
  onChange,
  onDelete,
}) => {
  const update = <K extends keyof SessionFormValue>(
    key: K,
    val: SessionFormValue[K]
  ): void => {
    onChange({ ...value, [key]: val });
  };

  const hasIdCard: boolean = Boolean(value.idCardTemplateId);

  return (
    <div className="rounded-lg p-4 space-y-4 bg-gray-800">
      {/* Delete */}
      <div className="flex justify-end">
        <button onClick={onDelete}>
          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-600" />
        </button>
      </div>

      {/* Banner */}
      <ImageInput
        label="Session Banner"
        value={value.banner}
        onChange={(v) => update("banner", v)}
      />

      {/* Name */}
      <TextInput
        placeholder="Session Name"
        value={value.name}
        onChange={(v) => update("name", v)}
      />

      {/* Time */}
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

      {/* Default */}
      <Toggle
        label="Make Default Session"
        checked={value.isDefault}
        onChange={(v) => update("isDefault", v)}
      />

      {/* Description */}
      <textarea
        value={value.description}
        onChange={(e) => update("description", e.target.value)}
        className="rounded-xl bg-gray-700 p-3 w-full"
        rows={3}
        placeholder="Session Description"
      />

      {/* ID CARD SECTION */}
{/* ID CARD SECTION */}
<div className="border-t border-gray-700 pt-4 space-y-3">
  <Toggle
    label="Issue ID card for this session"
    checked={value.issuesIdCard}
    onChange={(checked) => {
      update("issuesIdCard", checked);

      // Clear template when turning OFF
      if (!checked) {
        update("idCardTemplateId", undefined);
      }
    }}
  />

  {value.issuesIdCard && (
    <IdCardTemplateSelector
      layouts={layouts}
      selectedId={value.idCardTemplateId ?? ""}
      onSelect={(id) =>
        update("idCardTemplateId", id)
      }
    />
  )}
</div>

    </div>
  );
};
