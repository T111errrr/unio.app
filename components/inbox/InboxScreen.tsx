"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { financeStore } from "@/lib/finance/store";
import { inboxStore, useInbox, type InboxItem } from "@/lib/inbox/store";
import { tasksStore } from "@/lib/tasks/store";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-3 shadow-(--shadow-card-soft)";
const POCKETS = ["Cash", "Bank Jago", "Superbank"];
const CATEGORIES = ["food", "coffee", "transport", "shopping"] as const;
type Filter = "all" | "expense" | "task";
type Scenario = "default" | "empty" | "error" | "offline";

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export function InboxScreen() {
  const t = useTranslations("inbox");
  const tcap = useTranslations("capture");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const scenario = (params.get("state") ?? "default") as Scenario;
  const { status, items, unsynced } = useInbox();
  const [filter, setFilter] = useState<Filter>("all");
  const [fixId, setFixId] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ item: InboxItem; label: string; revert?: () => void } | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    inboxStore.load(scenario);
  }, [scenario]);
  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(timer);
  }, [undo]);

  const counts = { all: items.length, expense: items.filter((i) => i.kind === "expense").length, task: items.filter((i) => i.kind === "task").length };
  const shown = items.filter((i) => filter === "all" || i.kind === filter);
  const fixing = items.find((i) => i.id === fixId) ?? null;
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }), [locale]);

  function when(i: InboxItem) {
    const d = new Date(i.at);
    if (!now) return "";
    const diff = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
    return diff === 0 ? hhmm(d) : diff === 1 ? t("yesterday") : dateFmt.format(d);
  }

  function remove(i: InboxItem) {
    const taken = inboxStore.take(i.id);
    if (taken) setUndo({ item: taken, label: t("deleted") });
  }
  function saveTask(i: InboxItem) {
    const taken = inboxStore.take(i.id);
    if (!taken) return;
    const id = tasksStore.add({ title: i.title ?? i.raw, list: "pribadi", due: i.dateHint ?? null, allDay: false, priority: false });
    setUndo({ item: taken, label: t("taskSaved"), revert: () => tasksStore.discard(id) });
  }
  function complete(i: InboxItem, pocket: string, category: string) {
    const taken = inboxStore.take(i.id);
    if (!taken) return;
    const id = financeStore.add({ kind: "expense", amount: i.amount ?? 0, category, note: i.raw.replace(/^(rp)?\s*[\d.,]+\s*(rb|ribu|k|jt|juta)?\s*/i, "") || i.raw, pocket });
    setUndo({ item: taken, label: t("completed"), revert: () => financeStore.remove(id) });
    setFixId(null);
  }

  const loading = status === "loading";
  const error = status === "error";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-35 md:pt-8 md:pb-10">
      <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 py-2 md:hidden">
        <IconButton icon="chevron-left" label={tc("back")} className="size-11" onClick={() => router.back()} />
        <h1 className="t-headline text-center">{t("title")}</h1>
        <span aria-hidden className="size-11" />
      </header>
      <h1 className="t-large-title hidden md:block">{t("title")}</h1>

      {error ? (
        <section role="alert" className={cx(CARD, "flex flex-col items-center gap-2 pb-4 text-center")}>
          <span className="pt-4 text-destructive"><Icon name="warning" size="xlarge" /></span>
          <h2 className="t-title-3">{t("errorTitle")}</h2>
          <p className="t-subheadline text-ink-secondary">{t("errorBody")}</p>
          <Button icon="retry" onClick={() => inboxStore.load(scenario)}>{tcap("retry")}</Button>
        </section>
      ) : loading ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          <Skeleton className="h-6 w-2/3 rounded-(--radius-m)" />
          <Skeleton className="h-44 rounded-(--radius-card)" />
          <Skeleton className="h-44 rounded-(--radius-card)" />
        </div>
      ) : items.length === 0 ? (
        <section className={cx(CARD, "flex flex-col items-center gap-2 px-6 py-10 text-center")}>
          <span className="text-ink-secondary"><Icon name="nav-inbox" size="xlarge" /></span>
          <h2 className="t-title-3">{t("emptyTitle")}</h2>
          <p className="t-subheadline text-ink-tertiary">{t("emptyBody")}</p>
        </section>
      ) : (
        <>
          <p className="t-accent-serif-sm text-ink-secondary">{t("intro", { count: items.length })}</p>
          <div className="flex gap-2" role="group" aria-label={t("filter")}>
            {(["all", "expense", "task"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cx(
                  "t-footnote-em relative h-[30px] rounded-(--radius-m) px-3 before:absolute before:-inset-y-[7px] before:inset-x-0 before:content-['']",
                  filter === f ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "bg-field text-ink",
                )}
              >
                {t(`f.${f}`)} · {counts[f]}
              </button>
            ))}
          </div>
          {shown.map((i) => (
            <section key={i.id} className={cx(CARD, "flex flex-col gap-2.5 py-4")}>
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field">
                  <Icon name={i.kind === "task" ? "nav-tasks" : "nav-finance"} size="small" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="t-headline truncate">{i.raw}</p>
                  <p className="t-footnote text-ink-secondary">{i.source} · {when(i)}</p>
                </div>
              </div>
              <div>
                <Badge type={i.issue === "date" ? "info" : "warning"}>
                  {i.issue === "date" && i.dateHint ? t("dateRead", { date: dateFmt.format(new Date(i.dateHint)) }) : t(`issue.${i.issue}`)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button variant="secondary" onClick={() => remove(i)}>{t("delete")}</Button>
                {i.kind === "task" ? (
                  <Button onClick={() => saveTask(i)}>{t("saveTask")}</Button>
                ) : (
                  <Button onClick={() => setFixId(i.id)}>{t("complete")}</Button>
                )}
              </div>
            </section>
          ))}
        </>
      )}

      <CompleteSheet item={fixing} onClose={() => setFixId(null)} onSave={complete} />

      {(undo || (unsynced && !loading && !error)) && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-30 flex justify-center md:bottom-8">
          {undo ? (
            <Toast
              message={undo.label}
              actionLabel={t("undo")}
              onAction={() => {
                undo.revert?.();
                inboxStore.put(undo.item);
                setUndo(null);
              }}
              className="pointer-events-auto"
            />
          ) : (
            <Toast type="notSynced" message={t("unsynced")} actionLabel={tcap("retry")} onAction={() => inboxStore.retrySync()} className="pointer-events-auto" />
          )}
        </div>
      )}
    </div>
  );
}

function CompleteSheet({ item, onClose, onSave }: { item: InboxItem | null; onClose: () => void; onSave: (i: InboxItem, pocket: string, category: string) => void }) {
  const t = useTranslations("inbox");
  const tcap = useTranslations("capture");
  const [pocket, setPocket] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    setPocket(null);
    setCategory(item?.category ?? null);
  }, [item]);

  const ready = !!pocket && !!category;
  const chip = (on: boolean) =>
    cx("t-footnote-em relative h-9 rounded-(--radius-m) px-4 before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']", on ? "bg-accent text-on-accent" : "bg-field text-ink");

  return (
    <Sheet open={!!item} onClose={onClose} title={t("complete")}>
      {item && (
        <div className="flex flex-col gap-4">
          <p className="t-body-em">{item.raw}</p>
          <div className="flex flex-col gap-2">
            <p className="t-subheadline text-ink-secondary">{t("pickPocket")}</p>
            <div className="flex flex-wrap gap-2">
              {POCKETS.map((p) => (
                <button key={p} type="button" aria-pressed={pocket === p} onClick={() => setPocket(p)} className={chip(pocket === p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="t-subheadline text-ink-secondary">{t("pickCategory")}</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={chip(category === c)}>{tcap(`cat.${c}`)}</button>
              ))}
            </div>
          </div>
          <Button disabled={!ready} onClick={() => ready && onSave(item, pocket, category)}>{t("saveExpense")}</Button>
        </div>
      )}
    </Sheet>
  );
}
