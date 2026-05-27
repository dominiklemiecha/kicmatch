import { PushNotifications } from "@capacitor/push-notifications";
import { api } from "@/lib/api-client";
import { isNative, nativePlatform } from "@/lib/platform";

let registered = false;

/**
 * Registers this device with FCM and posts the token to the backend so the
 * organizer's account starts receiving push notifications on this device.
 * Safe to call multiple times; only the first invocation per session does
 * the actual work. No-op on web.
 */
export async function registerPushNotifications(): Promise<void> {
  if (!isNative() || registered) return;
  registered = true;
  try {
    const platform = nativePlatform();
    if (!platform) return;

    const perm = await PushNotifications.checkPermissions();
    let granted = perm.receive === "granted";
    if (!granted) {
      const req = await PushNotifications.requestPermissions();
      granted = req.receive === "granted";
    }
    if (!granted) {
      // eslint-disable-next-line no-console
      console.log("[push] permission denied");
      return;
    }

    // The 'registration' event fires once FCM gives us a token. Set up the
    // listener BEFORE calling register() to avoid a race.
    const registration = await PushNotifications.addListener("registration", async (token) => {
      try {
        await api.post("/devices/register", { token: token.value, platform });
      } catch {
        // Network may be flaky on first launch; ignore — we'll retry next session
      }
    });

    await PushNotifications.addListener("registrationError", (err) => {
      // eslint-disable-next-line no-console
      console.error("[push] registration error", err);
    });

    // Future: handle taps on notifications to deep-link into the app
    await PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
      // eslint-disable-next-line no-console
      console.log("[push] tapped", event.notification.data);
    });

    await PushNotifications.register();

    // Keep a reference so the listener isn't garbage-collected
    void registration;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[push] setup failed", err);
    registered = false;
  }
}
