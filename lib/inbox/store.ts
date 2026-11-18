"use client";

import { useSyncExternalStore } from "react";

export type InboxIssue = "pocket" | "category" | "date";
export type InboxItem = {
  id: string;
  kind: "expense" | "task";
  /** Teks mentah seperti yang dikirim dari Siri / Back Tap. */
  raw: string;
  source: "Siri" | "Back Tap";
  at: string;
  issue: InboxIssue;
  /** Hasil baca otomatis. */
  amount?: number;
  category?: string | null;
  /** Untuk tugas: tanggal yang terbaca (ISO). */
  dateHint?: string;
  title?: string;
};
export type InboxStatus = "loading" | "ready" | "error";
type Scenario = "default" | "empty" | "error" | "offline";
type State = { status: InboxStatus; items: InboxItem[]; unsynced: boolean };

function create(): InboxItem[] {
  const now = new Date();
  const at = (days: number, h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    { id: "i1", kind: "expense", raw: "Rp25.000 kopi", source: "Siri", at: at(0, 8, 12), issue: "pocket", amount: 25_000, category: "coffee" },
    { id: "i2", kind: "expense", raw: "50rb bensin", source: "Back Tap", at: at(-1, 17, 30), issue: "category", amount: 50_000, category: null },
    { id: "i3", kind: "task", raw: "telepon bank besok", source: "Siri", at: at(-1, 9, 5), issue: "date", title: "Telepon bank", dateHint: at(1, 9, 0) },
  ];
}

let state: State = { status: "ready", items: create(), unsynced: false };
const listeners = new Set<() => void>();
const set = (p: Partial<State>) => {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
};

/** Lapisan data tipis (data contoh lokal). Diganti Supabase di tahap backend. */
export const inboxStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  load(scenario: Scenario = "default") {
    set({ status: "loading", unsynced: false });
    setTimeout(() => {
      if (scenario === "error") return set({ status: "error", items: [] });
      set({ status: "ready", items: scenario === "empty" ? [] : create(), unsynced: scenario === "offline" });
    }, 700);
  },
  /** Dipakai saat entri dilengkapi / dihapus. Mengembalikan entri agar bisa di-Undo. */
  take(id: string): InboxItem | undefined {
    const item = state.items.find((i) => i.id === id);
    set({ items: state.items.filter((i) => i.id !== id) });
    return item;
  },
  put(item: InboxItem) {
    set({ items: [...state.items, item].sort((a, b) => b.at.localeCompare(a.at)) });
  },
  retrySync() {
    set({ unsynced: false });
  },
};

export const useInbox = () => useSyncExternalStore(inboxStore.subscribe, inboxStore.getSnapshot, inboxStore.getSnapshot);
