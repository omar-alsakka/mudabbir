import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ─────────────────────────────────────────────────
export type WalletType = "CASH" | "BANK";
export type TransactionType = "income" | "expense" | "transfer";
export type BillPricing = "fixed" | "variable";
export type DebtDirection = "iOwe" | "owedToMe";

export interface FinanceWallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
}

export interface FinanceTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  dateISO: string;
  status: "completed" | "pending";
  walletId: string;
  walletName: string;
  type: TransactionType;
}

export interface FinanceGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  color: string;
  emoji: string;
  deadline?: string;
}

export interface FinanceBill {
  id: string;
  name: string;
  pricing: BillPricing;
  amount?: number;
  renewalInDays: number;
  color: string;
}

export interface FinanceDebt {
  id: string;
  person: string;
  direction: DebtDirection;
  total: number;
  remaining: number;
  dueDate?: string;
  notes?: string;
  settled: boolean;
}

export interface FinancePayment {
  id: string;
  person: string;
  amount: number;
  dateISO: string;
  direction: DebtDirection;
}

export interface FinanceEnvelope {
  id: string;
  name: string;
  category: string;
  allocated: number;
  color: string;
  icon: string;
}

interface FinanceState {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  goals: FinanceGoal[];
  bills: FinanceBill[];
  debts: FinanceDebt[];
  payments: FinancePayment[];
  envelopes: FinanceEnvelope[];
  _hasHydrated: boolean;

  addWallet: (name: string, type: WalletType, balance: number, color: string) => void;
  deleteWallet: (walletId: string) => void;
  depositToWallet: (walletId: string, amount: number, description: string) => boolean;
  addExpense: (walletId: string, amount: number, description: string, category: string) => boolean;
  transferBetweenWallets: (fromId: string, toId: string, amount: number) => boolean;

  addGoal: (name: string, target: number, emoji: string, color: string, deadline?: string) => void;
  depositToGoal: (goalId: string, walletId: string, amount: number) => boolean;
  deleteGoal: (goalId: string) => void;

  addBill: (name: string, pricing: BillPricing, amount: number | undefined, color: string) => void;
  payBill: (billId: string, walletId: string, amount: number) => boolean;
  deleteBill: (billId: string) => void;

  addDebt: (person: string, amount: number, direction: DebtDirection, dueDate?: string, notes?: string) => void;
  repayDebt: (debtId: string, walletId: string, amount: number) => boolean;
  deleteDebt: (debtId: string) => void;

  addEnvelope: (name: string, category: string, allocated: number, color: string, icon: string) => void;
  deleteEnvelope: (envelopeId: string) => void;
  transferEnvelopeAllocation: (fromId: string, toId: string, amount: number) => boolean;

  setHasHydrated: (v: boolean) => void;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ─── Zero-state seeds: everything starts at 0.00 / empty ───
const seedWallets: FinanceWallet[] = [
  { id: "w1", name: "Cash", type: "CASH", balance: 0, currency: "USD", color: "#10B981" },
  { id: "w2", name: "Bank Account", type: "BANK", balance: 0, currency: "USD", color: "#3B82F6" },
];

// ─── Store ─────────────────────────────────────────────────
export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      wallets: seedWallets,
      transactions: [],
      goals: [],
      bills: [],
      debts: [],
      payments: [],
      envelopes: [],
      _hasHydrated: false,

      addWallet: (name, type, balance, color) =>
        set((s) => ({
          wallets: [...s.wallets, { id: uid(), name, type, balance, currency: "USD", color }],
        })),

      deleteWallet: (walletId) =>
        set((s) => ({
          wallets: s.wallets.filter((w) => w.id !== walletId),
        })),

      depositToWallet: (walletId, amount, description) => {
        if (amount <= 0) return false;
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (!wallet) return false;
        set((s) => ({
          wallets: s.wallets.map((w) => (w.id === walletId ? { ...w, balance: w.balance + amount } : w)),
          transactions: [
            {
              id: uid(),
              description: description || "Deposit",
              category: "Income",
              amount,
              dateISO: new Date().toISOString(),
              status: "completed",
              walletId,
              walletName: wallet.name,
              type: "income",
            },
            ...s.transactions,
          ],
        }));
        return true;
      },

      addExpense: (walletId, amount, description, category) => {
        if (amount <= 0) return false;
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (!wallet) return false;
        if (wallet.balance < amount) return false;
        set((s) => ({
          wallets: s.wallets.map((w) => (w.id === walletId ? { ...w, balance: w.balance - amount } : w)),
          transactions: [
            {
              id: uid(),
              description: description || "Expense",
              category,
              amount: -amount,
              dateISO: new Date().toISOString(),
              status: "completed",
              walletId,
              walletName: wallet.name,
              type: "expense",
            },
            ...s.transactions,
          ],
        }));
        return true;
      },

      transferBetweenWallets: (fromId, toId, amount) => {
        if (amount <= 0 || fromId === toId) return false;
        const from = get().wallets.find((w) => w.id === fromId);
        const to = get().wallets.find((w) => w.id === toId);
        if (!from || !to || from.balance < amount) return false;
        set((s) => ({
          wallets: s.wallets.map((w) => {
            if (w.id === fromId) return { ...w, balance: w.balance - amount };
            if (w.id === toId) return { ...w, balance: w.balance + amount };
            return w;
          }),
          transactions: [
            {
              id: uid(),
              description: `Transfer: ${from.name} → ${to.name}`,
              category: "Transfer",
              amount: -amount,
              dateISO: new Date().toISOString(),
              status: "completed",
              walletId: fromId,
              walletName: from.name,
              type: "transfer",
            },
            ...s.transactions,
          ],
        }));
        return true;
      },

      addGoal: (name, target, emoji, color, deadline) =>
        set((s) => ({
          goals: [...s.goals, { id: uid(), name, target, saved: 0, color, emoji, deadline }],
        })),

      depositToGoal: (goalId, walletId, amount) => {
        if (amount <= 0) return false;
        const goal = get().goals.find((g) => g.id === goalId);
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (!goal || !wallet || wallet.balance < amount) return false;
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g
          ),
          wallets: s.wallets.map((w) => (w.id === walletId ? { ...w, balance: w.balance - amount } : w)),
          transactions: [
            {
              id: uid(),
              description: `Savings deposit: ${goal.name}`,
              category: "Savings",
              amount: -amount,
              dateISO: new Date().toISOString(),
              status: "completed",
              walletId,
              walletName: wallet.name,
              type: "transfer",
            },
            ...s.transactions,
          ],
        }));
        return true;
      },

      deleteGoal: (goalId) => set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) })),

      addBill: (name, pricing, amount, color) =>
        set((s) => ({
          bills: [...s.bills, { id: uid(), name, pricing, amount, renewalInDays: 30, color }],
        })),

      payBill: (billId, walletId, amount) => {
        if (amount <= 0) return false;
        const bill = get().bills.find((b) => b.id === billId);
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (!bill || !wallet || wallet.balance < amount) return false;
        set((s) => ({
          wallets: s.wallets.map((w) => (w.id === walletId ? { ...w, balance: w.balance - amount } : w)),
          bills: s.bills.map((b) => (b.id === billId ? { ...b, renewalInDays: 30 } : b)),
          transactions: [
            {
              id: uid(),
              description: `Bill payment: ${bill.name}`,
              category: "Bills",
              amount: -amount,
              dateISO: new Date().toISOString(),
              status: "completed",
              walletId,
              walletName: wallet.name,
              type: "expense",
            },
            ...s.transactions,
          ],
        }));
        return true;
      },

      deleteBill: (billId) => set((s) => ({ bills: s.bills.filter((b) => b.id !== billId) })),

      addDebt: (person, amount, direction, dueDate, notes) =>
        set((s) => ({
          debts: [
            ...s.debts,
            { id: uid(), person, direction, total: amount, remaining: amount, dueDate, notes, settled: false },
          ],
        })),

      repayDebt: (debtId, walletId, amount) => {
        if (amount <= 0) return false;
        const debt = get().debts.find((d) => d.id === debtId);
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (!debt || !wallet) return false;
        if (debt.direction === "iOwe" && wallet.balance < amount) return false;
        const applied = Math.min(amount, debt.remaining);
        set((s) => ({
          debts: s.debts.map((d) =>
            d.id === debtId
              ? { ...d, remaining: d.remaining - applied, settled: d.remaining - applied <= 0 }
              : d
          ),
          wallets: s.wallets.map((w) =>
            w.id === walletId
              ? { ...w, balance: debt.direction === "iOwe" ? w.balance - applied : w.balance + applied }
              : w
          ),
          payments: [
            { id: uid(), person: debt.person, amount: applied, dateISO: new Date().toISOString(), direction: debt.direction },
            ...s.payments,
          ],
          transactions: [
            {
              id: uid(),
              description:
                debt.direction === "iOwe"
                  ? `Debt repayment to ${debt.person}`
                  : `Debt collection from ${debt.person}`,
              category: "Debts",
              amount: debt.direction === "iOwe" ? -applied : applied,
              dateISO: new Date().toISOString(),
              status: "completed",
              walletId,
              walletName: wallet.name,
              type: debt.direction === "iOwe" ? "expense" : "income",
            },
            ...s.transactions,
          ],
        }));
        return true;
      },

      deleteDebt: (debtId) => set((s) => ({ debts: s.debts.filter((d) => d.id !== debtId) })),

      addEnvelope: (name, category, allocated, color, icon) =>
        set((s) => ({
          envelopes: [...s.envelopes, { id: uid(), name, category, allocated, color, icon }],
        })),

      deleteEnvelope: (envelopeId) =>
        set((s) => ({ envelopes: s.envelopes.filter((e) => e.id !== envelopeId) })),

      transferEnvelopeAllocation: (fromId, toId, amount) => {
        if (amount <= 0 || fromId === toId) return false;
        const from = get().envelopes.find((e) => e.id === fromId);
        if (!from || from.allocated < amount) return false;
        set((s) => ({
          envelopes: s.envelopes.map((e) => {
            if (e.id === fromId) return { ...e, allocated: e.allocated - amount };
            if (e.id === toId) return { ...e, allocated: e.allocated + amount };
            return e;
          }),
        }));
        return true;
      },

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "mudabbir-finance",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
