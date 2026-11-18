"use client";

import { useSyncExternalStore } from "react";
import { createMockCategories, createMockPockets, createMockTransactions } from "./mock";

export type TransactionKind = "expense" | "income" | "transfer";
export type Transaction = {
  id: string;
  kind: TransactionKind;
  /** Rupiah bulat, selalu positif; tandanya ditentukan `kind`. */
  amount: number;
  category: string;
  note: string;
  /** Kantong sumber (atau tujuan untuk pemasukan), mis. "Cash". */
  pocket: string;
  /** Hanya untuk transfer: kantong tujuan. */
  toPocket?: string;
  at: string;
  source?: string;
  memo?: string;
};

export type PocketKind = "cash" | "bank" | "ewallet" | "tabungan" | "paylater";
export type Pocket = {
  id: string;
  name: string;
  kind: PocketKind;
  /** Saldo (kantong biasa) atau utang berjalan (Paylater), rupiah bulat. */
  balance: number;
  limit?: number;
  /** Tanggal jatuh tempo tiap bulan (Paylater). */
  dueDay?: number;
  installment?: number;
};
export type BudgetCategory = { id: string; name: string; emoji: string; limit: number; keywords: string[] };

export type FinanceStatus = "loading" | "ready" | "error";
type Scenario = "default" | "empty" | "error" | "offline";
type State = {
  status: FinanceStatus;
  transactions: Transaction[];
  pockets: Pocket[];
  budget: { monthly: number; categories: BudgetCategory[] };
  unsynced: boolean;
};

let state: State = {
  status: "ready",
  transactions: createMockTransactions(),
  pockets: createMockPockets(),
  budget: { monthly: 8_000_000, categories: createMockCategories() },
  unsynced: false,
};
const listeners = new Set<() => void>();
const set = (p: Partial<State>) => {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
};

/** Efek satu transaksi pada saldo kantong. sign = 1 untuk menerapkan, -1 untuk membatalkan. */
function applyTx(pockets: Pocket[], tx: Transaction, sign: 1 | -1): Pocket[] {
  const move = (name: string, delta: number) => (p: Pocket) => (p.name === name ? { ...p, balance: p.balance + delta } : p);
  let next = pockets;
  const debt = (name: string) => pockets.find((p) => p.name === name)?.kind === "paylater";
  if (tx.kind === "income") next = next.map(move(tx.pocket, sign * tx.amount));
  if (tx.kind === "expense") next = next.map(move(tx.pocket, sign * tx.amount * (debt(tx.pocket) ? 1 : -1)));
  if (tx.kind === "transfer" && tx.toPocket) {
    next = next.map(move(tx.pocket, sign * tx.amount * (debt(tx.pocket) ? 1 : -1)));
    next = next.map(move(tx.toPocket, sign * tx.amount * (debt(tx.toPocket) ? -1 : 1)));
  }
  return next;
}

/** Lapisan data tipis (data contoh lokal). Diganti Supabase di tahap backend. */
export const financeStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  load(scenario: Scenario = "default") {
    set({ status: "loading", unsynced: false });
    setTimeout(() => {
      if (scenario === "error") return set({ status: "error", transactions: [], pockets: [] });
      if (scenario === "empty") return set({ status: "ready", transactions: [], pockets: [] });
      set({
        status: "ready",
        transactions: createMockTransactions(),
        pockets: createMockPockets(),
        budget: { monthly: 8_000_000, categories: createMockCategories() },
        unsynced: scenario === "offline",
      });
    }, 700);
  },
  add(input: Omit<Transaction, "id" | "at"> & { at?: string }): string {
    const tx: Transaction = { ...input, id: `tx${Date.now()}${Math.floor(Math.random() * 1000)}`, at: input.at ?? new Date().toISOString() };
    set({ transactions: [tx, ...state.transactions].sort((a, b) => b.at.localeCompare(a.at)), pockets: applyTx(state.pockets, tx, 1) });
    return tx.id;
  },
  /** Hapus + batalkan efek ke saldo. Mengembalikan transaksi agar bisa di-Undo lewat `restore`. */
  remove(id: string): Transaction | undefined {
    const tx = state.transactions.find((t) => t.id === id);
    if (!tx) return undefined;
    set({ transactions: state.transactions.filter((t) => t.id !== id), pockets: applyTx(state.pockets, tx, -1) });
    return tx;
  },
  restore(tx: Transaction) {
    set({ transactions: [tx, ...state.transactions].sort((a, b) => b.at.localeCompare(a.at)), pockets: applyTx(state.pockets, tx, 1) });
  },
  update(id: string, patch: Partial<Pick<Transaction, "note" | "amount" | "memo">>) {
    const old = state.transactions.find((t) => t.id === id);
    if (!old) return;
    const next = { ...old, ...patch };
    set({
      transactions: state.transactions.map((t) => (t.id === id ? next : t)),
      pockets: applyTx(applyTx(state.pockets, old, -1), next, 1),
    });
  },
  addPocket(input: Omit<Pocket, "id">): string {
    const id = `p${Date.now()}`;
    set({ pockets: [...state.pockets, { ...input, id }] });
    return id;
  },
  transfer(from: string, to: string, amount: number) {
    return financeStore.add({ kind: "transfer", amount, category: "transfer", note: `Ke ${to}`, pocket: from, toPocket: to, source: "Manual" });
  },
  setBudget(monthly: number) {
    set({ budget: { ...state.budget, monthly } });
  },
  setCategoryLimit(id: string, limit: number) {
    set({ budget: { ...state.budget, categories: state.budget.categories.map((c) => (c.id === id ? { ...c, limit } : c)) } });
  },
  addCategory(name: string, limit: number) {
    const id = `c${Date.now()}`;
    set({ budget: { ...state.budget, categories: [...state.budget.categories, { id, name, emoji: "🏷️", limit, keywords: [] }] } });
  },
  addKeyword(categoryId: string, word: string) {
    const w = word.trim().toLowerCase();
    if (!w) return;
    set({ budget: { ...state.budget, categories: state.budget.categories.map((c) => (c.id === categoryId && !c.keywords.includes(w) ? { ...c, keywords: [...c.keywords, w] } : c)) } });
  },
  retrySync() {
    set({ unsynced: false });
  },
};

export const useFinance = () => useSyncExternalStore(financeStore.subscribe, financeStore.getSnapshot, financeStore.getSnapshot);
