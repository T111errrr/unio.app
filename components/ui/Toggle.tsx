"use client";

import { cx } from "@/lib/cx";

type Props = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Nama pengaturan untuk pembaca layar. */
  label: string;
  className?: string;
};

/** Figma: Toggle 51×31 (On / Off / Disabled). Area tekan diperluas ke ≥ 44 px. */
export function Toggle({ checked, onCheckedChange, disabled, label, className }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cx(
        "relative inline-block h-[31px] w-[51px] shrink-0 rounded-(--radius-full) transition-colors duration-(--duration-fade)",
        "before:absolute before:-inset-x-1 before:-inset-y-2 before:content-['']",
        checked ? "bg-accent" : "bg-field",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "absolute top-0.5 left-0 size-[27px] rounded-(--radius-full) bg-white shadow-(--shadow-small)",
          "transition-transform duration-(--duration-fade) ease-(--ease-ios)",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
