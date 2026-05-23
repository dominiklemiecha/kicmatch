import type { ParticipantListItem, ParticipantStatus, UpdateParticipantStatusInput } from "@kicmatch/shared";
import { api } from "@/lib/api-client";

export async function listParticipants(eventId: string, params: { status?: ParticipantStatus | "ALL"; q?: string }): Promise<ParticipantListItem[]> {
  const search = new URLSearchParams();
  if (params.status && params.status !== "ALL") search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  const qs = search.toString();
  const res = await api.get<ParticipantListItem[]>(`/events/${eventId}/participants${qs ? `?${qs}` : ""}`);
  return res.data;
}

export async function updateParticipantStatus(participantId: string, input: UpdateParticipantStatusInput): Promise<ParticipantListItem> {
  const res = await api.patch<ParticipantListItem>(`/participants/${participantId}/status`, input);
  return res.data;
}
