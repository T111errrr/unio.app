"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { compact, nextDue, pocketMonth, pocketTxs, rupiah } from "@/lib/finance/calc";
import type { Pocket, Transaction } from "@/lib/finance/store";
import { FullScreen } from "./FullScreen";
import { TxRow } from "./TxRow";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-4 shadow-(--shadow-card-soft)";

type Props = {
  pocket: Pocket | null;
  txs: Transaction[];
  now: Date;
  categoryLabel: (id: string) => string;
  onClose: () => void;
  onOpenTx: (id: string) => void;
  onTransfer: (from?: string, to?: string, amount?: number) => void;
};

export function PocketDetail({ pocket, txs, now, categoryLabel, onClose, onOpenTx, onTransfer }: Props) {
  const t = useTranslations("finance");
  const locale = useLocale();
  const [last, setLast] = useState<Pocket | null>(null);
  useEffect(() => {
    if (pocket) setLast(pocket);
  }, [pocket]);
  const p = pocket ?? last;
  const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const fullFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  function when(tx: Transaction) {
    const diff = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(tx.at).setHours(0, 0, 0, 0)) / 86_400_000);
    return diff === 0 ? t("today") : diff === 1 ? t("yesterday") : dayFmt.format(new Date(tx.at));
  }

  return (
    <FullScreen open={!!pocket} onClose={onClose} title={p?.name ?? ""}>
      {p && p.kind === "paylater" ? <Paylater /> : p ? <Regular /> : null}
    </FullScreen>
  );

  function Regular() {
    if (!p) return null;
    const m = pocketMonth(txs, p.name, now);
    const list = pocketTxs(txs, p);
    return (
      <>
        <section className={`${CARD} flex flex-col gap-3`}>
          <p className="t-subheadline text-ink-secondary">{t("balanceNowShort")}</p>
          <p className="t-large-title">{rupiah(p.balance)}</p>
          <svg aria-hidden viewBox="0 0 300 60" className="h-16 w-full" preserveAspectRatio="none">
            <path d="M0 48 C40 52 70 20 120 36 C170 52 200 22 250 14 C270 10 285 8 300 6" fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-ink" />
          </svg>
          <dl className="grid grid-cols-3 divide-x divide-divider rounded-(--radius-card-inner) bg-surface-inset py-3 text-center">
            {[[t("in"), m.masuk], [t("out"), m.keluar], [t("transferWord"), m.transfer]].map(([k, v]) => (
              <div key={k as string} className="flex flex-col gap-0.5 px-1">
                <dt className="t-footnote text-ink-secondary">{k}</dt>
                <dd className="t-subheadline-em">{compact(v as number)}</dd>
              </div>
            ))}
          </dl>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" icon="transfer" onClick={() => onTransfer(p.name)}>{t("transfer")}</Button>
            <Button icon="add" onClick={() => window.dispatchEvent(new Event("unio:capture"))}>{t("record")}</Button>
          </div>
        </section>
        <section className={CARD}>
          <div className="flex min-h-11 items-center justify-between">
            <h3 className="t-headline">{t("history")}</h3>
            <span className="t-subheadline text-ink-secondary">{new Intl.DateTimeFormat(locale, { month: "long" }).format(now)}</span>
          </div>
          {list.length === 0 ? (
            <p className="t-subheadline py-6 text-center text-ink-secondary">{t("noHistory")}</p>
          ) : (
            list.map((tx, i) => <TxRow key={tx.id} tx={tx} categoryLabel={categoryLabel(tx.category)} right={when(tx)} divider={i < list.length - 1} onOpen={() => onOpenTx(tx.id)} />)
          )}
        </section>
      </>
    );
  }

  function Paylater() {
    if (!p) return null;
    const limit = p.limit ?? 0;
    const due = p.dueDay ? nextDue(p.dueDay, now) : null;
    const ratio = limit ? Math.min(p.balance / limit, 1) : 0;
    const bill = p.installment ?? 0;
    const list = txs.filter((x) => x.pocket === p.name && x.kind === "expense");
    const schedule = due && bill ? [0, 1, 2].map((i) => new Date(due.getFullYear(), due.getMonth() + i, due.getDate())) : [];
    return (
      <>
        <section className="flex flex-col gap-3 rounded-(--radius-card) bg-card-dark px-5 py-5 text-on-card-dark shadow-(--shadow-card-elevated)">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="t-subheadline text-on-card-dark-secondary">{t("debtTotal")}</p>
              <p className="t-large-title">{rupiah(p.balance)}</p>
              <p className="t-subheadline text-on-card-dark-secondary">{t("ofLimit", { amount: rupiah(limit) })}</p>
            </div>
            {due && <Badge type="danger" icon="calendar">{dayFmt.format(due)}</Badge>}
          </div>
          <div role="progressbar" aria-label={t("debtTotal")} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-(--radius-full) bg-on-card-dark/20">
            <div className="h-full rounded-(--radius-full) bg-on-card-dark" style={{ width: `${Math.round(ratio * 100)}%` }} />
          </div>
          <div className="flex justify-between">
            <div><p className="t-footnote text-on-card-dark-secondary">{t("nextBill")}</p><p className="t-body-em">{rupiah(bill)}</p></div>
            <div className="text-right"><p className="t-footnote text-on-card-dark-secondary">{t("limitLeft")}</p><p className="t-body-em">{rupiah(Math.max(limit - p.balance, 0))}</p></div>
          </div>
          <Button variant="secondary" onClick={() => onTransfer(undefined, p.name, bill || undefined)}>{t("recordPayment")}</Button>
        </section>
        {schedule.length > 0 && (
          <section className={CARD}>
            <h3 className="t-headline min-h-11 leading-11">{t("billSchedule")}</h3>
            {schedule.map((d, i) => (
              <div key={d.toISOString()} className="relative flex min-h-14 items-center gap-3 py-2">
                <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field"><Icon name="calendar" size="small" /></span>
                <span className="t-body flex-1">{fullFmt.format(d)}</span>
                <span className="t-subheadline text-ink-secondary">{rupiah(bill)}</span>
                {i < schedule.length - 1 && <span aria-hidden className="absolute right-0 bottom-0 left-12 h-px bg-divider" />}
              </div>
            ))}
          </section>
        )}
        <section className={CARD}>
          <div className="flex min-h-11 items-center justify-between">
            <h3 className="t-headline">{t("usage")}</h3>
          </div>
          {list.length === 0 ? (
            <p className="t-subheadline py-6 text-center text-ink-secondary">{t("noHistory")}</p>
          ) : (
            list.map((tx, i) => <TxRow key={tx.id} tx={tx} categoryLabel={categoryLabel(tx.category)} right={when(tx)} divider={i < list.length - 1} onOpen={() => onOpenTx(tx.id)} />)
          )}
        </section>
      </>
    );
  }
}
