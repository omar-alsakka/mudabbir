"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Plus, X, ArrowDownLeft, ArrowUpRight, Repeat, Check } from "lucide-react";
import { pick, formatCurrency, formatDate, expenseCategories, expenseCategoriesAr } from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFinanceStore } from "@/stores/financeStore";

export function TransactionsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const transactions = useFinanceStore((s) => s.transactions);
  const wallets = useFinanceStore((s) => s.wallets);
  const addExpense = useFinanceStore((s) => s.addExpense);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Food",
    walletId: "",
  });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(transactions.map((tx) => tx.category)))],
    [transactions]
  );

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const q = search.toLowerCase();
      const matchQ = !q || tx.description.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
      const matchCat = category === "All" || tx.category === category;
      const matchType = type === "all" || tx.type === type;
      return matchQ && matchCat && matchType;
    });
  }, [transactions, search, category, type]);

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description || !amount || amount <= 0) return;
    const ok = addExpense(form.walletId || wallets[0]?.id, amount, form.description, form.category);
    if (!ok) {
      setError(t("Insufficient wallet balance", "رصيد المحفظة غير كافٍ"));
      setTimeout(() => setError(""), 3000);
      return;
    }
    setForm({ description: "", amount: "", category: "Food", walletId: "" });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Transactions", "المعاملات")}</h1>
          <p className="text-sm text-text-secondary">{t("Expenses are deducted from wallets instantly", "المصروفات تُخصم من المحافظ فوراً")}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          {t("Add Expense", "إضافة مصروف")}
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search transactions...", "ابحث في المعاملات...")}
              className="w-full rounded-lg border border-border-color bg-bg-secondary py-2.5 ps-10 pe-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-text-secondary" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none">
              {categories.map((c) => (
                <option key={c} value={c}>{c === "All" ? t("All categories", "كل الفئات") : c}</option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none">
              <option value="all">{t("All types", "كل الأنواع")}</option>
              <option value="income">{t("Income", "دخل")}</option>
              <option value="expense">{t("Expense", "مصروف")}</option>
              <option value="transfer">{t("Transfer", "تحويل")}</option>
            </select>
            <input type="date" defaultValue="2026-10-01"
              className="rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-color text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-3 text-start font-medium">{t("Description", "الوصف")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("Category", "الفئة")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("Wallet", "المحفظة")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("Date", "التاريخ")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("Status", "الحالة")}</th>
                <th className="px-4 py-3 text-end font-medium">{t("Amount", "المبلغ")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-border-color/50 transition-colors hover:bg-bg-secondary/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tx.type === "income" ? "bg-success/15 text-success" : tx.type === "transfer" ? "bg-accent/15 text-accent" : "bg-danger/15 text-danger"}`}>
                        {tx.type === "income" ? <ArrowDownLeft className="h-4 w-4" /> : tx.type === "transfer" ? <Repeat className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <span className="font-medium text-text-primary">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">{tx.category}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{tx.walletName}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(tx.dateISO)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tx.status === "completed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                      {tx.status === "completed" && <Check className="h-3 w-3" />}
                      {tx.status === "completed" ? t("Completed", "مكتملة") : t("Pending", "معلقة")}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-end font-bold ${tx.amount > 0 ? "text-success" : "text-text-primary"}`}>
                    {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && transactions.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={Plus}
              title={t("No transactions yet", "لا توجد معاملات بعد")}
              description={t("Add your first expense — it will be deducted from the selected wallet instantly. Income is added from the Wallets page.", "أضف أول مصروف — سيُخصم من المحفظة المختارة فوراً. الدخل يُضاف من صفحة المحافظ.")}
              actionLabel={t("Add Expense", "إضافة مصروف")}
              onAction={() => setModalOpen(true)}
              secondaryActionLabel={t("Deposit Income", "إيداع دخل")}
              secondaryHref={`/${locale}/wallets`}
            />
          </div>
        )}
        {filtered.length === 0 && transactions.length > 0 && (
          <p className="py-12 text-center text-sm text-text-secondary">{t("No transactions match your filters", "لا توجد معاملات مطابقة للفلاتر")}</p>
        )}
      </div>

      {/* Add expense modal — the expense entry point */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModalOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Add Expense", "إضافة مصروف")}</h3>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</div>}
            <form onSubmit={submitExpense} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Description", "الوصف")}</label>
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required placeholder={t("e.g. Grocery shopping", "مثال: تسوق البقالة")}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Amount", "المبلغ")}</label>
                  <input type="number" min="0.01" step="0.01" required value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Wallet", "المحفظة")}</label>
                  <select value={form.walletId || wallets[0]?.id || ""} onChange={(e) => setForm((p) => ({ ...p, walletId: e.target.value }))}
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Category", "الفئة")}</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {expenseCategories.map((c, i) => (
                    <option key={c} value={c}>{locale === "ar" ? expenseCategoriesAr[i] : c}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full rounded-lg bg-danger py-2.5 font-medium text-white transition-colors hover:brightness-110">
                {t("Deduct & Save Expense", "خصم وحفظ المصروف")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
