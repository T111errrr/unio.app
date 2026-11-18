"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cx } from "@/lib/cx";
import { IconButton } from "./IconButton";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
};

/**
 * Sheet: naik dari bawah di mobile (< 768 px), modal di tengah di desktop.
 * Memakai <dialog> bawaan: Esc dan klik di luar menutup.
 */
export function Sheet({ open, onClose, title, children }: Props) {
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
        "fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto bg-surface p-0 text-ink",
        "rounded-t-(--radius-card) rounded-b-none shadow-(--shadow-large) backdrop:bg-scrim",
        "md:inset-auto md:m-auto md:max-w-md md:rounded-(--radius-card)",
      )}
    >
      <div className="flex flex-col gap-4 px-4 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div aria-hidden="true" className="mx-auto h-[5px] w-9 rounded-(--radius-full) bg-ink-tertiary md:hidden" />
        <header className="flex items-center justify-between gap-2">
          <h2 id={titleId} className="t-headline">
            {title}
          </h2>
          <IconButton icon="close" label={t("close")} onClick={onClose} className="size-11 border-0 shadow-none" />
        </header>
        {children}
      </div>
    </dialog>
  );
}
