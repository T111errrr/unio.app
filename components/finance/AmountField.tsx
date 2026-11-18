"use client";

import { useId } from "react";
import { cx } from "@/lib/cx";
import { formatDigits } from "@/lib/finance/calc";

type Props = { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string };

/** Kolom nominal rupiah: hanya angka, tampil "1.250.000" (Figma: Rp + angka). */
export function AmountField({ label, value, onChange, placeholder = "0", className }: Props) {
  const id = useId();
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="t-subheadline text-ink-secondary">{label}</label>
      <div className="flex h-14 items-center gap-2 rounded-(--radius-control) border-[1.5px] border-transparent bg-field px-5 focus-within:border-accent focus-within:bg-surface">
        <span className="t-body text-ink-secondary">Rp</span>
        <input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatDigits(e.target.value))}
          placeholder={placeholder}
          className="t-body min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-tertiary"
        />
      </div>
    </div>
  );
}
