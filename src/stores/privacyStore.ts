import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrivacyState {
  isPrivacyMode: boolean;
  togglePrivacy: () => void;
  setPrivacy: (value: boolean) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      isPrivacyMode: false,
      togglePrivacy: () =>
        set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
      setPrivacy: (value) => set({ isPrivacyMode: value }),
    }),
    { name: "mudabbir-privacy" }
  )
);
