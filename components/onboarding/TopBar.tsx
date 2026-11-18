import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";

export type TopBarProps = {
  /** Tombol kiri: tutup (X) atau kembali (<). */
  leading: "close" | "back";
  leadingLabel: string;
  onLeading: () => void;
  /** Jumlah titik progres dan posisi aktif (mulai 0). */
  total: number;
  current: number;
};

/** Bilah atas onboarding. Slot kiri dan kanan tetap 44 px agar progres selalu di tengah. */
export function TopBar({ leading, leadingLabel, onLeading, total, current }: TopBarProps) {
  return (
    <div className="grid h-11 grid-cols-[44px_1fr_44px] items-center px-2.5">
      <button
        type="button"
        aria-label={leadingLabel}
        onClick={onLeading}
        className="flex size-11 items-center justify-center text-ink"
      >
        <Icon name={leading === "close" ? "close" : "chevron-left"} />
      </button>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        className="flex items-center justify-center gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx(
              "h-[3px] rounded-(--radius-xs) transition-all duration-(--duration-fade)",
              i <= current ? "bg-ink" : "bg-track",
              i === current ? "w-7" : "w-4",
            )}
          />
        ))}
      </div>
      <span aria-hidden="true" />
    </div>
  );
}
