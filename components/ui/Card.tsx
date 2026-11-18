import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type Props = {
  /** Figma: Style = Light / Dark */
  style?: "light" | "dark";
  title?: string;
  /** Tindakan di kanan judul (mis. "Lihat semua"). */
  action?: ReactNode;
  /** Bungkus isi dalam kotak dalam (Surface Inset). */
  inset?: boolean;
  children?: ReactNode;
  className?: string;
};

export function Card({ style = "light", title, action, inset = false, children, className }: Props) {
  const dark = style === "dark";
  return (
    <section
      className={cx(
        "flex flex-col gap-4 rounded-(--radius-card) p-5",
        dark
          ? "bg-card-dark text-on-card-dark shadow-(--shadow-card-elevated)"
          : "border border-border bg-surface text-ink shadow-(--shadow-card-soft)",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3">
          {title && <h2 className="t-subheadline-em">{title}</h2>}
          {action}
        </header>
      )}
      {inset ? (
        <div
          className={cx(
            "rounded-(--radius-l) border p-4",
            dark ? "border-track-dark bg-track-dark" : "border-border bg-surface-inset",
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
