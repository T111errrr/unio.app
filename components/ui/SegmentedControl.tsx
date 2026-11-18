"use client";

import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

export type SegmentOption<T extends string> = { value: T; label: string; icon?: IconName };

type Props<T extends string> = {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Nama kelompok untuk pembaca layar. */
  label: string;
  className?: string;
};

/** Figma: Segmented Control (2 atau 3 segmen). */
export function SegmentedControl<T extends string>({ options, value, onChange, label, className }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={cx("flex gap-1 rounded-3xl bg-field p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              "t-footnote-em relative flex h-10 flex-1 items-center justify-center gap-1 rounded-(--radius-card-inner) px-2",
              // perluas area tekan ke 48 px (tinggi kontainer) tanpa mengubah tampilan
              "before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
              "transition-colors duration-(--duration-fade)",
              selected ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "text-ink-secondary",
            )}
          >
            {option.icon && <Icon name={option.icon} size="small" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
