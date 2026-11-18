import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  // Bahasa Indonesia di "/", Inggris di "/en".
  localePrefix: "as-needed",
  // Default selalu Indonesia: jangan menebak dari bahasa browser. Pilihan pengguna = URL (/en) lalu profil (fase 2).
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
