"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cx } from "@/lib/cx";
import { Button } from "./Button";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Figma: Type = Confirm / Destructive */
  type?: "confirm" | "destructive";
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

/** Dialog di tengah layar. Memakai <dialog> bawaan: Esc menutup, fokus terkunci, klik di luar menutup. */
export function Dialog({ open, onClose, type = "confirm", title, message, confirmLabel, cancelLabel, onConfirm }: Props) {
  const t = useTranslations("common");
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby={titleId}
      className={cx(
        "m-auto w-75 max-w-[calc(100%-2rem)] rounded-(--radius-card) bg-surface p-0 text-ink",
        "shadow-(--shadow-large) backdrop:bg-scrim",
      )}
    >
      <div className="flex flex-col gap-2 px-5 pt-6 pb-4">
        <h2 id={titleId} className="t-headline">
          {title}
        </h2>
        {message && <p className="t-subheadline text-ink-secondary">{message}</p>}
        <div className="h-2" />
        <Button tone={type === "destructive" ? "destructive" : "default"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {cancelLabel ?? t("cancel")}
        </Button>
      </div>
    </dialog>
  );
}
