import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The native shell loads the live site from Dokploy by default so every
 * deploy becomes the next "version" of the app, without resubmitting to
 * App Store / Play Store.
 *
 * The local `dist/` build is still required by Capacitor and is used as
 * an offline fallback if the WebView can't reach the URL.
 *
 * Override the URL at build-time with the KICMATCH_NATIVE_URL env var
 * (e.g. for staging or local dev pointing at http://10.0.2.2:5173).
 */
const remoteUrl = process.env.KICMATCH_NATIVE_URL ?? "https://www.kicmatch.com";

const config: CapacitorConfig = {
  appId: "com.firefeed.kicmatch",
  appName: "Kicmatch",
  webDir: "dist",
  server: {
    url: remoteUrl,
    androidScheme: "https",
    iosScheme: "https",
    cleartext: false,
  },
  android: {
    backgroundColor: "#0b0518",
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: "#0b0518",
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
  },
};

export default config;
