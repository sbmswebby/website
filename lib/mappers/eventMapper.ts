// lib/mappers/eventMapper.ts

interface EventFormState {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  location: string;
  imageUrl?: string;
}

export const mapEventUpdatePayload = (
  state: EventFormState
): Partial<EventFormState> => {
  const payload: Partial<EventFormState> = {};

  if (state.name) payload.name = state.name;
  if (state.description) payload.description = state.description;
  if (state.startTime) payload.startTime = state.startTime;
  if (state.endTime) payload.endTime = state.endTime;
  if (state.venue) payload.venue = state.venue;
  if (state.location) payload.location = state.location;
  if (state.imageUrl) payload.imageUrl = state.imageUrl;

  return payload;
};
