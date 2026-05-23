import type { CreateEventInput, EventFormInput, EventFormResponse, EventResponse, UpdateEventInput } from "@kicmatch/shared";

import { api } from "@/lib/api-client";

export async function listEvents(): Promise<EventResponse[]> {
  const res = await api.get<EventResponse[]>("/events");
  return res.data;
}

export async function createEvent(input: CreateEventInput): Promise<EventResponse> {
  const res = await api.post<EventResponse>("/events", input);
  return res.data;
}

export async function getEvent(id: string): Promise<EventResponse> {
  const res = await api.get<EventResponse>(`/events/${id}`);
  return res.data;
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<EventResponse> {
  const res = await api.patch<EventResponse>(`/events/${id}`, input);
  return res.data;
}

export async function publishEvent(id: string): Promise<EventResponse> {
  const res = await api.post<EventResponse>(`/events/${id}/publish`);
  return res.data;
}

export async function getEventForm(id: string): Promise<EventFormResponse> {
  const res = await api.get<EventFormResponse>(`/events/${id}/form`);
  return res.data;
}

export async function putEventForm(id: string, input: EventFormInput): Promise<EventFormResponse> {
  const res = await api.put<EventFormResponse>(`/events/${id}/form`, input);
  return res.data;
}
