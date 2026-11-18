"use client";

import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";

type Props = {
  title: string;
  subtitle?: string;
  done?: boolean;
  overdue?: boolean;
  priority?: boolean;
  showDivider?: boolean;
  toggleLabel: string;
  priorityLabel: string;
  onToggle: () => void;
  onOpen?: () => void;
};

/** Figma: Task Row (12:261) — Status Open / Done / Overdue. */
export function TaskRow({ title, subtitle, done, overdue, priority, showDivider = true, toggleLabel, priorityLabel, onToggle, onOpen }: Props) {
  return (
    <div className="relative flex items-center gap-3 px-1 py-[11px]">
      <button
        type="button"
        role="checkbox"
        aria-checked={!!done}
        aria-label={toggleLabel}
        onClick={onToggle}
        className="-ml-2.5 -my-2 flex size-11 shrink-0 items-center justify-center text-ink-secondary"
      >
        <Icon name={done ? "checkbox-on" : "checkbox-off"} size="large" className={done ? "text-ink" : undefined} />
      </button>
      <button type="button" onClick={onOpen} className="-my-2 flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 text-left">
        <span className={cx("t-body w-full truncate", done ? "text-ink-tertiary line-through" : "text-ink")}>{title}</span>
        {subtitle && !done && (
          <span className={cx("t-footnote w-full truncate", overdue ? "text-destructive" : "text-ink-secondary")}>{subtitle}</span>
        )}
      </button>
      {priority && !done && (
        <span className="text-ink">
          <Icon name="priority" size="small" filled label={priorityLabel} />
        </span>
      )}
      {showDivider && <span aria-hidden className="absolute right-1 bottom-0 left-12 h-px bg-divider" />}
    </div>
  );
}
