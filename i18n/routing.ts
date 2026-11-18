import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  // Bahasa Indonesia di "/", Inggris di "/en".
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
