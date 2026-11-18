"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/components/ui/IconButton";

type Props = { open: boolean; onClose: () => void; title: string; right?: ReactNode; children: ReactNode };

/** Layar penuh di mobile (judul di tengah, slot kiri/kanan 44 px); modal di tengah di desktop. */
export function FullScreen({ open, onClose, title, right, children }: Props) {
  const tc = useTranslations("common");
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={title}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-background p-0 text-ink md:m-auto md:h-[88dvh] md:max-w-xl md:rounded-(--radius-card)"
    >
      <div className="flex h-full flex-col">
        <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
          <IconButton icon="chevron-left" label={tc("back")} onClick={onClose} className="size-11" />
          <h2 className="t-headline truncate text-center">{title}</h2>
          <div className="flex size-11 items-center justify-center">{right}</div>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </dialog>
  );
}
