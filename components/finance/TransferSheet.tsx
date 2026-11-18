"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { cx } from "@/lib/cx";
import { compact, digitsToNumber } from "@/lib/finance/calc";
import { financeStore, type Pocket } from "@/lib/finance/store";
import { AmountField } from "./AmountField";

type Props = { open: boolean; pockets: Pocket[]; from?: string; to?: string; initialAmount?: number; onClose: () => void; onDone: (id: string) => void };

/** Transfer antar kantong (Figma 46:2656). Tidak dihitung sebagai pengeluaran/pemasukan. */
export function TransferSheet({ open, pockets, from, to, initialAmount, onClose, onDone }: Props) {
  const t = useTranslations("finance");
  const [a, setA] = useState("");
  const [src, setSrc] = useState("");
  const [dst, setDst] = useState("");
  useEffect(() => {
    if (!open) return;
    setA(initialAmount ? new Intl.NumberFormat("id-ID").format(initialAmount) : "");
    setSrc(from ?? pockets.find((p) => p.kind !== "paylater")?.name ?? "");
    setDst(to ?? pockets.find((p) => p.name !== (from ?? ""))?.name ?? "");
  }, [open, from, to, initialAmount, pockets]);

  const amount = digitsToNumber(a);
  const ok = amount > 0 && !!src && !!dst && src !== dst;
  const chips = (value: string, set: (v: string) => void, label: string) => (
    <div className="flex flex-col gap-2">
      <p className="t-subheadline text-ink-secondary">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {pockets.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={value === p.name}
            onClick={() => set(p.name)}
            className={cx("t-footnote-em relative min-h-9 rounded-(--radius-m) px-3 before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']", value === p.name ? "bg-accent text-on-accent" : "bg-field text-ink")}
          >
            {p.name} · {compact(p.balance)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} title={t("transferTitle")}>
      <div className="flex flex-col gap-4">
        <AmountField label={t("amount")} value={a} onChange={setA} />
        {chips(src, setSrc, t("from"))}
        {chips(dst, setDst, t("to"))}
        {src && dst && src === dst && <p role="alert" className="t-footnote text-destructive">{t("samePocket")}</p>}
        <p className="t-footnote text-ink-secondary">{t("transferNote")}</p>
        <Button
          disabled={!ok}
          onClick={() => {
            const id = financeStore.transfer(src, dst, amount);
            onDone(id);
            onClose();
          }}
        >
          {t("transfer")}
        </Button>
      </div>
    </Sheet>
  );
}
