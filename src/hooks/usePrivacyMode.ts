import { usePrivacyStore } from "@/stores/privacyStore";

export function usePrivacyMode() {
  const isPrivacyMode = usePrivacyStore((s) => s.isPrivacyMode);
  const togglePrivacy = usePrivacyStore((s) => s.togglePrivacy);
  const setPrivacy = usePrivacyStore((s) => s.setPrivacy);

  return { isPrivacyMode, togglePrivacy, setPrivacy };
}
