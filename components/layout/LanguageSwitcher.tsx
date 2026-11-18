"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** Pilihan bahasa ID / EN. Area tekan minimal 44 px. */
export function LanguageSwitcher() {
  const t = useTranslations("language");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex rounded-(--radius-full) bg-field p-1"
    >
      {routing.locales.map((locale: Locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            onClick={() => router.replace(pathname, { locale })}
            className={`min-h-(--size-touch-target) min-w-(--size-touch-target) rounded-(--radius-full) px-4 text-sm font-semibold transition-colors duration-(--duration-fade) ${
              active ? "bg-surface text-ink shadow-(--shadow-small)" : "text-ink-secondary"
            }`}
          >
            {t(locale)}
          </button>
        );
      })}
    </div>
  );
}
