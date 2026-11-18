"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { ListRow } from "@/components/ui/ListRow";
import { compact, digitsToNumber, formatDigits, POCKET_ICON } from "@/lib/finance/calc";
import { financeStore, type Pocket } from "@/lib/finance/store";

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
  const byName = (n: string) => pockets.find((p) => p.name === n);
  /** Ketuk baris Dari/Ke: ganti ke kantong berikutnya (lewati kantong di baris lainnya). */
  function cycle(current: string, other: string, set: (v: string) => void) {
    const start = pockets.findIndex((p) => p.name === current);
    for (let step = 1; step <= pockets.length; step++) {
      const cand = pockets[(start + step) % pockets.length];
      if (cand && cand.name !== other) return set(cand.name);
    }
  }
  const rowValue = (n: string) => {
    const p = byName(n);
    return p ? `${p.name} · ${compact(p.balance)}` : "—";
  };

  return (
    <Sheet open={open} onClose={onClose} title={t("transferTitle")}>
      <div className="flex flex-col gap-4">
        {/* Figma Amount Input: Rp 22 + angka 48 tebal, keterangan serif di bawah. */}
        <label className="flex flex-col items-center gap-1 py-4 text-center">
          <span className="sr-only">{t("amount")}</span>
          <span className="flex items-baseline gap-1.5">
            <span className="t-title-2 text-ink-secondary">Rp</span>
            <input
              autoFocus
              inputMode="numeric"
              value={a}
              placeholder="0"
              onChange={(e) => setA(formatDigits(e.target.value))}
              style={{ width: `${Math.max(a.length, 1)}ch` }}
              className="min-w-[1ch] bg-transparent text-center text-[48px] leading-[56px] font-bold tracking-tight text-ink outline-none placeholder:text-ink-tertiary"
            />
          </span>
          {dst && <span className="t-accent-serif-sm text-ink-secondary">{t("toCaption", { name: dst })}</span>}
        </label>
        <div className="rounded-(--radius-card-inner) bg-surface-inset px-3 py-1">
          <ListRow
            leadingSurface
            leadingIcon={byName(src) ? POCKET_ICON[byName(src)!.kind] : "pocket"}
            title={t("from")}
            trailing="valueChevron"
            value={rowValue(src)}
            onClick={() => cycle(src, dst, setSrc)}
          />
          <ListRow
            leadingSurface
            leadingIcon={byName(dst) ? POCKET_ICON[byName(dst)!.kind] : "pocket"}
            title={t("to")}
            trailing="valueChevron"
            value={rowValue(dst)}
            showDivider={false}
            onClick={() => cycle(dst, src, setDst)}
          />
        </div>
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
