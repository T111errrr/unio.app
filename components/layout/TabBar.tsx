"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { TAB_ITEMS, isActive } from "./nav-items";

type Props = { onCapture?: () => void };

/** Tab bar melayang untuk mobile (< 768 px): pil 5 tab + tombol tangkap. Tab aktif menampilkan label. */
export function TabBar({ onCapture }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("main")}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <ul className="pointer-events-auto flex items-center rounded-(--radius-xl) border border-border bg-surface p-1 shadow-(--shadow-surface-floating)">
        {TAB_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={active ? undefined : t(item.label)}
                className={cx(
                  "relative flex h-13 items-center justify-center gap-1.5 rounded-(--radius-xl)",
                  "transition-colors duration-(--duration-fade)",
                  "before:absolute before:inset-y-0 before:-inset-x-0.5 before:content-['']",
                  active ? "bg-field pr-3.5 pl-3 text-ink" : "w-10 text-ink-secondary",
                )}
              >
                <Icon name={item.icon} filled={active} />
                {active && <span className="t-subheadline-em">{t(item.label)}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onCapture}
        aria-label={t("quickCapture")}
        className="pointer-events-auto relative flex size-15 shrink-0 items-center justify-center rounded-(--radius-full) border border-border bg-surface text-ink shadow-(--shadow-surface-floating) active:opacity-85"
      >
        <Icon name="add" size="large" />
      </button>
    </nav>
  );
}
