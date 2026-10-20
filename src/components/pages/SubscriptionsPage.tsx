"use client";

import { useState } from "react";
import { CreditCard, CalendarClock, AlertTriangle, Plus, X, Trash2, Lock, Variable } from "lucide-react";
import { pick, formatCurrency } from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFinanceStore } from "@/stores/financeStore";
import type { FinanceBill } from "@/stores/financeStore";

export function SubscriptionsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const bills = useFinanceStore((s) => s.bills);
  const wallets = useFinanceStore((s) => s.wallets);
  const addBill = useFinanceStore((s) => s.addBill);
  const payBill = useFinanceStore((s) => s.payBill);
  const deleteBill = useFinanceStore((s) => s.deleteBill);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", pricing: "fixed", amount: "", color: "#3B82F6" });
  const [payFor, setPayFor] = useState<FinanceBill | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payWallet, setPayWallet] = useState("");
  const [error, setError] = useState("");

  const fixedTotal = bills.filter((b) => b.pricing === "fixed").reduce((s, b) => s + (b.amount ?? 0), 0);
  const sorted = [...bills].sort((a, b) => a.renewalInDays - b.renewalInDays);
  const urgentSoon = sorted.filter((b) => b.renewalInDays <= 3).length;
  const primaryWallet = wallets[0];

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.name) return;
    if (form.pricing === "fixed" && (!amount || amount <= 0)) return;
    addBill(form.name, form.pricing as "fixed" | "variable", form.pricing === "fixed" ? amount : undefined, form.color);
    setAddOpen(false);
    setForm({ name: "", pricing: "fixed", amount: "", color: "#3B82F6" });
  };

  const openPay = (bill: FinanceBill) => {
    setPayFor(bill);
    setPayAmount(bill.pricing === "fixed" ? String(bill.amount ?? "") : "");
    setPayWallet(primaryWallet?.id ?? "");
    setError("");
  };

  const submitPay = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (!payFor || !amount || amount <= 0) return;
    const ok = payBill(payFor.id, payWallet, amount);
    if (!ok) {
      setError(t("Insufficient wallet balance", "رصيد المحفظة غير كافٍ"));
      return;
    }
    setPayFor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Bills & Subscriptions", "الفواتير والاشتراكات")}</h1>
          <p className="text-sm text-text-secondary">{t("Custom bills with fixed or variable pricing", "فواتير مخصصة بسعر ثابت أو متغير")}</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
          <Plus className="h-4 w-4" />
          {t("Add Bill", "إضافة فاتورة")}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent/10 p-3 text-accent"><CreditCard className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-text-secondary">{t("Fixed Monthly Total", "إجمالي الثابت شهرياً")}</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(fixedTotal)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-warning/15 p-3 text-warning"><Variable className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-text-secondary">{t("Variable Bills", "فواتير متغيرة")}</p>
              <p className="text-2xl font-bold text-text-primary">{bills.filter((b) => b.pricing === "variable").length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 ${urgentSoon > 0 ? "bg-danger/15 text-danger" : "bg-success/15 text-success"}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">{t("Due Within 3 Days", "تستحق خلال ٣ أيام")}</p>
              <p className="text-2xl font-bold text-text-primary">{urgentSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills list */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t("No active bills", "لا توجد فواتير نشطة")}
          description={t("Add custom bills like Water, Electricity, Internet or Netflix — with fixed or variable pricing.", "أضف فواتير مخصصة كالماء والكهرباء والإنترنت أو نتفليكس — بسعر ثابت أو متغير.")}
          actionLabel={t("Add Bill", "إضافة فاتورة")}
          onAction={() => setAddOpen(true)}
        />
      ) : (
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-border-color/50">
          {sorted.map((bill) => (
            <div key={bill.id} className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-bg-secondary/50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                style={{ backgroundColor: bill.color }}>
                {bill.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">{bill.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                  {bill.pricing === "fixed" ? (
                    <>
                      <Lock className="h-3 w-3" />
                      {t("Fixed", "ثابت")}: {formatCurrency(bill.amount ?? 0)} / {t("month", "شهر")}
                    </>
                  ) : (
                    <>
                      <Variable className="h-3 w-3" />
                      {t("Variable — enter amount when due", "متغير — أدخل المبلغ عند الاستحقاق")}
                    </>
                  )}
                </p>
              </div>
              <span className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                bill.renewalInDays <= 3 ? "bg-danger/15 text-danger" : bill.renewalInDays <= 7 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
              }`}>
                <CalendarClock className="h-3 w-3" />
                {t(`in ${bill.renewalInDays} days`, `خلال ${bill.renewalInDays} أيام`)}
              </span>
              <button onClick={() => openPay(bill)}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover">
                {bill.pricing === "fixed" ? t("Auto-Pay", "دفع تلقائي") : t("Enter & Pay", "أدخل وادفع")}
              </button>
              <button onClick={() => deleteBill(bill.id)}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Add bill modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setAddOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Add Bill / Subscription", "إضافة فاتورة / اشتراك")}</h3>
              <button onClick={() => setAddOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Name", "الاسم")}</label>
                <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t("e.g. Water, Electricity, Netflix...", "مثال: ماء، كهرباء، نتفليكس...")}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>

              {/* Pricing type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Pricing Type", "نوع السعر")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm((p) => ({ ...p, pricing: "fixed" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${form.pricing === "fixed" ? "border-accent bg-accent/10 text-accent" : "border-border-color bg-bg-secondary text-text-secondary"}`}>
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("Fixed Price", "سعر ثابت")}</span>
                    <span className="text-center text-[11px] opacity-75">{t("Auto-deducts monthly", "يُخصم شهرياً تلقائياً")}</span>
                  </button>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, pricing: "variable" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${form.pricing === "variable" ? "border-accent bg-accent/10 text-accent" : "border-border-color bg-bg-secondary text-text-secondary"}`}>
                    <Variable className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("Variable Price", "سعر متغير")}</span>
                    <span className="text-center text-[11px] opacity-75">{t("Enter amount when due", "أدخل المبلغ عند الاستحقاق")}</span>
                  </button>
                </div>
              </div>

              {form.pricing === "fixed" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Monthly Amount", "المبلغ الشهري")}</label>
                  <input type="number" min="0.01" step="0.01" required value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Color", "اللون")}</label>
                <div className="flex gap-2">
                  {["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"].map((c) => (
                    <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, color: c }))}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-bg-primary" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Add Bill", "إضافة الفاتورة")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pay modal — fixed: shows amount; variable: prompts amount */}
      {payFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPayFor(null)}>
          <div className="glass-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Pay Bill", "دفع الفاتورة")}</h3>
              <button onClick={() => setPayFor(null)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</div>}
            <form onSubmit={submitPay} className="space-y-4">
              <p className="rounded-lg bg-accent/10 p-2.5 text-center text-sm font-medium text-accent">{payFor.name}</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  {payFor.pricing === "fixed"
                    ? t("Amount (fixed)", "المبلغ (ثابت)")
                    : t("Enter this month's amount", "أدخل مبلغ هذا الشهر")}
                </label>
                <input type="number" min="0.01" step="0.01" required
                  readOnly={payFor.pricing === "fixed"}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-center text-xl font-bold text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none ${payFor.pricing === "fixed" ? "opacity-80" : ""}`} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  {t("From Wallet", "من المحفظة")} {payFor.pricing === "fixed" ? `(${t("primary", "الأساسية")})` : ""}
                </label>
                <select value={payWallet} onChange={(e) => setPayWallet(e.target.value)}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Pay & Deduct from Wallet", "ادفع وخصم من المحفظة")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
