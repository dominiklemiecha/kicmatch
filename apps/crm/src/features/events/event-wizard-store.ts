import { create } from "zustand";

interface EventWizardState {
  eventId: string | null;
  setEventId: (id: string | null) => void;
  reset: () => void;
}

export const useEventWizardStore = create<EventWizardState>((set) => ({
  eventId: null,
  setEventId: (id) => set({ eventId: id }),
  reset: () => set({ eventId: null }),
}));
