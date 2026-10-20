"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const themes = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "oled" as const, icon: Monitor, label: "OLED" },
  ];

  const nextTheme = () => {
    const idx = themes.findIndex((t) => t.value === theme);
    setTheme(themes[(idx + 1) % themes.length].value);
  };

  const CurrentIcon = themes.find((t) => t.value === theme)?.icon ?? Moon;

  return (
    <button
      onClick={nextTheme}
      className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
      title={`Theme: ${theme}`}
    >
      <CurrentIcon className="h-5 w-5" />
    </button>
  );
}
