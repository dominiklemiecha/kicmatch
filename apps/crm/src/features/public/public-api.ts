import type { CheckoutSessionInput, CheckoutSessionResponse, PublicEvent, RsvpInput, RsvpResult } from "@kicmatch/shared";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3010/api/v1";

// Separate axios instance: no auth, no cookies needed for public RSVP
const publicApi = axios.create({ baseURL });

export async function getPublicEvent(slug: string): Promise<PublicEvent> {
  const res = await publicApi.get<PublicEvent>(`/public/events/${slug}`);
  return res.data;
}

export async function rsvpToEvent(slug: string, input: RsvpInput): Promise<RsvpResult> {
  const res = await publicApi.post<RsvpResult>(`/public/events/${slug}/rsvp`, input);
  return res.data;
}

export async function createCheckoutSession(slug: string, input: CheckoutSessionInput): Promise<CheckoutSessionResponse> {
  const res = await publicApi.post<CheckoutSessionResponse>(`/public/events/${slug}/checkout-session`, input);
  return res.data;
}
