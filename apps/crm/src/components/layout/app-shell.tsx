import type { ReactNode } from "react";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { isNative } from "@/lib/platform";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  // In the Capacitor native shell we drop the desktop sidebar/topbar and use
  // a fixed bottom nav with a slide-up sheet for the full menu instead.
  const native = isNative();

  if (native) {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
        <main
          className="flex-1 overflow-y-auto p-4"
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
            paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)",
          }}
        >
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
}
