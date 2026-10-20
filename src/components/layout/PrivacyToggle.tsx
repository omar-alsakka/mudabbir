"use client";

import { EyeOff, Eye } from "lucide-react";
import { usePrivacyStore } from "@/stores/privacyStore";

export function PrivacyToggle() {
  const { isPrivacyMode, togglePrivacy } = usePrivacyStore();

  return (
    <button
      onClick={togglePrivacy}
      className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
      title={isPrivacyMode ? "Show amounts" : "Hide amounts"}
    >
      {isPrivacyMode ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  );
}
