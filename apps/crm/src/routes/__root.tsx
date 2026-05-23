import { Outlet, createRootRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/features/auth/auth-store";
import { bootstrapSession } from "@/lib/api-client";

const PUBLIC_PATHS = new Set([
  "/",
  "/pricing",
  "/funzionalita",
  "/privacy",
  "/termini",
  "/cookie",
  "/login",
  "/register",
  "/register/plan",
  "/register/account",
  "/register/profile",
  "/register/payment",
  "/register/stripe",
  "/register/kicmatch",
  "/register/review",
  "/register/done",
  "/register/onboarding",
  "/forgot-password",
  "/reset-password",
]);

function RootLayout(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { status } = useAuthStore();
  const isPublic = PUBLIC_PATHS.has(location.pathname) || location.pathname.startsWith("/e/");

  useEffect(() => {
    if (status === "idle") {
      useAuthStore.getState().setStatus("loading");
      void bootstrapSession();
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublic) {
      void navigate({ to: "/login", replace: true });
    }
  }, [status, isPublic, navigate]);

  if (isPublic) {
    return <Outlet />;
  }

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div className="min-h-screen" />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export const Route = createRootRoute({ component: RootLayout });
