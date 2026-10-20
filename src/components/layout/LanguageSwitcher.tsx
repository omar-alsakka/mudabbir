"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";

const locales = ["en", "ar"] as const;

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale =
    locales.find((l) => pathname.startsWith(`/${l}`)) ?? "en";

  const switchLocale = () => {
    const nextLocale = currentLocale === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLocale}
      className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
      title={currentLocale === "en" ? "العربية" : "English"}
    >
      <Languages className="h-5 w-5" />
    </button>
  );
}
