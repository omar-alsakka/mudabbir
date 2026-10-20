"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Globe,
  Zap,
  Home,
  Tv,
  Wallet as WalletIcon,
  Landmark,
  Coins,
  UtensilsCrossed,
  Car,
  Receipt,
  Gamepad2,
  HeartPulse,
  ShoppingBag,
  CalendarClock,
  ArrowLeftRight,
  Target,
  Minus,
} from "lucide-react";
import {
  pick,
  formatCurrency,
  formatDate,
  progressColor,
} from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFinanceStore } from "@/stores/financeStore";

const envelopeIcons: Record<string, typeof UtensilsCrossed> = {
  UtensilsCrossed, Car, Receipt, Gamepad2, HeartPulse, ShoppingBag,
};

function StatCard({
  title, amount, trend, trendLabel, icon: Icon, tone,
}: {
  title: string; amount: string; trend: string; trendLabel: string;
  icon: typeof WalletIcon; tone: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-text-primary">{amount}</p>
        </div>
        <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
          tone === "positive" ? "bg-success/15 text-success"
          : tone === "negative" ? "bg-danger/15 text-danger"
          : "bg-bg-secondary text-text-secondary"
        }`}>
          {tone === "positive" ? <TrendingUp className="h-3 w-3" />
            : tone === "negative" ? <TrendingDown className="h-3 w-3" />
            : <Minus className="h-3 w-3" />}
          {trend}
        </span>
        <span className="text-xs text-text-secondary">{trendLabel}</span>
      </div>
    </div>
  );
}

const billIconFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("internet")) return Globe;
  if (n.includes("electric")) return Zap;
  if (n.includes("rent") || n.includes("إيجار")) return Home;
  return Tv;
};

export function DashboardPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);

  const wallets = useFinanceStore((s) => s.wallets);
  const transactions = useFinanceStore((s) => s.transactions);
  const bills = useFinanceStore((s) => s.bills);
  const envelopes = useFinanceStore((s) => s.envelopes);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const income = transactions.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.type === "expense").reduce((s, tx) => s - tx.amount, 0);
  const netSavings = income - expenses;

  const recent = transactions.slice(0, 6);
  const sortedBills = [...bills].sort((a, b) => a.renewalInDays - b.renewalInDays).slice(0, 4);

  // Envelope spending is computed live from real transactions by category
  const spentFor = (category: string) =>
    transactions
      .filter((tx) => tx.type === "expense" && tx.category === category)
      .reduce((s, tx) => s + Math.abs(tx.amount), 0);

  const overviewEnvelopes = envelopes.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Dashboard", "لوحة التحكم")}</h1>
          <p className="text-sm text-text-secondary">{t("Welcome back, here's your financial overview", "أهلاً بعودتك، هذه نظرة على وضعك المالي")}</p>
        </div>
      </div>

      {/* Stats Bar — live from unified store */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("Total Balance", "الرصيد الإجمالي")} amount={formatCurrency(totalBalance)}
          trend={`${wallets.length} ${t("accounts", "حسابات")}`} trendLabel={t("live", "مباشر")} icon={WalletIcon}
          tone={totalBalance > 0 ? "positive" : "neutral"} />
        <StatCard title={t("Income", "الدخل")} amount={formatCurrency(income)}
          trend={income > 0 ? `${transactions.filter((x) => x.type === "income").length} ${t("entries", "حركات")}` : t("No data yet", "لا بيانات بعد")}
          trendLabel={t("all time", "كل الفترات")} icon={ArrowDownLeft}
          tone={income > 0 ? "positive" : "neutral"} />
        <StatCard title={t("Expenses", "المصروفات")} amount={formatCurrency(expenses)}
          trend={expenses > 0 ? `${transactions.filter((x) => x.type === "expense").length} ${t("entries", "حركات")}` : t("No data yet", "لا بيانات بعد")}
          trendLabel={t("all time", "كل الفترات")} icon={ArrowUpRight}
          tone={expenses > 0 ? "negative" : "neutral"} />
        <StatCard title={t("Net Savings", "صافي التوفير")} amount={formatCurrency(netSavings)}
          trend={netSavings > 0 ? t("positive", "إيجابي") : netSavings < 0 ? t("negative", "سلبي") : t("Even", "متوازن")}
          trendLabel={t("keep it up!", "استمر!")} icon={TrendingUp}
          tone={netSavings > 0 ? "positive" : netSavings < 0 ? "negative" : "neutral"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">{t("Recent Transactions", "المعاملات الأخيرة")}</h2>
            {transactions.length > 0 && (
              <a href={`/${locale}/transactions`} className="text-sm font-medium text-accent hover:underline">
                {t("View all", "عرض الكل")}
              </a>
            )}
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title={t("No transactions yet", "لا توجد معاملات بعد")}
              description={t("Deposit income from your wallets or add your first expense to get started.", "أودع دخلاً من محافظك أو أضف أول مصروف للبدء.")}
              actionLabel={t("Add Expense", "إضافة مصروف")}
              href={`/${locale}/transactions`}
              secondaryActionLabel={t("Deposit Income", "إيداع دخل")}
              secondaryHref={`/${locale}/wallets`}
            />
          ) : (
            <div className="space-y-1">
              {recent.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-bg-secondary">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tx.type === "income" ? "bg-success/15 text-success" : tx.type === "transfer" ? "bg-accent/15 text-accent" : "bg-danger/15 text-danger"}`}>
                    {tx.type === "income" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{tx.description}</p>
                    <p className="text-xs text-text-secondary">
                      {tx.category} · {formatDate(tx.dateISO)} · {tx.walletName}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className={`text-sm font-bold ${tx.amount > 0 ? "text-success" : "text-text-primary"}`}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${tx.status === "completed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                      {tx.status === "completed" ? t("Completed", "مكتملة") : t("Pending", "معلقة")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bills */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-text-primary">{t("Upcoming Bills", "الفواتير القادمة")}</h2>
          </div>
          {sortedBills.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title={t("No active bills", "لا توجد فواتير نشطة")}
              description={t("Add your recurring bills like Internet, Electricity or Rent.", "أضف فواتيرك المتكررة كالإنترنت والكهرباء والإيجار.")}
              actionLabel={t("Add Bill", "إضافة فاتورة")}
              href={`/${locale}/subscriptions`}
            />
          ) : (
            <div className="space-y-3">
              {sortedBills.map((bill) => {
                const Icon = billIconFor(bill.name);
                const urgent = bill.renewalInDays <= 3;
                return (
                  <div key={bill.id} className="flex items-center gap-3 rounded-xl border border-border-color bg-bg-secondary/50 p-3">
                    <div className={`rounded-lg p-2 ${urgent ? "bg-danger/15 text-danger" : "bg-accent/10 text-accent"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{bill.name}</p>
                      <p className="text-xs text-text-secondary">
                        {bill.pricing === "fixed"
                          ? formatCurrency(bill.amount ?? 0)
                          : t("Variable price", "سعر متغير")}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${urgent ? "bg-danger/15 text-danger" : bill.renewalInDays <= 7 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                      {bill.renewalInDays}d
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budgets & Envelopes Overview */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">{t("Budgets & Envelopes", "الميزانيات والمغلفات")}</h2>
            <a href={`/${locale}/budgets`} className="text-sm font-medium text-accent hover:underline">
              {t("Manage", "إدارة")}
            </a>
          </div>
          {overviewEnvelopes.length === 0 ? (
            <EmptyState
              icon={Target}
              title={t("No envelopes yet", "لا توجد مغلفات بعد")}
              description={t("Create budget envelopes with spending caps to track categories.", "أنشئ مغلفات ميزانية بحدود إنفاق لتتبع الفئات.")}
              actionLabel={t("Create Envelope", "إنشاء مغلف")}
              href={`/${locale}/budgets`}
            />
          ) : (
            <div className="space-y-4">
              {overviewEnvelopes.map((env) => {
                const spent = spentFor(env.category);
                const pct = env.allocated > 0 ? Math.round((spent / env.allocated) * 100) : 0;
                const c = progressColor(pct);
                const Icon = envelopeIcons[env.icon] ?? Receipt;
                return (
                  <div key={env.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-text-primary">
                        <Icon className="h-4 w-4 text-text-secondary" />
                        {env.name}
                      </span>
                      <span className="text-text-secondary">
                        <span className={`font-semibold ${c.text}`}>{formatCurrency(spent)}</span>
                        {" / "}{formatCurrency(env.allocated)}
                        <span className={`ms-2 rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-semibold ${c.text}`}>{pct}%</span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-bg-secondary">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Wallets Quick Overview */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">{t("Wallets", "المحافظ")}</h2>
            <a href={`/${locale}/wallets`} className="text-sm font-medium text-accent hover:underline">
              {t("View all", "عرض الكل")}
            </a>
          </div>
          <div className="space-y-2.5">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center gap-3 rounded-xl border border-border-color bg-bg-secondary/50 p-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: `${w.color}22`, color: w.color }}>
                  {w.type === "CASH" ? <Coins className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{w.name}</p>
                  <p className="text-xs text-text-secondary">
                    {w.type === "CASH" ? t("Cash", "نقد") : t("Bank Account", "حساب بنكي")}
                  </p>
                </div>
                <span className="text-sm font-bold text-text-primary">{formatCurrency(w.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
