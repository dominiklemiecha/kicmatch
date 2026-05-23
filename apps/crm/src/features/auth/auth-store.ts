import type { MeResponse } from "@kicmatch/shared";
import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  user: MeResponse | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  setSession: (accessToken: string, user: MeResponse) => void;
  setUser: (user: MeResponse) => void;
  clear: () => void;
  setStatus: (status: AuthState["status"]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "idle",
  setSession: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
  setStatus: (status) => set({ status }),
}));
