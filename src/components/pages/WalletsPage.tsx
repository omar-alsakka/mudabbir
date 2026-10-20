"use client";

import { useState } from "react";
import { Coins, Landmark, Repeat, X, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { pick, formatCurrency, formatDate } from "@/lib/mockData";
import { useFinanceStore } from "@/stores/financeStore";

export function WalletsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const wallets = useFinanceStore((s) => s.wallets);
  const transactions = useFinanceStore((s) => s.transactions);
  const depositToWallet = useFinanceStore((s) => s.depositToWallet);
  const transferBetweenWallets = useFinanceStore((s) => s.transferBetweenWallets);
  const addWallet = useFinanceStore((s) => s.addWallet);

  const [selected, setSelected] = useState<string | null>(null);
  const [depositFor, setDepositFor] = useState<string | null>(null);
  const [depositForm, setDepositForm] = useState({ amount: "", description: "" });
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "", to: "", amount: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", type: "CASH", balance: "", color: "#3B82F6" });
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const total = wallets.reduce((s, w) => s + w.balance, 0);
  const selectedWallet = wallets.find((w) => w.id === selected);
  const walletTxs = transactions.filter((tx) => tx.walletId === selected).slice(0, 6);

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositForm.amount);
    if (!depositFor || !amount || amount <= 0) return;
    if (depositToWallet(depositFor, amount, depositForm.description)) {
      setDepositFor(null);
      setDepositForm({ amount: "", description: "" });
      showToast(t("Deposit added — income logged", "تم الإيداع — سُجّل دخل"));
    }
  };

  const submitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferForm.amount);
    if (!amount) return;
    if (transferBetweenWallets(transferForm.from, transferForm.to, amount)) {
      setTransferOpen(false);
      setTransferForm({ from: "", to: "", amount: "" });
      showToast(t("Transfer completed", "تم التحويل"));
    } else {
      setError(t("Insufficient balance", "الرصيد غير كافٍ"));
      setTimeout(() => setError(""), 2500);
    }
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addWallet(createForm.name, createForm.type as "CASH" | "BANK", parseFloat(createForm.balance) || 0, createForm.color);
    setCreateOpen(false);
    setCreateForm({ name: "", type: "CASH", balance: "", color: "#3B82F6" });
    showToast(t("Wallet created", "تم إنشاء المحفظة"));
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-success px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Wallets", "المحافظ")}</h1>
          <p className="text-sm text-text-secondary">
            {t("Total across all accounts", "الإجمالي عبر كل الحسابات")}: <span className="font-bold text-text-primary">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setTransferForm((f) => ({ ...f, from: wallets[0]?.id ?? "", to: wallets[1]?.id ?? "" })); setTransferOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
            <Repeat className="h-4 w-4" />
            {t("Transfer", "تحويل")}
          </button>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border-color bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent">
            <Plus className="h-4 w-4" />
            {t("Add Wallet", "إضافة محفظة")}
          </button>
        </div>
      </div>

      {/* Account cards — Cash & Bank only */}
      <div className="grid gap-4 sm:grid-cols-2">
        {wallets.map((w) => (
          <div key={w.id} className={`glass-card p-5 transition-all ${selected === w.id ? "ring-2 ring-accent" : ""}`}>
            <button onClick={() => setSelected(w.id)} className="w-full text-start">
              <div className="flex items-center justify-between">
                <div className="rounded-xl p-2.5" style={{ backgroundColor: `${w.color}22`, color: w.color }}>
                  {w.type === "CASH" ? <Coins className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
                </div>
                <span className="rounded-full bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {w.type === "CASH" ? t("Cash", "نقد") : t("Bank Account", "حساب بنكي")}
                </span>
              </div>
              <p className="mt-3 text-sm text-text-secondary">{w.name}</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{formatCurrency(w.balance)}</p>
            </button>
            <button
              onClick={() => setDepositFor(w.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-success/15 py-2.5 text-sm font-semibold text-success transition-colors hover:bg-success/25"
            >
              <ArrowDownLeft className="h-4 w-4" />
              {t("Add Funds / Deposit", "إيداع / إضافة أموال")}
            </button>
          </div>
        ))}
      </div>

      {/* Activity breakdown */}
      <div className="glass-card p-5">
        <h2 className="mb-4 font-semibold text-text-primary">
          {selectedWallet
            ? `${t("Activity", "النشاط")} — ${selectedWallet.name}`
            : t("Select a wallet to view its activity", "اختر محفظة لعرض نشاطها")}
        </h2>
        {!selectedWallet || walletTxs.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">{t("No activity yet", "لا يوجد نشاط بعد")}</p>
        ) : (
          <div className="space-y-1">
            {walletTxs.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-bg-secondary">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tx.amount > 0 ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                  {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{tx.description}</p>
                  <p className="text-xs text-text-secondary">{formatDate(tx.dateISO)}</p>
                </div>
                <p className={`text-sm font-bold ${tx.amount > 0 ? "text-success" : "text-text-primary"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit modal — income entry point */}
      {depositFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDepositFor(null)}>
          <div className="glass-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Add Funds", "إيداع أموال")}</h3>
              <button onClick={() => setDepositFor(null)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitDeposit} className="space-y-4">
              <p className="rounded-lg bg-accent/10 p-2.5 text-center text-sm text-accent">
                {t("To", "إلى")}: {wallets.find((w) => w.id === depositFor)?.name}
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Amount", "المبلغ")}</label>
                <input type="number" min="0.01" step="0.01" required
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-center text-xl font-bold text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Description", "الوصف")}</label>
                <input value={depositForm.description}
                  onChange={(e) => setDepositForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder={t("e.g. Salary, freelance...", "مثال: راتب، عمل حر...")}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-success py-2.5 font-medium text-white transition-colors hover:brightness-110">
                {t("Deposit & Log Income", "إيداع وتسجيل دخل")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer modal */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setTransferOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Transfer Between Wallets", "تحويل بين المحافظ")}</h3>
              <button onClick={() => setTransferOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</div>}
            <form onSubmit={submitTransfer} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("From", "من")}</label>
                <select value={transferForm.from} onChange={(e) => setTransferForm((p) => ({ ...p, from: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {wallets.map((w) => <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("To", "إلى")}</label>
                <select value={transferForm.to} onChange={(e) => setTransferForm((p) => ({ ...p, to: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
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
                {t("Confirm Transfer", "تأكيد التحويل")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create wallet modal — Cash / Bank only */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setCreateOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Add New Wallet", "إضافة محفظة جديدة")}</h3>
              <button onClick={() => setCreateOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Name", "الاسم")}</label>
                <input required value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t("e.g. Main Bank Account", "مثال: الحساب البنكي الأساسي")}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Type", "النوع")}</label>
                  <select value={createForm.type} onChange={(e) => setCreateForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                    <option value="CASH">{t("Cash", "نقد")}</option>
                    <option value="BANK">{t("Bank Account", "حساب بنكي")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Initial Balance", "الرصيد الأولي")}</label>
                  <input type="number" min="0" step="0.01" value={createForm.balance}
                    onChange={(e) => setCreateForm((p) => ({ ...p, balance: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Color", "اللون")}</label>
                <div className="flex gap-2">
                  {["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"].map((c) => (
                    <button key={c} type="button" onClick={() => setCreateForm((p) => ({ ...p, color: c }))}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${createForm.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-bg-primary" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Create Wallet", "إنشاء المحفظة")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
