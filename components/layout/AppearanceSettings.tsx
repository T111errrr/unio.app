"use client";

import { useTranslations } from "next-intl";
import { ListRow } from "@/components/ui/ListRow";
import { cx } from "@/lib/cx";
import { useReduceMotion, useTheme } from "@/lib/use-appearance";
import type { Theme } from "@/lib/theme";

const THEMES: Theme[] = ["system", "light", "dark"];

/** Pratinjau kecil: strip sidebar + tiga batang, memakai token tema yang dipilih (bukan tema aktif). */
function Preview({ theme }: { theme: "light" | "dark" }) {
  return (
    <div data-theme={theme} className="flex h-full flex-1 gap-2 bg-background p-2">
      <div className="w-5 rounded-(--radius-m) bg-surface" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-5 rounded-(--radius-m) bg-surface" />
        <div className="h-5 rounded-(--radius-m) bg-surface" />
        <div className="h-5 rounded-(--radius-m) bg-surface" />
      </div>
    </div>
  );
}

function ThemeCard({ value, selected, onSelect }: { value: Theme; selected: boolean; onSelect: () => void }) {
  const t = useTranslations("theme");
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        "flex flex-1 flex-col gap-3 rounded-(--radius-card) bg-surface p-3 text-left shadow-(--shadow-card-soft)",
        "border-2 transition-colors duration-(--duration-fade)",
        selected ? "border-accent" : "border-transparent",
      )}
    >
      <span className="flex h-35 overflow-hidden rounded-(--radius-card-inner) border border-border">
        {value === "system" ? (
          <>
            <Preview theme="light" />
            <Preview theme="dark" />
          </>
        ) : (
          <Preview theme={value} />
        )}
      </span>
      <span className="flex items-center gap-2 px-1">
        <span
          aria-hidden="true"
          className={cx(
            "size-4.5 rounded-(--radius-full) border-2",
            selected ? "border-accent bg-accent shadow-[inset_0_0_0_3px_var(--unio-surface)]" : "border-border",
          )}
        />
        <span className="t-subheadline-em">{t(value)}</span>
      </span>
    </button>
  );
}

export function AppearanceSettings() {
  const t = useTranslations("theme");
  const [theme, setTheme] = useTheme();
  const [reduceMotion, setReduceMotion] = useReduceMotion();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-6 pb-35 md:px-8 md:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="t-title-1">{t("title")}</h1>
        <p className="t-subheadline hidden text-ink-secondary md:block">{t("subtitle")}</p>
      </header>

      {/* Mobile: daftar pilihan dengan centang */}
      <section aria-label={t("title")} className="flex flex-col gap-2 md:hidden">
        <div role="radiogroup" className="rounded-(--radius-card) bg-surface px-4 shadow-(--shadow-card-soft)">
          {THEMES.map((value, index) => (
            <ListRow
              key={value}
              title={t(value)}
              trailing="check"
              checked={theme === value}
              showDivider={index < THEMES.length - 1}
              onClick={() => setTheme(value)}
            />
          ))}
        </div>
        <p className="t-footnote px-2 text-ink-secondary">{t("hint")}</p>
      </section>

      {/* Desktop: tiga kartu pratinjau */}
      <div role="radiogroup" aria-label={t("title")} className="hidden gap-4 md:flex">
        {THEMES.map((value) => (
          <ThemeCard key={value} value={value} selected={theme === value} onSelect={() => setTheme(value)} />
        ))}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="t-footnote-em px-2 text-ink-secondary">{t("other")}</h2>
        <div className="rounded-(--radius-card) bg-surface px-4 shadow-(--shadow-card-soft)">
          <ListRow
            title={t("reduceMotion")}
            trailing="toggle"
            checked={reduceMotion}
            onCheckedChange={setReduceMotion}
            showDivider={false}
          />
        </div>
      </section>
    </div>
  );
}
