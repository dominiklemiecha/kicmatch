import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";
import { Preferences } from "@capacitor/preferences";
import { isNative } from "@/lib/platform";

const LOCK_PREF_KEY = "kicmatch_biometric_lock";

/** True if the device has a usable biometric sensor (and it's enrolled). */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const info = await BiometricAuth.checkBiometry();
    return info.isAvailable;
  } catch {
    return false;
  }
}

/** Whether the user has turned on the biometric app lock. */
export async function isBiometricLockEnabled(): Promise<boolean> {
  if (!isNative()) return false;
  const { value } = await Preferences.get({ key: LOCK_PREF_KEY });
  return value === "1";
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  await Preferences.set({ key: LOCK_PREF_KEY, value: enabled ? "1" : "0" });
}

/**
 * Prompts the OS biometric dialog. Resolves true on success, false on any
 * failure or cancellation.
 */
export async function promptBiometric(reason = "Sblocca Kicmatch"): Promise<boolean> {
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Annulla",
      allowDeviceCredential: true,
      iosFallbackTitle: "Usa codice",
      androidTitle: "Sblocca Kicmatch",
      androidSubtitle: "Conferma la tua identità",
      androidConfirmationRequired: false,
    });
    return true;
  } catch {
    return false;
  }
}
