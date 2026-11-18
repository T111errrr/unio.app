import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Figma: Style = Primary / Secondary / Ghost */
  variant?: "primary" | "secondary" | "ghost";
  /** `destructive` hanya untuk Primary (dialog hapus). */
  tone?: "default" | "destructive";
  icon?: IconName;
  /** Lebar penuh seperti di Figma (326 px di mobile). */
  fullWidth?: boolean;
  children: ReactNode;
};

const VARIANTS = {
  primary:
    "bg-accent text-on-accent shadow-(--shadow-button-bevel) disabled:bg-disabled disabled:text-on-disabled",
  secondary:
    "border border-border bg-surface text-ink shadow-(--shadow-surface-floating) disabled:text-ink-tertiary",
  ghost: "text-ink disabled:text-ink-tertiary",
} as const;

const BASE =
  "t-body-em inline-flex h-14 items-center justify-center gap-2 rounded-(--radius-control) px-6 transition-opacity duration-(--duration-fade) active:opacity-85";

/** Tautan yang tampil seperti Button (untuk navigasi; tombol di dalam <a> tidak valid). */
export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: "/welcome" | "/login" | "/signup" | "/forgot-password" | "/today";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cx(BASE, VARIANTS[variant], "w-full", className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  tone = "default",
  icon,
  fullWidth = true,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "t-body-em inline-flex h-14 items-center justify-center gap-2 rounded-(--radius-control) px-6",
        "transition-opacity duration-(--duration-fade) active:opacity-85 disabled:pointer-events-none",
        VARIANTS[variant],
        variant === "primary" && tone === "destructive" && "bg-destructive",
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
