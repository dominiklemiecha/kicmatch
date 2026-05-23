import type { AuthResponse } from "@kicmatch/shared";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/auth-store";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3010/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const res = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, null, { withCredentials: true });
    useAuthStore.getState().setSession(res.data.accessToken, res.data.user);
    return res.data.accessToken;
  } catch {
    useAuthStore.getState().clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (!original || original._retried) throw error;
    const status = error.response?.status;
    const isRefreshCall = original.url?.endsWith("/auth/refresh");
    if (status === 401 && !isRefreshCall) {
      original._retried = true;
      refreshPromise = refreshPromise ?? performRefresh();
      const newToken = await refreshPromise;
      refreshPromise = null;
      if (!newToken) throw error;
      if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
      return api.request(original);
    }
    throw error;
  },
);

export async function bootstrapSession(): Promise<void> {
  const newToken = await performRefresh();
  if (!newToken) {
    useAuthStore.getState().setStatus("unauthenticated");
  }
}
