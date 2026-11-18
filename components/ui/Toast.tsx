import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

type Props = {
  /** Figma: Type = Saved / Not synced / Error */
  type?: "saved" | "notSynced" | "error";
  message: string;
  /** Tombol tindakan di kanan, mis. "Undo" atau "Coba lagi". */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const ICONS: Record<NonNullable<Props["type"]>, { name: IconName; filled?: boolean; color: string }> = {
  saved: { name: "checkbox-on", filled: true, color: "text-ink" },
  notSynced: { name: "not-synced", color: "text-ink" },
  error: { name: "warning", color: "text-destructive" },
};

/** Posisi (melayang di atas tab bar, dll.) diatur oleh pemanggil. Hilang otomatis oleh pemanggil. */
export function Toast({ type = "saved", message, actionLabel, onAction, className }: Props) {
  const icon = ICONS[type];
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cx(
        "motion-toast inline-flex items-center gap-2.5 rounded-(--radius-full) border border-border bg-surface py-2 pr-2 pl-4",
        "text-ink shadow-(--shadow-surface-floating)",
        className,
      )}
    >
      <span className={icon.color}>
        <Icon name={icon.name} filled={icon.filled} />
      </span>
      <span className="t-subheadline-em">{message}</span>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="t-subheadline-em relative rounded-(--radius-full) bg-field px-3 py-1.5 before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
