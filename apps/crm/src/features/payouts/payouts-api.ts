import type { PayoutBalance, PayoutRequestInput, PayoutResponse } from "@kicmatch/shared";
import { api } from "@/lib/api-client";

export async function getPayoutBalance(): Promise<PayoutBalance> {
  const res = await api.get<PayoutBalance>("/payouts/balance");
  return res.data;
}

export async function listMyPayouts(): Promise<PayoutResponse[]> {
  const res = await api.get<PayoutResponse[]>("/payouts/requests");
  return res.data;
}

export async function createPayoutRequest(input: PayoutRequestInput): Promise<PayoutResponse> {
  const res = await api.post<PayoutResponse>("/payouts/requests", input);
  return res.data;
}
