"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PrivacyToggle } from "./PrivacyToggle";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarProps {
  locale: string;
  onMenuToggle?: () => void;
}

export function Navbar({ locale, onMenuToggle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-color bg-bg-primary/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href={`/${locale}`}
            className="text-xl font-bold text-accent"
          >
            {locale === "ar" ? "مدبر" : "Mudabbir"}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <PrivacyToggle />
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary hover:text-danger transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
