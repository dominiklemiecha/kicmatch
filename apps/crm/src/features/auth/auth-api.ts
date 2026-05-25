import type { AuthResponse, LoginInput, MeResponse, RegisterInput } from "@kicmatch/shared";
import { api } from "@/lib/api-client";

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", input);
  return res.data;
}

export async function registerRequest(input: RegisterInput): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", input);
  return res.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}

export async function meRequest(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/auth/me");
  return res.data;
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPasswordRequest(token: string, password: string): Promise<void> {
  await api.post("/auth/reset-password", { token, password });
}
