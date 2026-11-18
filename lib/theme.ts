/**
 * Tema Unio: <html data-theme="light|dark|system">.
 * "system" mengikuti pengaturan perangkat lewat prefers-color-scheme (lihat styles/tokens.css).
 * Pilihan tema disimpan di localStorage; layar Tampilan (tugas 1.09) juga akan menyimpannya di profil.
 */

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "system";
export const THEME_STORAGE_KEY = "unio-theme";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/**
 * Skrip kecil yang dijalankan di <head> sebelum halaman digambar,
 * supaya tema tersimpan langsung terpasang tanpa kedip.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(${JSON.stringify(THEMES)}.indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/**
 * Warna bilah status / theme-color browser.
 * Harus sama dengan --unio-background di styles/tokens.css (dicek otomatis oleh lib/theme.test.ts).
 */
export const BROWSER_THEME_COLOR = {
  light: "#f4f4f4",
  dark: "#000000",
} as const;
