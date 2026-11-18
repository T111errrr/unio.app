export const THEME_KEY = "unio-theme";
export const MOTION_KEY = "unio-reduce-motion";

export type Theme = "system" | "light" | "dark";

export function parseTheme(value: string | null | undefined): Theme {
  return value === "light" || value === "dark" ? value : "system";
}

/**
 * Skrip kecil yang dijalankan sebelum halaman digambar, supaya tema tersimpan langsung dipakai
 * (tanpa kedip terang → gelap). Harus tetap kecil dan tidak boleh melempar galat.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"||t==="system")d.setAttribute("data-theme",t);if(localStorage.getItem("${MOTION_KEY}")==="1")d.setAttribute("data-reduce-motion","true")}catch(e){}})();`;
