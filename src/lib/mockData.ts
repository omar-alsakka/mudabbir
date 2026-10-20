export type Locale = "en" | "ar";

export const pick = (locale: string, en: string, ar: string) =>
  locale === "ar" ? ar : en;

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function progressColor(pct: number) {
  if (pct >= 100) return { bar: "bg-danger", text: "text-danger" };
  if (pct >= 80) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-success", text: "text-success" };
}

// ─── Shopping List ─────────────────────────────────────────
export interface MockShoppingItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  store: "supermarket" | "pharmacy";
  checked: boolean;
}

// ─── Expense categories (shared picklist) ──────────────────
export const expenseCategories = ["Food", "Bills", "Transport", "Restaurant", "Health", "Shopping", "Entertainment", "Other"];
export const expenseCategoriesAr = ["طعام", "فواتير", "مواصلات", "مطعم", "صحة", "تسوق", "ترفيه", "أخرى"];
