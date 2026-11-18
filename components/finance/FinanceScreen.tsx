"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { cx } from "@/lib/cx";
import { categorySpent, compact, monthSpent, POCKET_ICON, rupiah } from "@/lib/finance/calc";
import { financeStore, useFinance, type Transaction } from "@/lib/finance/store";
import { AddPocketSheet } from "./AddPocketSheet";
import { BudgetScreen } from "./BudgetScreen";
import { PocketDetail } from "./PocketDetail";
import { TransactionDetail } from "./TransactionDetail";
import { TransferSheet } from "./TransferSheet";
import { TxRow } from "./TxRow";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-3 shadow-(--shadow-card-soft)";
type Scenario = "default" | "empty" | "error" | "offline";
type Filter = "all" | "expense" | "income" | "transfer";

export function FinanceScreen() {
  const t = useTranslations("finance");
  const tcap = useTranslations("capture");
  const locale = useLocale();
  const params = useSearchParams();
  const scenario = (params.get("state") ?? "default") as Scenario;
  const { status, transactions, pockets, budget, unsynced } = useFinance();
  const [now, setNow] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [pocketId, setPocketId] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [transfer, setTransfer] = useState<{ from?: string; to?: string; amount?: number } | null>(null);
  const [undo, setUndo] = useState<{ label: string; run: () => void } | null>(null);

  useEffect(() => {
    setNow(new Date());
    financeStore.load(scenario);
  }, [scenario]);
  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(timer);
  }, [undo]);

  const catLabel = (id: string) => budget.categories.find((c) => c.id === id)?.name ?? tcap(`cat.${id}`);
  const ref = now ?? new Date(0);
  const spent = monthSpent(transactions, ref);
  const ratio = budget.monthly ? spent / budget.monthly : 0;
  const pocket = pockets.find((p) => p.id === pocketId) ?? null;
  const tx = transactions.find((x) => x.id === txId) ?? null;
  const monthName = new Intl.DateTimeFormat(locale, { month: "short" }).format(ref).toUpperCase().replace(".", "");
  const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  const list = transactions.filter((x) => filter === "all" || x.kind === filter);
  const groups = useMemo(() => {
    if (!now) return [] as { key: string; label: string; items: Transaction[] }[];
    const out: { key: string; label: string; items: Transaction[] }[] = [];
    for (const x of list) {
      const diff = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(x.at).setHours(0, 0, 0, 0)) / 86_400_000);
      const key = diff <= 0 ? "today" : diff === 1 ? "yesterday" : dayFmt.format(new Date(x.at));
      const label = key === "today" ? t("todayGroup") : key === "yesterday" ? t("yesterdayGroup") : key;
      const g = out.find((o) => o.key === key);
      if (g) g.items.push(x);
      else out.push({ key, label, items: [x] });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, now, locale]);
  const hhmm = (iso: string) => `${String(new Date(iso).getHours()).padStart(2, "0")}:${String(new Date(iso).getMinutes()).padStart(2, "0")}`;

  function deleteTx(x: Transaction) {
    const removed = financeStore.remove(x.id);
    setTxId(null);
    if (removed) setUndo({ label: t("deleted"), run: () => financeStore.restore(removed) });
  }

  const loading = status === "loading" || !now;
  const error = status === "error";
  const empty = status === "ready" && pockets.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-2 pb-36 md:pt-8 md:pb-10">
      <header className="flex items-center justify-between gap-2 py-2">
        <h1 className="t-large-title">{t("title")}</h1>
        <IconButton icon="search" label={t("search")} className="size-11 shrink-0" onClick={() => window.dispatchEvent(new Event("unio:search"))} />
      </header>

      {error ? (
        <section role="alert" className={cx(CARD, "flex flex-col items-center gap-2 pb-4 text-center")}>
          <span className="pt-4 text-destructive"><Icon name="warning" size="xlarge" /></span>
          <h2 className="t-title-3">{t("errorTitle")}</h2>
          <p className="t-subheadline text-ink-secondary">{t("errorBody")}</p>
          <Button icon="retry" onClick={() => financeStore.load(scenario)}>{tcap("retry")}</Button>
        </section>
      ) : loading ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          <Skeleton className="h-52 rounded-(--radius-card)" />
          <Skeleton className="h-64 rounded-(--radius-card)" />
          <Skeleton className="h-48 rounded-(--radius-card)" />
        </div>
      ) : empty ? (
        <section className={cx(CARD, "flex flex-col items-center gap-2 px-6 py-10 text-center")}>
          <span className="text-ink-secondary"><Icon name="pocket" size="xlarge" /></span>
          <h2 className="t-title-3">{t("emptyTitle")}</h2>
          <p className="t-subheadline text-ink-tertiary">{t("emptyBody")}</p>
          <Button icon="add" fullWidth={false} className="mt-3 px-6" onClick={() => setAddOpen(true)}>{t("addPocket")}</Button>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-(--radius-card) bg-card-dark px-5 py-5 text-on-card-dark shadow-(--shadow-card-elevated)">
            <div className="flex items-start justify-between gap-2">
              <p className="t-subheadline text-on-card-dark-secondary">{t("monthlyBudget")}</p>
              <span className="t-footnote-em rounded-(--radius-full) bg-on-card-dark px-3 py-1 text-card-dark">{monthName}</span>
            </div>
            <p className="t-large-title">{rupiah(budget.monthly)}</p>
            <p className="t-subheadline text-on-card-dark-secondary">{t("monthlyLimit")}</p>
            <div role="progressbar" aria-label={t("monthlyBudget")} aria-valuenow={Math.round(Math.min(ratio, 1) * 100)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-(--radius-full) bg-on-card-dark/20">
              <div className={cx("h-full rounded-(--radius-full)", ratio >= 0.8 ? "bg-warning" : "bg-on-card-dark")} style={{ width: `${Math.round(Math.min(ratio, 1) * 100)}%` }} />
            </div>
            <div className="flex justify-between">
              <div><p className="t-footnote text-on-card-dark-secondary">{t("used")}</p><p className="t-body-em">{rupiah(spent)}</p></div>
              <div className="text-right"><p className="t-footnote text-on-card-dark-secondary">{t("left")}</p><p className="t-body-em">{rupiah(Math.max(budget.monthly - spent, 0))}</p></div>
            </div>
            <Button variant="secondary" onClick={() => setBudgetOpen(true)}>{t("seeDetail")}</Button>
          </section>

          <section className={CARD}>
            <div className="flex min-h-11 items-center justify-between">
              <h2 className="t-headline">{t("pockets")}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-3">
              {pockets.map((p) => (
                <button key={p.id} type="button" onClick={() => setPocketId(p.id)} className="flex min-h-24 flex-col gap-1 rounded-(--radius-card-inner) bg-surface-inset p-3 text-left">
                  <span className="t-subheadline flex items-center gap-1.5 text-ink-secondary"><Icon name={POCKET_ICON[p.kind]} size="small" />{p.name}</span>
                  <span className="t-title-3">{compact(p.balance)}</span>
                  <span className={cx("t-caption-1", p.kind === "paylater" ? "text-destructive" : "text-ink-secondary")}>
                    {p.kind === "paylater" && p.dueDay ? t("due", { date: `${p.dueDay} ${new Intl.DateTimeFormat(locale, { month: "short" }).format(ref)}` }) : p.kind === "tabungan" ? t("saving") : t("balanceWord")}
                  </span>
                </button>
              ))}
            </div>
            <Button variant="secondary" icon="add" onClick={() => setAddOpen(true)}>{t("addPocket")}</Button>
            <div className="h-1" />
          </section>

          <section className={CARD}>
            <div className="flex min-h-11 items-center justify-between">
              <h2 className="t-headline">{t("budgetCategory")}</h2>
              <button type="button" onClick={() => setBudgetOpen(true)} className="t-subheadline flex min-h-11 items-center text-ink-secondary">{t("manage")}</button>
            </div>
            <div className="flex flex-col pb-2">
              {budget.categories.slice(0, 3).map((c) => {
                const s = categorySpent(transactions, c.id, ref);
                const r = c.limit ? s / c.limit : 0;
                return (
                  <div key={c.id} className="flex flex-col gap-1.5 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="t-subheadline-em">{c.emoji} {c.name}</span>
                      <span className={cx("t-footnote", r >= 1 ? "text-expense" : r >= 0.8 ? "text-warning" : "text-ink-secondary")}>{compact(s)} / {compact(c.limit)}</span>
                    </div>
                    <div role="progressbar" aria-label={c.name} aria-valuenow={Math.round(Math.min(r, 1) * 100)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-(--radius-full) bg-field">
                      <div className={cx("h-full rounded-(--radius-full)", r >= 1 ? "bg-expense" : r >= 0.8 ? "bg-warning" : "bg-accent")} style={{ width: `${Math.round(Math.min(r, 1) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={CARD}>
            <div className="flex min-h-11 items-center justify-between">
              <h2 className="t-headline">{t("transactions")}</h2>
            </div>
            <div className="flex gap-2 pb-2" role="group" aria-label={t("filter")}>
              {(["all", "expense", "income", "transfer"] as const).map((f) => (
                <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cx("t-footnote-em relative h-[30px] rounded-(--radius-m) px-3 before:absolute before:-inset-y-[7px] before:inset-x-0 before:content-['']", filter === f ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "bg-field text-ink")}>{t(`f.${f}`)}</button>
              ))}
            </div>
            {groups.length === 0 ? (
              <p className="t-subheadline py-8 text-center text-ink-secondary">{t("noTx")}</p>
            ) : (
              groups.map((g) => (
                <div key={g.key}>
                  <p className="t-footnote-em pt-2 text-ink-secondary">{g.label}</p>
                  {g.items.map((x, i) => (
                    <TxRow key={x.id} tx={x} categoryLabel={catLabel(x.category)} right={g.key === "today" || g.key === "yesterday" ? hhmm(x.at) : hhmm(x.at)} divider={i < g.items.length - 1} onOpen={() => setTxId(x.id)} />
                  ))}
                </div>
              ))
            )}
          </section>
        </>
      )}

      <PocketDetail
        pocket={pocket}
        txs={transactions}
        now={ref}
        categoryLabel={catLabel}
        onClose={() => setPocketId(null)}
        onOpenTx={setTxId}
        onTransfer={(from, to, amount) => setTransfer({ from, to, amount })}
      />
      <TransactionDetail tx={tx} categoryLabel={tx ? catLabel(tx.category) : ""} unsynced={unsynced} onClose={() => setTxId(null)} onDelete={deleteTx} />
      <BudgetScreen open={budgetOpen} onClose={() => setBudgetOpen(false)} monthly={budget.monthly} categories={budget.categories} txs={transactions} now={ref} />
      <AddPocketSheet open={addOpen} onClose={() => setAddOpen(false)} onAdded={() => undefined} />
      <TransferSheet
        open={transfer !== null}
        pockets={pockets}
        from={transfer?.from}
        to={transfer?.to}
        initialAmount={transfer?.amount}
        onClose={() => setTransfer(null)}
        onDone={(id) => setUndo({ label: t("transferred"), run: () => void financeStore.remove(id) })}
      />

      {(undo || (unsynced && !loading && !error)) && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-50 flex justify-center md:bottom-8">
          {undo ? (
            <Toast message={undo.label} actionLabel={t("undo")} onAction={() => { undo.run(); setUndo(null); }} className="pointer-events-auto" />
          ) : (
            <Toast type="notSynced" message={t("unsynced")} actionLabel={tcap("retry")} onAction={() => financeStore.retrySync()} className="pointer-events-auto" />
          )}
        </div>
      )}
    </div>
  );
}
