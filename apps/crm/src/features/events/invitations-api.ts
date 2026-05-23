import type { CreateInvitationsInput, InvitationResponse } from "@kicmatch/shared";
import { api } from "@/lib/api-client";

export async function listInvitations(eventId: string): Promise<InvitationResponse[]> {
  const res = await api.get<InvitationResponse[]>(`/events/${eventId}/invitations`);
  return res.data;
}

export async function createInvitations(eventId: string, input: CreateInvitationsInput): Promise<InvitationResponse[]> {
  const res = await api.post<InvitationResponse[]>(`/events/${eventId}/invitations`, input);
  return res.data;
}

export async function deleteInvitation(eventId: string, invitationId: string): Promise<void> {
  await api.delete(`/events/${eventId}/invitations/${invitationId}`);
}

export async function resendInvitation(eventId: string, invitationId: string): Promise<void> {
  await api.post(`/events/${eventId}/invitations/${invitationId}/resend`);
}
