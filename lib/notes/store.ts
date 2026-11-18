"use client";

import { useSyncExternalStore } from "react";
import { createMockNotes } from "./mock";

export type Note = {
  id: string;
  title: string;
  body: string;
  /** Nama folder, mis. "Pribadi". */
  tag: string;
  pinned?: boolean;
  at: string;
  deletedAt?: string | null;
};

export type NotesStatus = "loading" | "ready" | "error";
type Scenario = "default" | "empty" | "error" | "offline";
type State = { status: NotesStatus; notes: Note[]; folders: string[]; unsynced: boolean };

const DEFAULT_FOLDERS = ["Pribadi", "Kantor", "Ide"];
let state: State = { status: "ready", notes: createMockNotes(), folders: DEFAULT_FOLDERS, unsynced: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const mapNote = (id: string, fn: (n: Note) => Note) => set({ notes: state.notes.map((n) => (n.id === id ? fn(n) : n)) });

/** Lapisan data tipis (data contoh lokal). Diganti Supabase di tahap backend. */
export const notesStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  load(scenario: Scenario = "default") {
    set({ status: "loading", unsynced: false });
    setTimeout(() => {
      if (scenario === "error") return set({ status: "error", notes: [] });
      set({ status: "ready", notes: scenario === "empty" ? [] : createMockNotes(), unsynced: scenario === "offline" });
    }, 700);
  },
  add(input: Omit<Note, "id" | "at" | "pinned" | "deletedAt">): string {
    const id = `n${Date.now()}${Math.floor(Math.random() * 1000)}`;
    set({ notes: [{ ...input, id, at: new Date().toISOString(), pinned: false, deletedAt: null }, ...state.notes] });
    return id;
  },
  update(id: string, patch: Partial<Pick<Note, "title" | "body" | "tag">>) {
    mapNote(id, (n) => ({ ...n, ...patch, at: new Date().toISOString() }));
  },
  togglePin(id: string) {
    mapNote(id, (n) => ({ ...n, pinned: !n.pinned }));
  },
  /** Hapus lunak (bisa di-Undo). */
  remove(id: string) {
    mapNote(id, (n) => ({ ...n, deletedAt: new Date().toISOString() }));
  },
  restore(id: string) {
    mapNote(id, (n) => ({ ...n, deletedAt: null }));
  },
  /** Batalkan catatan yang baru dibuat (Undo di toast "Tersimpan"). */
  discard(id: string) {
    set({ notes: state.notes.filter((n) => n.id !== id) });
  },
  addFolder(name: string) {
    const v = name.trim();
    if (v && !state.folders.includes(v)) set({ folders: [...state.folders, v] });
  },
  retrySync() {
    set({ unsynced: false });
  },
};

export const useNotes = () => useSyncExternalStore(notesStore.subscribe, notesStore.getSnapshot, notesStore.getSnapshot);
