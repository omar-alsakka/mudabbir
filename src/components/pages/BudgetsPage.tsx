"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Car,
  Receipt,
  Gamepad2,
  HeartPulse,
  ShoppingBag,
  Plus,
  X,
  Trash2,
  Repeat,
  Target,
} from "lucide-react";
import {
  pick,
  formatCurrency,
  progressColor,
  expenseCategories,
  expenseCategoriesAr,
} from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFinanceStore } from "@/stores/financeStore";

const envelopeIcons: Record<string, typeof UtensilsCrossed> = {
  UtensilsCrossed, Car, Receipt, Gamepad2, HeartPulse, ShoppingBag,
};
const iconOptions = ["UtensilsCrossed", "Car", "Receipt", "Gamepad2", "HeartPulse", "ShoppingBag"];

export function BudgetsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const envelopes = useFinanceStore((s) => s.envelopes);
  const transactions = useFinanceStore((s) => s.transactions);
  const addEnvelope = useFinanceStore((s) => s.addEnvelope);
  const deleteEnvelope = useFinanceStore((s) => s.deleteEnvelope);
  const transferEnvelopeAllocation = useFinanceStore((s) => s.transferEnvelopeAllocation);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Food", allocated: "", color: "#10B981", icon: "UtensilsCrossed" });
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "", to: "", amount: "" });
  const [error, setError] = useState("");

  const spentFor = (category: string) =>
    transactions
      .filter((tx) => tx.type === "expense" && tx.category === category)
      .reduce((s, tx) => s + Math.abs(tx.amount), 0);

  const totalAllocated = envelopes.reduce((s, e) => s + e.allocated, 0);
  const totalSpent = envelopes.reduce((s, e) => s + spentFor(e.category), 0);
  const overallPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const allocated = parseFloat(form.allocated);
    if (!form.name || !allocated || allocated <= 0) return;
    addEnvelope(form.name, form.category, allocated, form.color, form.icon);
    setAddOpen(false);
    setForm({ name: "", category: "Food", allocated: "", color: "#10B981", icon: "UtensilsCrossed" });
  };

  const submitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferForm.amount);
    if (!amount) return;
    if (transferEnvelopeAllocation(transferForm.from, transferForm.to, amount)) {
      setTransferOpen(false);
      setTransferForm({ from: "", to: "", amount: "" });
      setError("");
    } else {
      setError(t("Invalid transfer or insufficient allocation", "تحويل غير صالح أو تخصيص غير كافٍ"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Budgets & Envelopes", "الميزانيات والمغلفات")}</h1>
          <p className="text-sm text-text-secondary">{t("Envelope spending is tracked from your real transactions", "إنفاق المغلفات يتتبع من معاملاتك الفعلية")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setTransferForm((f) => ({ ...f, from: envelopes[0]?.id ?? "", to: envelopes[1]?.id ?? "" })); setError(""); setTransferOpen(true); }}
            disabled={envelopes.length < 2}
            className="flex items-center gap-2 rounded-xl border border-border-color bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">
            <Repeat className="h-4 w-4" />
            {t("Move Allocation", "نقل التخصيص")}
          </button>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
            <Plus className="h-4 w-4" />
            {t("Add Envelope", "إضافة مغلف")}
          </button>
        </div>
      </div>

      {/* Overall summary */}
      {envelopes.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent/10 p-3 text-accent">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">{t("Total Allocated Budget", "إجمالي الميزانية المخصصة")}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(totalSpent)} <span className="text-base font-normal text-text-secondary">/ {formatCurrency(totalAllocated)}</span>
                </p>
              </div>
            </div>
            <div className="text-end">
              <p className="text-sm text-text-secondary">{t("Remaining", "المتبقي")}</p>
              <p className={`text-2xl font-bold ${overallPct >= 100 ? "text-danger" : "text-success"}`}>
                {formatCurrency(totalAllocated - totalSpent)}
              </p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-bg-secondary">
            <div className={`h-full rounded-full ${progressColor(overallPct).bar} transition-all`}
              style={{ width: `${Math.min(overallPct, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            {t(`${overallPct}% of budget used`, `${overallPct}% من الميزانية مستخدم`)}
          </p>
        </div>
      )}

      {/* Envelopes grid or empty state */}
      {envelopes.length === 0 ? (
        <EmptyState
          icon={Target}
          title={t("No envelopes yet", "لا توجد مغلفات بعد")}
          description={t("Create budget envelopes with spending caps — spending is tracked automatically from your expenses by category.", "أنشئ مغلفات ميزانية بحدود إنفاق — يُتابع الإنفاق تلقائياً من مصروفاتك حسب الفئة.")}
          actionLabel={t("Create First Envelope", "إنشاء أول مغلف")}
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {envelopes.map((env) => {
            const spent = spentFor(env.category);
            const pct = env.allocated > 0 ? Math.round((spent / env.allocated) * 100) : 0;
            const c = progressColor(pct);
            const Icon = envelopeIcons[env.icon] ?? Receipt;
            const over = spent > env.allocated;
            return (
              <div key={env.id} className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: `${env.color}22`, color: env.color }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{env.name}</p>
                      <p className="text-xs text-text-secondary">
                        {t("Category", "الفئة")}: {env.category} · {t("Cap", "السقف")}: {formatCurrency(env.allocated)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteEnvelope(env.id)}
                    className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-bg-secondary">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: over ? "var(--danger)" : env.color }} />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    {t("Spent", "المصروف")}: <span className={`font-semibold ${c.text}`}>{formatCurrency(spent)}</span>
                  </span>
                  <span className={over ? "font-semibold text-danger" : "text-text-secondary"}>
                    {over
                      ? t(`Over by ${formatCurrency(spent - env.allocated)}`, `تجاوز بمقدار ${formatCurrency(spent - env.allocated)}`)
                      : t(`${formatCurrency(env.allocated - spent)} left`, `متبقي ${formatCurrency(env.allocated - spent)}`)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add envelope modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setAddOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Add Envelope", "إضافة مغلف")}</h3>
              <button onClick={() => setAddOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Name", "الاسم")}</label>
                <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t("e.g. Food Budget", "مثال: ميزانية الطعام")}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Linked Category", "الفئة المرتبطة")}</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                    {expenseCategories.map((c, i) => (
                      <option key={c} value={c}>{locale === "ar" ? expenseCategoriesAr[i] : c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Spending Cap", "حد الإنفاق")}</label>
                  <input type="number" min="0.01" step="0.01" required value={form.allocated}
                    onChange={(e) => setForm((p) => ({ ...p, allocated: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Icon", "الأيقونة")}</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((ic) => {
                    const Ic = envelopeIcons[ic];
                    return (
                      <button key={ic} type="button" onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                        className={`rounded-lg border p-2.5 transition-colors ${form.icon === ic ? "border-accent bg-accent/10 text-accent" : "border-border-color bg-bg-secondary text-text-secondary"}`}>
                        <Ic className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Color", "اللون")}</label>
                <div className="flex gap-2">
                  {["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"].map((c) => (
                    <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, color: c }))}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-bg-primary" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Create Envelope", "إنشاء المغلف")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Move allocation modal */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setTransferOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Move Allocation", "نقل التخصيص بين المغلفات")}</h3>
              <button onClick={() => setTransferOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</div>}
            <form onSubmit={submitTransfer} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("From Envelope", "من المغلف")}</label>
                <select value={transferForm.from} onChange={(e) => setTransferForm((p) => ({ ...p, from: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {envelopes.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({formatCurrency(e.allocated)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("To Envelope", "إلى المغلف")}</label>
                <select value={transferForm.to} onChange={(e) => setTransferForm((p) => ({ ...p, to: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {envelopes.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Amount", "المبلغ")}</label>
                <input type="number" min="0.01" step="0.01" required placeholder="0.00"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Confirm Move", "تأكيد النقل")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
