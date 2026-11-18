"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cx } from "@/lib/cx";
import { IconButton } from "./IconButton";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Tombol di kanan header (maks. 36 px, area tekan 44 px). Kosong = slot tetap 44 px. */
  action?: ReactNode;
  children?: ReactNode;
};

/**
 * Sheet: naik dari bawah di mobile (< 768 px), modal di tengah di desktop.
 * Memakai <dialog> bawaan: Esc dan klik di luar menutup.
 */
export function Sheet({ open, onClose, title, action, children }: Props) {
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
        "motion-sheet fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto bg-surface p-0 text-ink",
        "rounded-t-(--radius-card) rounded-b-none shadow-(--shadow-large)",
        "md:inset-0 md:m-auto md:h-fit md:max-w-md md:rounded-(--radius-card)",
      )}
    >
      <div className="flex flex-col gap-4 px-4 pt-2 pb-[max(2.125rem,env(safe-area-inset-bottom))]">
        <div aria-hidden="true" className="mx-auto h-[5px] w-9 rounded-(--radius-full) bg-ink-tertiary md:hidden" />
        {/* Figma: tombol tutup di kiri (36 px, area tekan 44), judul di tengah, slot kanan 44 px. */}
        <header className="grid grid-cols-[44px_1fr_44px] items-center">
          <IconButton icon="close" label={t("close")} onClick={onClose} className="size-9 justify-self-start" />
          <h2 id={titleId} className="t-headline text-center">
            {title}
          </h2>
          <span className="flex justify-end">{action}</span>
        </header>
        {children}
      </div>
    </dialog>
  );
}
