import { App } from "@capacitor/app";
import { Fingerprint } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { isBiometricLockEnabled, promptBiometric } from "@/lib/biometric";
import { isNative } from "@/lib/platform";
import { Button } from "@/components/ui/button";

interface BiometricGateProps {
  children: ReactNode;
}

/**
 * Wraps the authenticated app. When the user has enabled the biometric lock,
 * shows a full-screen lock and requires Face ID / fingerprint before the CRM
 * is revealed — on first launch and every time the app returns to foreground.
 * No-op on web or when the lock is disabled.
 */
export function BiometricGate({ children }: BiometricGateProps): JSX.Element {
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const unlocking = useRef(false);

  const tryUnlock = useCallback(async (): Promise<void> => {
    if (unlocking.current) return;
    unlocking.current = true;
    const ok = await promptBiometric();
    unlocking.current = false;
    if (ok) setLocked(false);
  }, []);

  // Decide initial lock state
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isNative()) {
        setChecking(false);
        return;
      }
      const enabled = await isBiometricLockEnabled();
      if (cancelled) return;
      setChecking(false);
      if (enabled) {
        setLocked(true);
        void tryUnlock();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tryUnlock]);

  // Re-lock whenever the app returns to the foreground
  useEffect(() => {
    if (!isNative()) return;
    let handle: { remove: () => void } | undefined;
    void App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) return;
      void isBiometricLockEnabled().then((enabled) => {
        if (enabled) setLocked(true);
      });
    }).then((h) => {
      handle = h;
    });
    return () => handle?.remove();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
      {locked && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#0b0518] px-6 text-center text-white">
          <img src="/logo_white.png" alt="Kicmatch" className="h-8 w-auto opacity-90" />
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
            <Fingerprint className="h-10 w-10 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold">App bloccata</div>
            <div className="text-sm text-white/60 mt-1">Sblocca con la biometria per continuare</div>
          </div>
          <Button onClick={() => void tryUnlock()} className="rounded-full px-8">
            Sblocca
          </Button>
        </div>
      )}
    </>
  );
}
