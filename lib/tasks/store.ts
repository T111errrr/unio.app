"use client";

import { useSyncExternalStore } from "react";
import { createMockTasks } from "./mock";
import type { Task, TasksStatus } from "./types";

type State = { status: TasksStatus; tasks: Task[]; unsynced: boolean };

let state: State = { status: "loading", tasks: [], unsynced: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

/** Lapisan data tipis. Tahap backend cukup mengganti isi fungsi-fungsi ini dengan Supabase. */
export const tasksStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  load(scenario: "default" | "empty" | "error" | "offline" = "default") {
    set({ status: "loading", unsynced: false });
    setTimeout(() => {
      if (scenario === "error") return set({ status: "error", tasks: [] });
      set({
        status: "ready",
        tasks: scenario === "empty" ? [] : createMockTasks(),
        unsynced: scenario === "offline",
      });
    }, 700);
  },
  toggle(id: string) {
    set({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  },
  update(id: string, patch: Partial<Task>) {
    set({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  },
  toggleSubtask(id: string, subtaskId: string) {
    set({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) } : t,
      ),
    });
  },
  addSubtask(id: string, title: string) {
    const sub = { id: `s${Date.now()}`, title, done: false };
    set({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, subtasks: [...t.subtasks, sub] } : t)) });
  },
  /** Soft delete; Undo 5 detik menyusul di tugas 2.03. */
  remove(id: string) {
    set({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t)) });
  },
  retrySync() {
    set({ unsynced: false });
  },
};

export function useTasks(): State {
  return useSyncExternalStore(tasksStore.subscribe, tasksStore.getSnapshot, tasksStore.getSnapshot);
}
