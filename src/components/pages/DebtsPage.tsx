"use client";

import { useState } from "react";
import { HandCoins, ArrowDownLeft, ArrowUpRight, Users, Calculator, Check, Plus, X, Trash2 } from "lucide-react";
import { pick, formatCurrency, formatDate } from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFinanceStore } from "@/stores/financeStore";
import type { FinanceDebt } from "@/stores/financeStore";

export function DebtsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const debts = useFinanceStore((s) => s.debts);
  const payments = useFinanceStore((s) => s.payments);
  const wallets = useFinanceStore((s) => s.wallets);
  const addDebt = useFinanceStore((s) => s.addDebt);
  const repayDebt = useFinanceStore((s) => s.repayDebt);
  const deleteDebt = useFinanceStore((s) => s.deleteDebt);

  const [tab, setTab] = useState<"owedToMe" | "iOwe">("owedToMe");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ person: "", amount: "", direction: "owedToMe", dueDate: "", notes: "" });
  const [repayFor, setRepayFor] = useState<FinanceDebt | null>(null);
  const [repayForm, setRepayForm] = useState({ amount: "", walletId: "" });
  const [error, setError] = useState("");

  // Split bill calculator
  const [billTotal, setBillTotal] = useState("");
  const [people, setPeople] = useState("4");
  const perPerson = (() => {
    const total = parseFloat(billTotal);
    const n = parseInt(people);
    if (!total || !n || n <= 0) return null;
    return total / n;
  })();

  const list = debts.filter((d) => d.direction === tab);
  const owedToMe = debts.filter((d) => d.direction === "owedToMe" && !d.settled).reduce((s, d) => s + d.remaining, 0);
  const owedByMe = debts.filter((d) => d.direction === "iOwe" && !d.settled).reduce((s, d) => s + d.remaining, 0);

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.person || !amount || amount <= 0) return;
    addDebt(form.person, amount, form.direction as "iOwe" | "owedToMe", form.dueDate || undefined, form.notes || undefined);
    setAddOpen(false);
    setForm({ person: "", amount: "", direction: "owedToMe", dueDate: "", notes: "" });
  };

  const openRepay = (debt: FinanceDebt) => {
    setRepayFor(debt);
    setRepayForm({ amount: "", walletId: wallets[0]?.id ?? "" });
    setError("");
  };

  const submitRepay = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(repayForm.amount);
    if (!repayFor || !amount || amount <= 0) return;
    const ok = repayDebt(repayFor.id, repayForm.walletId, amount);
    if (!ok) {
      setError(t("Insufficient wallet balance", "رصيد المحفظة غير كافٍ"));
      return;
    }
    setRepayFor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Debts & Loans", "الديون والالتزامات")}</h1>
          <p className="text-sm text-text-secondary">{t("Repayments sync with your wallet balance", "السداد يتزامن مع رصيد محفظتك")}</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
          <Plus className="h-4 w-4" />
          {t("Add Debt / Loan", "إضافة دين")}
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-success/15 p-3 text-success"><ArrowDownLeft className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-text-secondary">{t("Owed to me", "لي دين - مدينون لي")}</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(owedToMe)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-danger/15 p-3 text-danger"><ArrowUpRight className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-text-secondary">{t("I owe", "عليّ دين - مديون لـ")}</p>
              <p className="text-2xl font-bold text-danger">{formatCurrency(owedByMe)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card overflow-hidden">
        <div className="flex border-b border-border-color">
          <button onClick={() => setTab("owedToMe")}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${tab === "owedToMe" ? "border-b-2 border-accent bg-accent/5 text-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <ArrowDownLeft className="h-4 w-4" />
            {t("They owe me", "لي دين")}
          </button>
          <button onClick={() => setTab("iOwe")}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${tab === "iOwe" ? "border-b-2 border-accent bg-accent/5 text-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <ArrowUpRight className="h-4 w-4" />
            {t("I owe them", "عليّ دين")}
          </button>
        </div>

        <div className="divide-y divide-border-color/50">
          {list.map((debt) => {
            const paid = debt.total - debt.remaining;
            const pct = debt.total > 0 ? Math.round((paid / debt.total) * 100) : 100;
            return (
              <div key={debt.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {debt.person.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-text-primary">{debt.person}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${debt.settled ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                      {debt.settled ? <><Check className="h-3 w-3" /> {t("Settled", "مسدد")}</> : t("Pending", "معلّق")}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {t("Total", "الإجمالي")}: {formatCurrency(debt.total)}
                    {debt.dueDate && <> · {t("Due", "الاستحقاق")}: {debt.dueDate}</>}
                    {debt.notes && <> · {debt.notes}</>}
                  </p>
                  <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-bg-secondary">
                    <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-end font-bold ${debt.settled ? "text-success" : "text-text-primary"}`}>
                    {formatCurrency(debt.remaining)}
                  </p>
                  {!debt.settled && (
                    <button onClick={() => openRepay(debt)}
                      className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover">
                      {t("Repay", "سداد")}
                    </button>
                  )}
                  <button onClick={() => deleteDebt(debt.id)}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="p-4">
              <EmptyState
                icon={tab === "owedToMe" ? ArrowDownLeft : ArrowUpRight}
                title={tab === "owedToMe"
                  ? t("No one owes you yet", "لا يوجد أحد مدين لك بعد")
                  : t("You don't owe anyone", "لا توجد ديون عليك بعد")}
                description={t("Track money lent or borrowed — repayments sync with your wallet balance.", "تابع النقود المُقرضة أو المقترضة — السداد يتزامن مع رصيد محفظتك.")}
                actionLabel={t("Add Debt / Loan", "إضافة دين")}
                onAction={() => setAddOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settlement log */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-text-primary">{t("Settlement Log", "سجل التسويات")}</h2>
          </div>
          {payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-secondary">
              {t("Repayments will appear here", "ستظهر السدادات هنا")}
            </p>
          ) : (
          <div className="space-y-2">
            {payments.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border-color bg-bg-secondary/50 p-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.person}</p>
                  <p className="text-xs text-text-secondary">
                    {formatDate(p.dateISO)} · {p.direction === "iOwe" ? t("I paid", "دفعتُ أنا") : t("I received", "استلمتُ أنا")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${p.direction === "iOwe" ? "bg-danger/15 text-danger" : "bg-success/15 text-success"}`}>
                  {p.direction === "iOwe" ? "-" : "+"}{formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Split bill calculator */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-text-primary">{t("Split Bill Calculator", "حاسبة تقسيم الفاتورة")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Bill Total", "إجمالي الفاتورة")}</label>
              <input type="number" min="0" step="0.01" value={billTotal}
                onChange={(e) => setBillTotal(e.target.value)} placeholder="0.00"
                className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("People", "عدد الأشخاص")}</label>
              <input type="number" min="1" step="1" value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
              <Users className="h-4 w-4" />
              {t("Each person pays", "كل شخص يدفع")}
            </div>
            <p className="mt-1 text-3xl font-bold text-accent">
              {perPerson !== null ? formatCurrency(perPerson) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Add debt modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setAddOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Add Debt / Loan", "إضافة دين / التزام")}</h3>
              <button onClick={() => setAddOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Person Name", "اسم الشخص")}</label>
                  <input required value={form.person} onChange={(e) => setForm((p) => ({ ...p, person: e.target.value }))}
                    placeholder={t("e.g. Ahmad", "مثال: أحمد")}
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Amount", "المبلغ")}</label>
                  <input type="number" min="0.01" step="0.01" required value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
              </div>

              {/* Direction */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Type", "النوع")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm((p) => ({ ...p, direction: "iOwe" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${form.direction === "iOwe" ? "border-danger bg-danger/10 text-danger" : "border-border-color bg-bg-secondary text-text-secondary"}`}>
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("I owe them", "عليّ دين")}</span>
                    <span className="text-[11px] opacity-75">{t("I'm the borrower", "أنا المدين")}</span>
                  </button>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, direction: "owedToMe" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${form.direction === "owedToMe" ? "border-success bg-success/10 text-success" : "border-border-color bg-bg-secondary text-text-secondary"}`}>
                    <ArrowDownLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("They owe me", "لي دين")}</span>
                    <span className="text-[11px] opacity-75">{t("I'm the lender", "أنا الدائن")}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Due Date", "تاريخ السداد")}</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Notes", "ملاحظات")}</label>
                <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2} placeholder={t("Optional notes...", "ملاحظات اختيارية...")}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Add Debt", "إضافة الدين")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Repay modal — partial or full, syncs wallet */}
      {repayFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setRepayFor(null)}>
          <div className="glass-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Repay Debt", "سداد الدين")}</h3>
              <button onClick={() => setRepayFor(null)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</div>}
            <form onSubmit={submitRepay} className="space-y-4">
              <p className="rounded-lg bg-accent/10 p-2.5 text-center text-sm text-accent">
                {repayFor.person} — {t("remaining", "المتبقي")}: {formatCurrency(repayFor.remaining)}
              </p>
              <p className="text-center text-xs text-text-secondary">
                {repayFor.direction === "iOwe"
                  ? t("Paying will deduct from your wallet", "السداد سيخصم من محفظتك")
                  : t("Receiving will add to your wallet", "الاستلام سيضيف إلى محفظتك")}
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Wallet", "المحفظة")}</label>
                <select value={repayForm.walletId} onChange={(e) => setRepayForm((p) => ({ ...p, walletId: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Amount", "المبلغ")}</label>
                <input type="number" min="0.01" step="0.01" required
                  value={repayForm.amount}
                  onChange={(e) => setRepayForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                <button type="button"
                  onClick={() => setRepayForm((p) => ({ ...p, amount: String(repayFor.remaining) }))}
                  className="mt-2 w-full rounded-lg border border-success/40 bg-success/10 py-2 text-xs font-semibold text-success transition-colors hover:bg-success/20">
                  {t("Full repayment", "سداد كامل")} ({formatCurrency(repayFor.remaining)})
                </button>
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Confirm Repayment", "تأكيد السداد")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
