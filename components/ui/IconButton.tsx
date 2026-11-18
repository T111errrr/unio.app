import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> & {
  icon: IconName;
  /** Wajib: nama tombol untuk pembaca layar (tombol ikon tidak punya teks). */
  label: string;
  variant?: "secondary" | "primary";
};

export function IconButton({ icon, label, variant = "secondary", className, type = "button", ...rest }: IconButtonProps) {
  // Ukuran bawaan 56 px (size-14). Bila pemanggil memberi size-*, ukuran bawaan dilepas
  // (dua kelas size-* sekaligus bergantung urutan CSS dan sering kalah).
  const custom = className?.match(/\bsize-(\d+)\b/);
  const small = custom ? Number(custom[1]) < 11 : false;
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center rounded-(--radius-control)",
        !custom && "size-14",
        // Tampilan kecil (36 px) tetap punya area tekan 44 px.
        small && "before:absolute before:-inset-1 before:content-['']",
        "transition-opacity duration-(--duration-fade) active:opacity-85 disabled:pointer-events-none",
        variant === "primary"
          ? "bg-accent text-on-accent shadow-(--shadow-button-bevel) disabled:bg-disabled disabled:text-on-disabled"
          : "border border-border bg-surface text-ink shadow-(--shadow-surface-floating) disabled:text-ink-tertiary",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
