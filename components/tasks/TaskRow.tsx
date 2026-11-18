"use client";

import { useRef, useState, type PointerEvent } from "react";
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
  /** Bila diisi, baris bisa digeser ke kiri untuk menampilkan aksi Selesai + Hapus (Figma 38:1791). */
  swipe?: { doneLabel: string; deleteLabel: string; onDone: () => void; onDelete: () => void };
};

const ACTION_W = 68;
const OPEN_X = ACTION_W * 2 + 8;

/** Figma: Task Row (12:261) — Status Open / Done / Overdue. */
export function TaskRow({ title, subtitle, done, overdue, priority, showDivider = true, toggleLabel, priorityLabel, onToggle, onOpen, swipe }: Props) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ px: number; py: number; x0: number } | null>(null);
  const moved = useRef(false);

  const handlers = swipe
    ? {
        onPointerDown: (e: PointerEvent) => {
          if (e.pointerType === "mouse") return;
          start.current = { px: e.clientX, py: e.clientY, x0: x };
          moved.current = false;
        },
        onPointerMove: (e: PointerEvent) => {
          const s0 = start.current;
          if (!s0) return;
          const dx = e.clientX - s0.px;
          if (!dragging && Math.abs(dx) < 8) return;
          if (!dragging && Math.abs(e.clientY - s0.py) > Math.abs(dx)) { start.current = null; return; }
          moved.current = true;
          setDragging(true);
          setX(Math.max(-OPEN_X - 24, Math.min(0, s0.x0 + dx)));
        },
        onPointerUp: () => {
          if (!start.current) return;
          start.current = null;
          setDragging(false);
          setX((cur) => (cur < -OPEN_X / 2 ? -OPEN_X : 0));
        },
        onPointerCancel: () => { start.current = null; setDragging(false); setX(0); },
      }
    : {};

  const row = (
    <div className={cx("relative flex items-center gap-3 px-1 py-[11px]", swipe && "bg-surface")}
      style={swipe ? { transform: `translateX(${x}px)`, touchAction: "pan-y", transition: dragging ? "none" : "transform var(--duration-fade) var(--ease-ios)" } : undefined}
      {...handlers}
    >
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
      <button type="button" onClick={() => { if (moved.current) return; if (x !== 0) return setX(0); onOpen?.(); }} className="-my-2 flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 text-left">
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

  if (!swipe) return row;
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden={x === 0} className="absolute inset-y-1 right-0 flex gap-2" style={{ width: OPEN_X - 8 }}>
        <button type="button" tabIndex={x === 0 ? -1 : 0} onClick={() => { setX(0); swipe.onDone(); }} className="t-caption-1 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-(--radius-card-inner) bg-accent text-on-accent">
          <Icon name="check" size="medium" />
          {swipe.doneLabel}
        </button>
        <button type="button" tabIndex={x === 0 ? -1 : 0} onClick={() => { setX(0); swipe.onDelete(); }} className="t-caption-1 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-(--radius-card-inner) bg-destructive text-white">
          <Icon name="delete" size="medium" />
          {swipe.deleteLabel}
        </button>
      </div>
      {row}
    </div>
  );
}
