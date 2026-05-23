import { create } from "zustand";

interface OnboardingState {
  profileType: "PRIVATE" | "BUSINESS";
  profileName: string;
  country: string;
  stripeConnected: boolean;
  plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  paymentMethod: "STRIPE_CONNECT" | "KICMATCH_COLLECTS" | null;
  kicmatchPayoutFrequency: "ON_DEMAND" | "WEEKLY" | "MONTHLY";
  kicmatchIban: string;
  kicmatchIbanHolder: string;
  setProfile: (p: { profileType: "PRIVATE" | "BUSINESS"; profileName: string; country: string }) => void;
  setStripeConnected: (v: boolean) => void;
  setPlan: (plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE") => void;
  setPaymentMethod: (m: "STRIPE_CONNECT" | "KICMATCH_COLLECTS" | null) => void;
  setKicmatchPrefs: (prefs: { frequency: "ON_DEMAND" | "WEEKLY" | "MONTHLY"; iban: string; ibanHolder: string }) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  profileType: "PRIVATE",
  profileName: "",
  country: "Italia",
  stripeConnected: false,
  plan: "FREE",
  paymentMethod: null,
  kicmatchPayoutFrequency: "ON_DEMAND",
  kicmatchIban: "",
  kicmatchIbanHolder: "",
  setProfile: (p) => set(p),
  setStripeConnected: (v) => set({ stripeConnected: v }),
  setPlan: (plan) => set({ plan }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
  setKicmatchPrefs: (prefs) =>
    set({ kicmatchPayoutFrequency: prefs.frequency, kicmatchIban: prefs.iban, kicmatchIbanHolder: prefs.ibanHolder }),
  reset: () =>
    set({
      profileType: "PRIVATE",
      profileName: "",
      country: "Italia",
      stripeConnected: false,
      plan: "FREE",
      paymentMethod: null,
      kicmatchPayoutFrequency: "ON_DEMAND",
      kicmatchIban: "",
      kicmatchIbanHolder: "",
    }),
}));
