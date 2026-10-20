"use client";

import { useState } from "react";
import { Plus, X, CalendarDays, Trophy, Trash2, Target } from "lucide-react";
import { pick, formatCurrency } from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFinanceStore } from "@/stores/financeStore";

function CircularProgress({ pct, color, size = 110 }: { pct: number; color: string; size?: number }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="10" className="stroke-bg-secondary" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="10"
          stroke={color} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(pct, 100) / 100)}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-text-primary">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

export function SavingsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const goals = useFinanceStore((s) => s.goals);
  const wallets = useFinanceStore((s) => s.wallets);
  const addGoal = useFinanceStore((s) => s.addGoal);
  const depositToGoal = useFinanceStore((s) => s.depositToGoal);
  const deleteGoal = useFinanceStore((s) => s.deleteGoal);

  const [depositFor, setDepositFor] = useState<string | null>(null);
  const [depositForm, setDepositForm] = useState({ walletId: "", amount: "" });
  const [error, setError] = useState("");
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: "", target: "", emoji: "🎯", color: "#8B5CF6", deadline: "" });
  const [celebrate, setCelebrate] = useState<string | null>(null);

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  const submitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalForm.target);
    if (!goalForm.name || !target || target <= 0) return;
    addGoal(goalForm.name, target, goalForm.emoji, goalForm.color, goalForm.deadline || undefined);
    setGoalOpen(false);
    setGoalForm({ name: "", target: "", emoji: "🎯", color: "#8B5CF6", deadline: "" });
  };

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositForm.amount);
    const walletId = depositForm.walletId || wallets[0]?.id;
    if (!depositFor || !walletId || !amount || amount <= 0) return;
    const goal = goals.find((g) => g.id === depositFor);
    const ok = depositToGoal(depositFor, walletId, amount);
    if (!ok) {
      setError(t("Insufficient wallet balance", "رصيد المحفظة غير كافٍ"));
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (goal && goal.saved + amount >= goal.target) {
      setCelebrate(goal.id);
      setTimeout(() => setCelebrate(null), 3000);
    }
    setDepositFor(null);
    setDepositForm({ walletId: "", amount: "" });
  };

  return (
    <div className="space-y-6">
      {celebrate && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-success px-6 py-3 text-sm font-semibold text-white shadow-xl">
          🎉 {t("Goal completed! Amazing job!", "تم إنجاز الهدف! عمل رائع!")}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Savings Goals", "أهداف التوفير")}</h1>
          <p className="text-sm text-text-secondary">
            {t("Saved", "وفّرت")} <span className="font-bold text-success">{formatCurrency(totalSaved)}</span>
            {" "}{t("of", "من")} {formatCurrency(totalTarget)}
          </p>
        </div>
        <button onClick={() => setGoalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
          <Plus className="h-4 w-4" />
          {t("New Savings Goal", "هدف توفير جديد")}
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={t("No savings goals yet", "لا توجد أهداف توفير بعد")}
          description={t("Create a custom goal with a name and target amount, then deposit from any wallet.", "أنشئ هدفاً مخصصاً باسم ومبلغ مستهدف، ثم أودع من أي محفظة.")}
          actionLabel={t("New Savings Goal", "هدف توفير جديد")}
          onAction={() => setGoalOpen(true)}
        />
      ) : (
      <div className="grid gap-4 lg:grid-cols-3">
        {goals.map((goal) => {
          const pct = (goal.saved / goal.target) * 100;
          const done = goal.saved >= goal.target;
          return (
            <div key={goal.id} className="glass-card relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -top-10 -end-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
                style={{ backgroundColor: goal.color }} />
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">{goal.emoji}</span>
                  <h3 className="mt-2 font-semibold text-text-primary">{goal.name}</h3>
                  {goal.deadline && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                      <CalendarDays className="h-3.5 w-3.5" /> {goal.deadline}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {done && (
                    <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                      <Trophy className="h-3.5 w-3.5" /> {t("Reached!", "تحقق!")}
                    </span>
                  )}
                  <button onClick={() => deleteGoal(goal.id)}
                    className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <CircularProgress pct={pct} color={goal.color} />
                <div className="flex-1">
                  <p className="text-xs text-text-secondary">{t("Saved", "الموفّر")}</p>
                  <p className="text-xl font-bold text-text-primary">{formatCurrency(goal.saved)}</p>
                  <p className="mt-1 text-xs text-text-secondary">{t("Target", "الهدف")}: {formatCurrency(goal.target)}</p>
                  {!done && (
                    <button onClick={() => { setDepositFor(goal.id); setDepositForm({ walletId: wallets[0]?.id ?? "", amount: "" }); setError(""); }}
                      className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover">
                      <Plus className="h-3.5 w-3.5" />
                      {t("Deposit from Wallet", "إيداع من محفظة")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* New goal modal */}
      {goalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setGoalOpen(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("New Savings Goal", "هدف توفير جديد")}</h3>
              <button onClick={() => setGoalOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitGoal} className="space-y-4">
              <div className="grid grid-cols-[1fr_4rem] gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Goal Name", "اسم الهدف")}</label>
                  <input required value={goalForm.name} onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={t("e.g. New Laptop", "مثال: لابتوب جديد")}
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Icon", "رمز")}</label>
                  <input value={goalForm.emoji} onChange={(e) => setGoalForm((p) => ({ ...p, emoji: e.target.value }))} maxLength={2}
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-center text-lg text-text-primary focus:border-accent focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Target Amount", "المبلغ المستهدف")}</label>
                  <input type="number" min="0.01" step="0.01" required value={goalForm.target}
                    onChange={(e) => setGoalForm((p) => ({ ...p, target: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Deadline (optional)", "الموعد (اختياري)")}</label>
                  <input value={goalForm.deadline} onChange={(e) => setGoalForm((p) => ({ ...p, deadline: e.target.value }))}
                    placeholder={t("e.g. Jun 2027", "مثال: حزيران ٢٠٢٧")}
                    className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Color", "اللون")}</label>
                <div className="flex gap-2">
                  {["#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#EC4899"].map((c) => (
                    <button key={c} type="button" onClick={() => setGoalForm((p) => ({ ...p, color: c }))}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${goalForm.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-bg-primary" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Create Goal", "إنشاء الهدف")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit-from-wallet modal */}
      {depositFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDepositFor(null)}>
          <div className="glass-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{t("Deposit from Wallet", "إيداع من محفظة")}</h3>
              <button onClick={() => setDepositFor(null)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</div>}
            <form onSubmit={submitDeposit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("From Wallet", "من المحفظة")}</label>
                <select value={depositForm.walletId} onChange={(e) => setDepositForm((p) => ({ ...p, walletId: e.target.value }))}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none">
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-text-secondary">
                  {t("Wallet balance will decrease accordingly", "سيُخفض رصيد المحفظة تلقائياً")}
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("Amount", "المبلغ")}</label>
                <input type="number" min="0.01" step="0.01" required
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none" />
              </div>
              <div className="flex gap-2">
                {[25, 50, 100, 250].map((v) => (
                  <button key={v} type="button" onClick={() => setDepositForm((p) => ({ ...p, amount: String(v) }))}
                    className="flex-1 rounded-lg border border-border-color bg-bg-secondary py-2 text-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                    ${v}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover">
                {t("Confirm Deposit", "تأكيد الإيداع")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
