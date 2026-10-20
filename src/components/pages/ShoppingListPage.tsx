"use client";

import { useState } from "react";
import { ShoppingCart, Pill, Plus, Trash2, Check, Receipt } from "lucide-react";
import { pick, formatCurrency } from "@/lib/mockData";
import type { MockShoppingItem } from "@/lib/mockData";
import { EmptyState } from "@/components/shared/EmptyState";

export function ShoppingListPage({ locale }: { locale: string }) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const [items, setItems] = useState<MockShoppingItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", store: "supermarket" });
  const [log, setLog] = useState<string[]>([]);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const checked = !item.checked;
        if (checked) {
          const cost = item.price * item.qty;
          setLog((l) => [
            `${t("Logged", "سُجّل")}: ${item.name} — ${formatCurrency(cost)} → ${t("Food envelope", "مغلف الطعام")}`,
            ...l,
          ]);
        }
        return { ...item, checked };
      })
    );
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItem.price);
    if (!newItem.name || isNaN(price)) return;
    setItems((prev) => [
      ...prev,
      {
        id: `sh-${Date.now()}`,
        name: newItem.name,
        nameAr: newItem.name,
        qty: 1,
        price,
        store: newItem.store as MockShoppingItem["store"],
        checked: false,
      },
    ]);
    setNewItem({ name: "", price: "", store: "supermarket" });
  };

  const groups = [
    { key: "supermarket" as const, label: t("Supermarket", "سوبرماركت"), labelAr: "سوبرماركت", icon: ShoppingCart, color: "#10B981" },
    { key: "pharmacy" as const, label: t("Pharmacy", "صيدلية"), labelAr: "صيدلية", icon: Pill, color: "#EF4444" },
  ];

  const checkedTotal = items.filter((i) => i.checked).reduce((s, i) => s + i.price * i.qty, 0);
  const estTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const remainingCount = items.filter((i) => !i.checked).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("Shopping List", "قائمة التسوق")}</h1>
          <p className="text-sm text-text-secondary">
            {t("Checking an item auto-logs its cost into the budget envelope", "تعليم عنصر يسجّل تلقائياً تكلفته في مغلف الميزانية")}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2.5 text-center">
            <p className="text-xs text-text-secondary">{t("Estimated", "التقديري")}</p>
            <p className="font-bold text-text-primary">{formatCurrency(estTotal)}</p>
          </div>
          <div className="glass-card px-4 py-2.5 text-center">
            <p className="text-xs text-text-secondary">{t("In cart", "في السلة")}</p>
            <p className="font-bold text-success">{formatCurrency(checkedTotal)}</p>
          </div>
          <div className="glass-card px-4 py-2.5 text-center">
            <p className="text-xs text-text-secondary">{t("Remaining", "المتبقي")}</p>
            <p className="font-bold text-accent">{remainingCount}</p>
          </div>
        </div>
      </div>

      {/* Add item */}
      <form onSubmit={add} className="glass-card flex flex-col gap-3 p-4 sm:flex-row">
        <input
          value={newItem.name}
          onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
          placeholder={t("Item name...", "اسم العنصر...")}
          className="flex-1 rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none"
        />
        <input
          type="number" min="0" step="0.01"
          value={newItem.price}
          onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
          placeholder={t("Price", "السعر")}
          className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none sm:w-32"
        />
        <select
          value={newItem.store}
          onChange={(e) => setNewItem((p) => ({ ...p, store: e.target.value }))}
          className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none sm:w-40"
        >
          <option value="supermarket">{t("Supermarket", "سوبرماركت")}</option>
          <option value="pharmacy">{t("Pharmacy", "صيدلية")}</option>
        </select>
        <button type="submit" className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
          <Plus className="h-4 w-4" /> {t("Add", "إضافة")}
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grouped lists */}
        <div className="space-y-6 lg:col-span-2">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title={t("Your shopping list is empty", "قائمة التسوق فارغة")}
              description={t("Add items with their prices — checking them off auto-logs the cost into the budget envelope.", "أضف عناصر بأسعارها — تعليمها يسجّل التكلفة تلقائياً في مغلف الميزانية.")}
            />
          ) : null}
          {groups.map((group) => {
            const groupItems = items.filter((i) => i.store === group.key);
            if (groupItems.length === 0) return null;
            return (
              <div key={group.key} className="glass-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg p-2" style={{ backgroundColor: `${group.color}22`, color: group.color }}>
                    <group.icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-semibold text-text-primary">{group.label}</h2>
                  <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary">{groupItems.length}</span>
                </div>
                <div className="space-y-2">
                  {groupItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        item.checked ? "border-success/30 bg-success/5" : "border-border-color bg-bg-secondary/50"
                      }`}
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                          item.checked ? "border-success bg-success text-white" : "border-border-color hover:border-accent"
                        }`}
                        aria-label={t("Toggle", "تبديل")}
                      >
                        {item.checked && <Check className="h-4 w-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${item.checked ? "text-text-secondary line-through" : "text-text-primary"}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-text-secondary">×{item.qty}</p>
                      </div>
                      <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.price * item.qty)}</span>
                      <button onClick={() => remove(item.id)} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Auto-log panel */}
        <div className="glass-card h-fit p-5">
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-text-primary">{t("Envelope Auto-Log", "التسجيل التلقائي للمغلف")}</h2>
          </div>
          {log.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {t("Checked items will be logged here as expenses", "العناصر المعلّمة ستُسجَّل هنا كمصروفات")}
            </p>
          ) : (
            <div className="space-y-2">
              {log.map((entry, i) => (
                <div key={i} className="rounded-lg border border-success/20 bg-success/5 p-2.5 text-xs font-medium text-success">
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
