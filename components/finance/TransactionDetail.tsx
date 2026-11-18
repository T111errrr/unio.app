"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { rupiah } from "@/lib/finance/calc";
import { financeStore, type Transaction } from "@/lib/finance/store";
import { TextField } from "@/components/ui/TextField";
import { AmountField } from "./AmountField";
import { FullScreen } from "./FullScreen";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-4 shadow-(--shadow-card-soft)";
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

type Props = { tx: Transaction | null; categoryLabel: string; unsynced: boolean; onClose: () => void; onDelete: (tx: Transaction) => void };

/** Detail transaksi (Figma 44:2518): ringkasan, catatan, sumber, sinkronisasi, Hapus + Edit. */
export function TransactionDetail({ tx, categoryLabel, unsynced, onClose, onDelete }: Props) {
  const t = useTranslations("finance");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [last, setLast] = useState<Transaction | null>(null);
  useEffect(() => {
    if (tx) setLast(tx);
  }, [tx]);
  const shown = tx ?? last;
  const d = shown ? new Date(shown.at) : null;
  const sign = shown?.kind === "income" ? "+" : shown?.kind === "expense" ? "−" : "";

  return (
    <>
      <FullScreen open={!!tx} onClose={onClose} title={t("txDetail")}>
        {shown && d && (
          <>
            <section className={`${CARD} flex flex-col items-center gap-2 text-center`}>
              <span className="flex size-12 items-center justify-center rounded-(--radius-card-inner) bg-field">
                <Icon name={shown.kind === "income" ? "income" : shown.kind === "expense" ? "expense" : "transfer"} />
              </span>
              <p className="t-body-em">{shown.note}</p>
              <p className="t-large-title">{sign}{rupiah(shown.amount)}</p>
              <span className="t-footnote-em rounded-(--radius-full) border border-border bg-field px-3 py-1">{categoryLabel}</span>
              <dl className="mt-2 grid w-full grid-cols-3 divide-x divide-divider rounded-(--radius-card-inner) bg-surface-inset py-3">
                {[
                  [t("pocket"), shown.kind === "transfer" ? `${shown.pocket} → ${shown.toPocket}` : shown.pocket],
                  [t("date"), new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d)],
                  [t("time"), hhmm(d)],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col items-center gap-0.5 px-1">
                    <dt className="t-footnote text-ink-secondary">{k}</dt>
                    <dd className="t-subheadline-em">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
            {shown.memo && (
              <section className={CARD}>
                <p className="t-footnote-em text-ink-secondary">{t("memo")}</p>
                <p className="t-body mt-1">{shown.memo}</p>
              </section>
            )}
            <section className={CARD}>
              {[
                ["mic", t("source"), shown.source ?? "Manual"],
                ["not-synced", t("sync"), unsynced ? t("notSynced") : t("synced")],
              ].map(([icon, k, v], i) => (
                <div key={k} className="relative flex min-h-14 items-center gap-3 py-2">
                  <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field"><Icon name={icon as "mic"} size="small" /></span>
                  <span className="t-body flex-1">{k}</span>
                  <span className="t-subheadline text-ink-secondary">{v}</span>
                  {i === 0 && <span aria-hidden className="absolute right-0 bottom-0 left-12 h-px bg-divider" />}
                </div>
              ))}
            </section>
            <div className="mt-auto grid grid-cols-2 gap-3">
              <Button variant="secondary" tone="destructive" icon="delete" onClick={() => onDelete(shown)}>{t("delete")}</Button>
              <Button
                icon="edit"
                onClick={() => {
                  setNote(shown.note);
                  setAmount(new Intl.NumberFormat("id-ID").format(shown.amount));
                  setEditing(true);
                }}
              >
                {t("edit")}
              </Button>
            </div>
          </>
        )}
      </FullScreen>
      <Sheet open={editing} onClose={() => setEditing(false)} title={t("editTx")}>
        <div className="flex flex-col gap-4">
          <TextField label={t("noteLabel")} value={note} onChange={(e) => setNote(e.target.value)} />
          <AmountField label={t("amount")} value={amount} onChange={setAmount} />
          <Button
            disabled={!note.trim() || !Number(amount.replace(/\D/g, ""))}
            onClick={() => {
              if (!shown) return;
              financeStore.update(shown.id, { note: note.trim(), amount: Number(amount.replace(/\D/g, "")) });
              setEditing(false);
            }}
          >
            {t("save")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
