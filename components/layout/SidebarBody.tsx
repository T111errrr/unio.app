"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { SETTINGS_ITEM, SIDEBAR_ITEMS, isActive, type NavItem } from "./nav-items";

type Props = {
  /** `full` = Sidebar 248 px, `rail` = Sidebar Rail 72 px (hanya ikon). */
  variant: "full" | "rail";
  /** Rail: tombol buka drawer. Full (di dalam drawer): tombol tutup. */
  onToggle?: () => void;
  onCapture?: () => void;
  onSearch?: () => void;
  /** Dipanggil saat tautan dipilih (mis. menutup drawer). */
  onNavigate?: () => void;
};

const ROW = "relative flex items-center rounded-(--radius-l) transition-colors duration-(--duration-fade) min-h-11";

function NavLink({ item, variant, onNavigate }: { item: NavItem; variant: "full" | "rail"; onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const rail = variant === "rail";
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={rail ? t(item.label) : undefined}
      title={rail ? t(item.label) : undefined}
      className={cx(
        ROW,
        rail ? "w-full justify-center" : "gap-3 px-3",
        active ? "bg-card-dark text-on-card-dark" : "text-ink hover:bg-field",
      )}
    >
      <Icon name={item.icon} size="small" />
      {!rail && <span className="t-subheadline">{t(item.label)}</span>}
    </Link>
  );
}

/** Isi sidebar desktop. Dipakai tiga kali: Sidebar penuh (≥ 1280), Rail (768–1279), dan di dalam drawer. */
export function SidebarBody({ variant, onToggle, onCapture, onSearch, onNavigate }: Props) {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const rail = variant === "rail";

  return (
    <nav
      aria-label={t("main")}
      className={cx(
        "flex h-full flex-col gap-1 bg-surface pt-6 pb-5",
        rail ? "items-stretch px-3" : "px-4",
      )}
    >
      {/* Merek + tombol buka/tutup */}
      <div className={cx("flex items-center pb-4", rail ? "flex-col gap-1" : "gap-2.5 pl-2")}>
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center gap-1 rounded-(--radius-m) bg-accent"
        >
          <span className="h-2.5 w-1 rounded-(--radius-xs) bg-on-accent" />
          <span className="h-2.5 w-1 rounded-(--radius-xs) bg-on-accent" />
        </span>
        {!rail && <span className="t-headline flex-1">{tApp("name")}</span>}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={rail ? t("expandSidebar") : t("collapseSidebar")}
            className="relative flex size-7 items-center justify-center rounded-(--radius-m) text-ink-secondary hover:bg-field before:absolute before:-inset-2 before:content-['']"
          >
            <Icon name={rail ? "chevron-right" : "sidebar"} size="small" />
          </button>
        )}
      </div>

      {/* Cari */}
      <button
        type="button"
        onClick={onSearch}
        aria-label={rail ? t("search") : undefined}
        className={cx(ROW, "bg-field text-ink-tertiary", rail ? "justify-center" : "gap-2 px-3")}
      >
        <Icon name="search" size="small" />
        {!rail && (
          <>
            <span className="t-subheadline flex-1 text-left">{t("search")}</span>
            <kbd className="t-caption-1 rounded-(--radius-s) bg-surface px-1.5 font-sans">Ctrl K</kbd>
          </>
        )}
      </button>

      {/* Catat cepat */}
      <button
        type="button"
        onClick={onCapture}
        aria-label={rail ? t("quickCapture") : undefined}
        className={cx(ROW, "bg-card-dark text-on-card-dark", rail ? "justify-center" : "gap-2 px-3.5")}
      >
        <Icon name="add" size="small" />
        {!rail && (
          <>
            <span className="t-subheadline-em flex-1 text-left">{t("quickCapture")}</span>
            <kbd className="t-caption-1 font-sans text-on-card-dark-secondary">Ctrl N</kbd>
          </>
        )}
      </button>

      <div className="h-3" aria-hidden="true" />

      <ul className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink item={item} variant={variant} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div className="flex-1" />

      <NavLink item={SETTINGS_ITEM} variant={variant} onNavigate={onNavigate} />
      <div className={cx("flex items-center pt-1", rail ? "justify-center" : "gap-2.5 pl-2")}>
        <span
          aria-hidden="true"
          className="t-subheadline-em flex size-8 items-center justify-center rounded-(--radius-full) bg-field text-ink"
        >
          J
        </span>
      </div>
    </nav>
  );
}
