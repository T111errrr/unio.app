"use client";

import { useSyncExternalStore } from "react";

export type NotifKey = "dueReminder" | "budget" | "paylater" | "incoming" | "outgoing";
export type ShortcutKey = "expense" | "income" | "task" | "capture" | "note" | "summary";
type State = {
  notif: Record<NotifKey, boolean>;
  reviewTime: string;
  /** Hanya 4 karakter terakhir yang disimpan di sini; kunci asli dibuat server (tahap backend). */
  keyTail: string;
  keyCreated: string;
  shortcuts: Record<ShortcutKey, boolean>;
};

function randomTail(): string {
  const c = "0123456789abcdefghjkmnpqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => c[b % c.length]).join("");
}

let state: State = {
  notif: { dueReminder: true, budget: true, paylater: true, incoming: true, outgoing: true },
  reviewTime: "21:00",
  keyTail: "7Q2f",
  keyCreated: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7).toISOString(),
  shortcuts: { expense: true, income: false, task: true, capture: false, note: false, summary: false },
};
const listeners = new Set<() => void>();
const set = (p: Partial<State>) => {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
};

/** Pengaturan lokal. Penyimpanan ke profil + pembuatan API key sungguhan menyusul di tahap backend. */
export const settingsStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  setNotif(k: NotifKey, v: boolean) {
    set({ notif: { ...state.notif, [k]: v } });
  },
  setReviewTime(v: string) {
    set({ reviewTime: v });
  },
  toggleShortcut(k: ShortcutKey) {
    set({ shortcuts: { ...state.shortcuts, [k]: !state.shortcuts[k] } });
  },
  regenerateKey() {
    set({ keyTail: randomTail(), keyCreated: new Date().toISOString() });
  },
};

export const useSettings = () => useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot, settingsStore.getSnapshot);
