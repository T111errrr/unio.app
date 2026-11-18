import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

export type BadgeType = "neutral" | "info" | "success" | "warning" | "danger" | "paylater" | "transfer" | "notSynced";

/** Warna per tipe (Figma: Badge). Latar 10 %, garis 28 % dari warna teks. */
const COLORS: Record<BadgeType, string> = {
  neutral: "var(--unio-text-secondary)",
  info: "var(--unio-info)",
  success: "var(--unio-income)",
  warning: "var(--unio-warning)",
  danger: "var(--unio-expense)",
  paylater: "var(--unio-paylater)",
  transfer: "var(--unio-transfer)",
  notSynced: "var(--unio-text-secondary)",
};

const DEFAULT_ICONS: Partial<Record<BadgeType, IconName>> = {
  warning: "warning",
  notSynced: "not-synced",
};

type Props = {
  children: ReactNode;
  type?: BadgeType;
  /** Ikon di kiri; tipe Warning dan Not synced punya ikon bawaan. Isi `false` untuk menyembunyikan. */
  icon?: IconName | false;
  className?: string;
};

export function Badge({ children, type = "neutral", icon, className }: Props) {
  const iconName = icon === false ? undefined : (icon ?? DEFAULT_ICONS[type]);
  return (
    <span
      style={{ "--badge": COLORS[type] } as CSSProperties}
      className={cx(
        "t-subheadline-em inline-flex items-center gap-1.5 rounded-(--radius-full) border py-1.5 pr-3 text-(--badge)",
        "border-[color:color-mix(in_srgb,var(--badge)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--badge)_10%,transparent)]",
        iconName ? "pl-2.5" : "pl-3",
        className,
      )}
    >
      {iconName && <Icon name={iconName} size="small" />}
      {children}
    </span>
  );
}
