"use client";

import { useSyncExternalStore } from "react";

export type Note = { id: string; title: string; body: string; tag: string; at: string };

let state: { notes: Note[] } = { notes: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Lapisan data tipis (data contoh lokal). Diganti Supabase di tahap backend. */
export const notesStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  add(input: Omit<Note, "id" | "at">): string {
    const id = `n${Date.now()}${Math.floor(Math.random() * 1000)}`;
    state = { notes: [{ ...input, id, at: new Date().toISOString() }, ...state.notes] };
    emit();
    return id;
  },
  remove(id: string) {
    state = { notes: state.notes.filter((n) => n.id !== id) };
    emit();
  },
};

export const useNotes = () => useSyncExternalStore(notesStore.subscribe, notesStore.getSnapshot, notesStore.getSnapshot);
