"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Target,
  HandCoins,
  CreditCard,
  ShoppingCart,
  BarChart3,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

const getNavItems = (locale: string) => [
  {
    href: `/${locale}/dashboard`,
    label: locale === "ar" ? "لوحة التحكم" : "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: `/${locale}/wallets`,
    label: locale === "ar" ? "المحافظ" : "Wallets",
    icon: Wallet,
  },
  {
    href: `/${locale}/transactions`,
    label: locale === "ar" ? "المعاملات" : "Transactions",
    icon: ArrowLeftRight,
  },
  {
    href: `/${locale}/budgets`,
    label: locale === "ar" ? "الميزانيات" : "Budgets",
    icon: PiggyBank,
  },
  {
    href: `/${locale}/savings`,
    label: locale === "ar" ? "التوفير" : "Savings",
    icon: Target,
  },
  {
    href: `/${locale}/debts`,
    label: locale === "ar" ? "الديون" : "Debts",
    icon: HandCoins,
  },
  {
    href: `/${locale}/subscriptions`,
    label: locale === "ar" ? "الاشتراكات" : "Subscriptions",
    icon: CreditCard,
  },
  {
    href: `/${locale}/shopping-list`,
    label: locale === "ar" ? "قائمة التسوق" : "Shopping List",
    icon: ShoppingCart,
  },
  {
    href: `/${locale}/reports`,
    label: locale === "ar" ? "التقارير" : "Reports",
    icon: BarChart3,
  },
  {
    href: `/${locale}/settings`,
    label: locale === "ar" ? "الإعدادات" : "Settings",
    icon: Settings,
  },
];

export function Sidebar({ locale, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(locale);
  const isRtl = locale === "ar";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-border-color bg-bg-primary transition-transform duration-300",
          isOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full",
          "md:sticky md:top-16 md:z-0 md:h-[calc(100vh-4rem)] md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="text-lg font-bold text-accent">
            {locale === "ar" ? "مدبر" : "Mudabbir"}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
