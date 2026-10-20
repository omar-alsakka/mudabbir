"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { pick, formatCurrency } from "@/lib/mockData";
import { useFinanceStore } from "@/stores/financeStore";

const categories = ["Food", "Bills", "Transport", "Restaurant", "Health", "Shopping", "Entertainment", "Other"];
const categoriesAr = ["طعام", "فواتير", "مواصلات", "مطعم", "صحة", "تسوق", "ترفيه", "أخرى"];

export function NewTransactionPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const router = useRouter();
  const wallets = useFinanceStore((s) => s.wallets);
  const addExpense = useFinanceStore((s) => s.addExpense);

  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "Food",
    walletId: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description || !amount || amount <= 0) return;
    const ok = addExpense(form.walletId || wallets[0]?.id, amount, form.description, form.category);
    if (!ok) {
      setError(t("Insufficient wallet balance", "رصيد المحفظة غير كافٍ"));
      return;
    }
    setDone(true);
    setTimeout(() => router.push(`/${locale}/transactions`), 1200);
  };

  if (done) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">{t("Expense saved!", "تم حفظ المصروف!")}</h2>
        <p className="text-sm text-text-secondary">{t("Redirecting to transactions...", "جاري التحويل إلى المعاملات...")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t("New Expense", "مصروف جديد")}</h1>
        <p className="text-sm text-text-secondary">{t("Deducted instantly from the selected wallet", "يُخصم فوراً من المحفظة المختارة")}</p>
      </div>

      <form onSubmit={submit} className="glass-card space-y-5 p-6">
        <div className="flex items-center justify-center gap-2 rounded-xl bg-danger/10 p-4 text-danger">
          <ArrowUpRight className="h-5 w-5" />
          <span className="text-sm font-semibold">{t("Expense", "مصروف")}</span>
        </div>

        {error && <div className="rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</div>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Amount", "المبلغ")}</label>
          <input
            type="number" min="0.01" step="0.01" required
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="0.00"
            className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-3 text-center text-2xl font-bold text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none"
          />
          {form.amount && (
            <p className="mt-2 text-center text-xs text-text-secondary">
              {t(`Will deduct ${formatCurrency(Math.abs(parseFloat(form.amount) || 0))}`, `سيخصم ${formatCurrency(Math.abs(parseFloat(form.amount) || 0))}`)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Description", "الوصف")}</label>
          <input
            required
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder={t("e.g. Weekly groceries", "مثال: بقالة الأسبوع")}
            className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Category", "الفئة")}</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none"
            >
              {categories.map((c, i) => (
                <option key={c} value={c}>{locale === "ar" ? categoriesAr[i] : c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Wallet", "المحفظة")}</label>
            <select
              value={form.walletId || wallets[0]?.id || ""}
              onChange={(e) => setForm((p) => ({ ...p, walletId: e.target.value }))}
              className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="w-full rounded-xl bg-danger py-3 font-semibold text-white transition-colors hover:brightness-110">
          {t("Deduct & Save Expense", "خصم وحفظ المصروف")}
        </button>
      </form>
    </div>
  );
}
