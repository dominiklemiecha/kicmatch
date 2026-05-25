import { Capacitor } from "@capacitor/core";

/**
 * True only when running inside the Capacitor native shell (Android/iOS).
 * Use to toggle UX that should appear only in the mobile apps, not on web.
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function nativePlatform(): "ios" | "android" | null {
  if (!isNative()) return null;
  const p = Capacitor.getPlatform();
  return p === "ios" || p === "android" ? p : null;
}
