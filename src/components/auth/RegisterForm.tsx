"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export function RegisterForm({ locale }: { locale: string }) {
  const router = useRouter();
  const isAr = locale === "ar";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferredLang: locale,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || (isAr ? "حدث خطأ" : "Something went wrong"));
      setLoading(false);
      return;
    }

    router.push(`/${locale}/login`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-card p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-accent">
            {isAr ? "مدبر" : "Mudabbir"}
          </h1>
          <p className="mt-2 text-text-secondary">
            {isAr ? "إنشاء حساب جديد" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {isAr ? "الاسم الكامل" : "Full Name"}
            </label>
            <div className="relative">
              <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-lg border border-border-color bg-bg-secondary px-10 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {isAr ? "البريد الإلكتروني" : "Email"}
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-lg border border-border-color bg-bg-secondary px-10 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {isAr ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full rounded-lg border border-border-color bg-bg-secondary px-10 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="w-full rounded-lg border border-border-color bg-bg-secondary px-10 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {isAr ? "اللغة المفضلة" : "Preferred Language"}
            </label>
            <select
              value={form.preferredLang}
              onChange={(e) => update("preferredLang", e.target.value)}
              className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAr ? "إنشاء حساب" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-medium text-accent hover:underline"
          >
            {isAr ? "تسجيل الدخول" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
}
