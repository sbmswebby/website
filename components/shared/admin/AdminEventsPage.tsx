"use client";

import React, { useState } from "react";
import EventPicker from "@/components/shared/admin/form/EventPicker";
import EventAndSessionsForm from "@/components/shared/admin/form/EventAndSessionsForm";

const AdminEventsPage: React.FC = () => {
  const [mode, setMode] = useState<
    | { type: "pick" }
    | { type: "create" }
    | { type: "edit"; eventId: string }
  >({ type: "pick" });

  if (mode.type === "pick") {
    return (
      <EventPicker
        onCreateNew={() =>
          setMode({ type: "create" })
        }
        onSelectEvent={(id) =>
          setMode({ type: "edit", eventId: id })
        }
      />
    );
  }

  return (
    <EventAndSessionsForm
      eventId={
        mode.type === "edit"
          ? mode.eventId
          : undefined
      }
    />
  );
};

export default AdminEventsPage;
