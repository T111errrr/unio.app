"use client";

import { useSyncExternalStore } from "react";
import { createMockTransactions } from "./mock";

export type TransactionKind = "expense" | "income";
export type Transaction = {
  id: string;
  kind: TransactionKind;
  /** Rupiah bulat, selalu positif; tandanya ditentukan `kind`. */
  amount: number;
  category: string;
  note: string;
  /** Kantong sumber/tujuan, mis. "Cash". */
  pocket: string;
  at: string;
};

let state: { transactions: Transaction[] } = { transactions: createMockTransactions() };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Lapisan data tipis (data contoh lokal). Diganti Supabase di tahap backend. */
export const financeStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  add(input: Omit<Transaction, "id" | "at"> & { at?: string }): string {
    const id = `tx${Date.now()}${Math.floor(Math.random() * 1000)}`;
    state = { transactions: [{ ...input, id, at: input.at ?? new Date().toISOString() }, ...state.transactions] };
    emit();
    return id;
  },
  remove(id: string) {
    state = { transactions: state.transactions.filter((t) => t.id !== id) };
    emit();
  },
};

export const useFinance = () => useSyncExternalStore(financeStore.subscribe, financeStore.getSnapshot, financeStore.getSnapshot);
