"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, PieChart as PieIcon, CalendarDays } from "lucide-react";
import { pick, formatCurrency } from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFinanceStore } from "@/stores/financeStore";

const palette = ["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444"];

const tooltipStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-color)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontSize: "13px",
};

function heatColor(v: number): string {
  if (v <= 0) return "var(--bg-secondary)";
  if (v < 0.25) return "rgba(16,185,129,0.35)";
  if (v < 0.5) return "rgba(245,158,11,0.55)";
  if (v < 0.75) return "rgba(239,68,68,0.65)";
  return "rgba(239,68,68,0.9)";
}

export function ReportsPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const transactions = useFinanceStore((s) => s.transactions);

  const hasData = transactions.length > 0;

  const monthly = useMemo(() => {
    const map = new Map<string, { key: string; label: string; income: number; expenses: number }>();
    transactions.forEach((tx) => {
      const d = new Date(tx.dateISO);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
      const entry = map.get(key) ?? { key, label, income: 0, expenses: 0 };
      if (tx.type === "income") entry.income += tx.amount;
      if (tx.type === "expense") entry.expenses += Math.abs(tx.amount);
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-6);
  }, [transactions]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => map.set(tx.category, (map.get(tx.category) ?? 0) + Math.abs(tx.amount)));
    return [...map.entries()]
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalIncome = transactions.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const totalExpenses = transactions.filter((x) => x.type === "expense").reduce((s, x) => s + Math.abs(x.amount), 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  // Heatmap: real daily expense totals for the current month
  const heatmap = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const dayMap = new Map<number, number>();
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        const d = new Date(tx.dateISO);
        if (d.getFullYear() === y && d.getMonth() === m) {
          dayMap.set(d.getDate(), (dayMap.get(d.getDate()) ?? 0) + Math.abs(tx.amount));
        }
      });
    const max = Math.max(...dayMap.values(), 1);
    const firstWeekday = new Date(y, m, 1).getDay();
    return { daysInMonth, firstWeekday, dayMap, max };
  }, [transactions]);

  const weekdays = locale === "ar"
    ? ["أحد", "اثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t("Reports & Analytics", "التقارير والتحليلات")}</h1>
        <p className="text-sm text-text-secondary">{t("Visual insights into your spending", "رؤى بصرية حول إنفاقك")}</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title={t("No data to report yet", "لا توجد بيانات للتقارير بعد")}
          description={t("Charts fill in automatically as you record income and expenses.", "تمتلئ المخططات تلقائياً كلما سجّلت دخلاً ومصروفات.")}
          actionLabel={t("Add Expense", "إضافة مصروف")}
          href={`/${locale}/transactions`}
          secondaryActionLabel={t("Deposit Income", "إيداع دخل")}
          secondaryHref={`/${locale}/wallets`}
        />
      ) : (
        <>
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-5">
              <p className="text-sm text-text-secondary">{t("Total Income", "إجمالي الدخل")}</p>
              <p className="mt-1 text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-text-secondary">{t("Total Expenses", "إجمالي المصروفات")}</p>
              <p className="mt-1 text-2xl font-bold text-danger">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-text-secondary">{t("Savings rate", "نسبة التوفير")}</p>
              <p className="mt-1 text-2xl font-bold text-accent">{savingsRate}%</p>
            </div>
          </div>

          {/* Income vs Expense bar chart */}
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-text-primary">{t("Income vs Expenses by Month", "الدخل مقابل المصروفات شهرياً")}</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border-color)" }} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                  <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 13 }} />
                  <Bar dataKey="income" name={t("Income", "الدخل")} fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name={t("Expenses", "المصروفات")} fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category pie */}
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-accent" />
                <h2 className="font-semibold text-text-primary">{t("Spending by Category", "الإنفاق حسب الفئة")}</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={60} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
                    <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Heatmap calendar — real daily spending */}
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-accent" />
                <h2 className="font-semibold text-text-primary">{t("Spending Heatmap", "خريطة الإنفاق الحرارية")}</h2>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-text-secondary">
                {weekdays.map((d) => <span key={d} className="pb-1">{d}</span>)}
                {Array.from({ length: heatmap.firstWeekday }).map((_, i) => (
                  <span key={`pad-${i}`} />
                ))}
                {Array.from({ length: heatmap.daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const v = heatmap.dayMap.get(day) ?? 0;
                  const intensity = v / heatmap.max;
                  return (
                    <div key={day}
                      title={v > 0 ? `${t("Day", "يوم")} ${day}: ${formatCurrency(v)}` : `${t("Day", "يوم")} ${day}`}
                      className="flex aspect-square items-center justify-center rounded-lg text-[11px] font-medium text-text-primary transition-transform hover:scale-110"
                      style={{ backgroundColor: heatColor(intensity) }}>
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-text-secondary">
                <span>{t("Less", "أقل")}</span>
                {[0.01, 0.15, 0.4, 0.6, 0.9].map((v) => (
                  <span key={v} className="h-3.5 w-3.5 rounded" style={{ backgroundColor: heatColor(v) }} />
                ))}
                <span>{t("More", "أكثر")}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
