import { cx } from "@/lib/cx";

type Status = "normal" | "warning" | "over";

type Props = {
  label: string;
  /** Teks nilai di kanan, mis. "Rp420 rb / 1 jt" (format oleh pemanggil). */
  valueText: string;
  /** Perbandingan terpakai / batas; 1 = penuh, > 1 = melebihi. */
  ratio: number;
  /** Bila kosong: < 0,8 normal; 0,8–1 warning; > 1 over. */
  status?: Status;
  className?: string;
};

const FILL: Record<Status, string> = { normal: "bg-accent", warning: "bg-warning", over: "bg-expense" };

export function ProgressBar({ label, valueText, ratio, status, className }: Props) {
  const resolved: Status = status ?? (ratio > 1 ? "over" : ratio >= 0.8 ? "warning" : "normal");
  const percent = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="t-subheadline-em text-ink">{label}</span>
        <span className="t-footnote text-ink-secondary">{valueText}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={valueText}
        className="h-1.5 overflow-hidden rounded-(--radius-full) bg-track"
      >
        <div className={cx("h-full rounded-(--radius-full)", FILL[resolved])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
