import { api } from "@/lib/api-client";

export interface AdminStats {
  users: number;
  events: number;
  participants: number;
  revenueCents: number;
  feesCents: number;
  pendingPayoutCents: number;
  pendingPayoutCount: number;
}

export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileType: string;
  plan: string;
  createdAt: string;
  subscriptionStartAt: string | null;
  subscriptionEndAt: string | null;
  isBlocked: boolean;
  blockedAt: string | null;
  eventsCount: number;
  revenueCents: number;
  feesCents: number;
  payoutCount: number;
  lastPayoutAt: string | null;
}

export interface AdminUserDetail {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileType: string;
    plan: string;
    ibanDefault: string | null;
    ibanHolderDefault: string | null;
    createdAt: string;
    subscriptionStartAt: string | null;
    subscriptionEndAt: string | null;
    isBlocked: boolean;
    blockedAt: string | null;
    blockedReason: string | null;
  };
  payoutStats: { count: number; firstAt: string | null; lastAt: string | null; avgIntervalDays: number | null };
  events: { id: string; name: string; slug: string; status: string; startAt: string; isPaid: boolean; priceCents: number | null; currency: string }[];
  payouts: { id: string; amountCents: number; currency: string; iban: string; ibanHolder: string; status: string; notes: string | null; adminNotes: string | null; requestedAt: string; processedAt: string | null }[];
  financials: { totalCollectedCents: number; totalFeesCents: number; totalPaidOutCents: number; availableCents: number };
}

export interface AdminPayoutItem {
  id: string;
  amountCents: number;
  currency: string;
  iban: string;
  ibanHolder: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  notes: string | null;
  adminNotes: string | null;
  requestedAt: string;
  processedAt: string | null;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export async function getAdminStats(): Promise<AdminStats> { return (await api.get<AdminStats>("/admin/stats")).data; }
export async function listAdminUsers(): Promise<AdminUserListItem[]> { return (await api.get<AdminUserListItem[]>("/admin/users")).data; }
export async function getAdminUser(id: string): Promise<AdminUserDetail> { return (await api.get<AdminUserDetail>(`/admin/users/${id}`)).data; }
export async function listAdminPayouts(status?: "PENDING" | "PAID" | "REJECTED"): Promise<AdminPayoutItem[]> {
  const res = await api.get<AdminPayoutItem[]>(`/admin/payouts${status ? `?status=${status}` : ""}`);
  return res.data;
}
export async function markAdminPayout(id: string, status: "PAID" | "REJECTED", adminNotes?: string): Promise<unknown> {
  return (await api.patch(`/admin/payouts/${id}`, { status, adminNotes })).data;
}
export async function setUserBlocked(id: string, blocked: boolean, reason?: string): Promise<unknown> {
  return (await api.patch(`/admin/users/${id}/block`, { blocked, reason })).data;
}
export async function updateUserSubscription(id: string, body: { subscriptionStartAt?: string | null; subscriptionEndAt?: string | null }): Promise<unknown> {
  return (await api.patch(`/admin/users/${id}/subscription`, body)).data;
}
