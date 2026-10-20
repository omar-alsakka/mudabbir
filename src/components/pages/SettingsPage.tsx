"use client";

import { useState } from "react";
import { User, Globe, Coins, EyeOff, Moon, Monitor, Sun, Check } from "lucide-react";
import { pick } from "@/lib/mockData";
import { usePrivacyStore } from "@/stores/privacyStore";
import { useThemeStore } from "@/stores/themeStore";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function SettingsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const { isPrivacyMode, togglePrivacy } = usePrivacyStore();
  const { theme, setTheme } = useThemeStore();
  const [currency, setCurrency] = useState("USD");
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: t("Light", "فاتح") },
    { value: "dark" as const, icon: Moon, label: t("Dark", "داكن") },
    { value: "oled" as const, icon: Monitor, label: "OLED" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {saved && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-success px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {t("Settings saved", "تم حفظ الإعدادات")}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t("Settings", "الإعدادات")}</h1>
        <p className="text-sm text-text-secondary">{t("Personalize your experience", "خصّص تجربتك")}</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Profile */}
        <div className="glass-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-text-primary">{t("Profile", "الملف الشخصي")}</h2>
          </div>
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-2xl">👤</div>
            <button type="button" className="rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent">
              {t("Change Avatar", "تغيير الصورة")}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Full Name", "الاسم الكامل")}</label>
              <input defaultValue="Tarek" className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Email", "البريد الإلكتروني")}</label>
              <input type="email" defaultValue="tarek@example.com" className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Currency & Language */}
        <div className="glass-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Coins className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-text-primary">{t("Currency & Language", "العملة واللغة")}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Base Currency", "العملة الأساسية")}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="USD">USD — {t("US Dollar", "دولار أمريكي")}</option>
                <option value="SAR">SAR — {t("Saudi Riyal", "ريال سعودي")}</option>
                <option value="SYP">SYP — {t("Syrian Pound", "ليرة سورية")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Language", "اللغة")}</label>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-2">
                  <span className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium ${locale === "en" ? "border-accent bg-accent/10 text-accent" : "border-border-color bg-bg-secondary text-text-secondary"}`}>
                    {locale === "en" && <Check className="h-4 w-4" />} English
                  </span>
                  <span className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium ${locale === "ar" ? "border-accent bg-accent/10 text-accent" : "border-border-color bg-bg-secondary text-text-secondary"}`}>
                    {locale === "ar" && <Check className="h-4 w-4" />} العربية
                  </span>
                </div>
                <div className="rounded-lg border border-border-color p-1">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-text-primary">{t("Appearance", "المظهر")}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                  theme === opt.value ? "border-accent bg-accent/10 text-accent" : "border-border-color bg-bg-secondary text-text-secondary hover:text-text-primary"
                }`}
              >
                <opt.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stealth mode */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${isPrivacyMode ? "bg-accent/15 text-accent" : "bg-bg-secondary text-text-secondary"}`}>
                <EyeOff className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">{t("Stealth Mode", "وضع التخفي")}</h2>
                <p className="text-sm text-text-secondary">{t("Hide all amounts with ****", "إخفاء كل المبالغ بـ ****")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={togglePrivacy}
              role="switch"
              aria-checked={isPrivacyMode}
              className={`relative h-7 w-12 rounded-full transition-colors ${isPrivacyMode ? "bg-accent" : "bg-bg-secondary border border-border-color"}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${isPrivacyMode ? "start-6" : "start-1"}`}
              />
            </button>
          </div>
        </div>

        <button type="submit" className="w-full rounded-xl bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-hover">
          {t("Save Settings", "حفظ الإعدادات")}
        </button>
      </form>
    </div>
  );
}
