"use client";

import { useSyncExternalStore } from "react";
import { MOTION_KEY, THEME_KEY, parseTheme, type Theme } from "./theme";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Penyimpanan diblokir (mis. mode privat): perubahan tetap berlaku sampai halaman ditutup.
  }
}

/** Tema aktif. Tersimpan di localStorage; penyimpanan ke profil menyusul bersama login (fase 2). */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(
    subscribe,
    () => parseTheme(document.documentElement.getAttribute("data-theme")),
    () => "system" as Theme,
  );
  const setTheme = (next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    save(THEME_KEY, next);
    emit();
  };
  return [theme, setTheme];
}

/** Pengaturan "Kurangi gerakan" milik app (selain pengaturan sistem). */
export function useReduceMotion(): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute("data-reduce-motion") === "true",
    () => false,
  );
  const setValue = (next: boolean) => {
    if (next) document.documentElement.setAttribute("data-reduce-motion", "true");
    else document.documentElement.removeAttribute("data-reduce-motion");
    save(MOTION_KEY, next ? "1" : "0");
    emit();
  };
  return [value, setValue];
}
