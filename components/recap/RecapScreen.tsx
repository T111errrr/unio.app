"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { cx } from "@/lib/cx";
import { compact, rupiah } from "@/lib/finance/calc";
import { financeStore, useFinance } from "@/lib/finance/store";
import { buildRecap, rangeOf, shift, type Period } from "@/lib/recap/calc";
import { tasksStore, useTasks } from "@/lib/tasks/store";
import { ExportSheet } from "./ExportSheet";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-3 shadow-(--shadow-card-soft)";
type Scenario = "default" | "empty" | "error" | "offline";
const SLICE = ["stroke-accent", "stroke-ink-secondary", "stroke-ink-tertiary", "stroke-field"] as const;
const DOT = ["bg-accent", "bg-ink-secondary", "bg-ink-tertiary", "bg-field"] as const;

function Donut({ parts, label, centerTop, centerBottom }: { parts: number[]; label: string; centerTop: string; centerBottom: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={label}>
        {parts.map((p, i) => {
          const len = p * c;
          const el = <circle key={i} cx="50" cy="50" r={r} fill="none" strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} className={SLICE[i]} />;
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="t-headline">{centerTop}</span>
        <span className="t-caption-1 text-ink-secondary">{centerBottom}</span>
      </div>
    </div>
  );
}

export function RecapScreen() {
  const t = useTranslations("recap");
  const tcap = useTranslations("capture");
  const locale = useLocale();
  const params = useSearchParams();
  const scenario = (params.get("state") ?? "default") as Scenario;
  const { status, transactions, budget } = useFinance();
  const { tasks } = useTasks();
  const [now, setNow] = useState<Date | null>(null);
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const n = new Date();
    setNow(n);
    setAnchor(n);
    financeStore.load(scenario);
    tasksStore.load(scenario);
  }, [scenario]);

  const wk = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const data = useMemo(() => (anchor ? buildRecap(period, anchor, transactions, tasks, (d) => wk.format(d)) : null), [anchor, period, transactions, tasks, wk]);
  const range = anchor ? rangeOf(period, anchor) : null;

  const label = useMemo(() => {
    if (!range) return "";
    const f = (o: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat(locale, o).format(d);
    if (period === "day") return f({ weekday: "long", day: "numeric", month: "long" }, range.start);
    if (period === "month") return f({ month: "long", year: "numeric" }, range.start);
    return `${range.start.getDate()} – ${f({ day: "numeric", month: "short", year: "numeric" }, range.end)}`;
  }, [range, period, locale]);

  const loading = status === "loading" || !data;
  const error = status === "error";
  const enough = !!data && (period === "day" ? true : data.activeDays >= 3);
  const isFuture = !!anchor && !!now && rangeOf(period, shift(period, anchor, 1)).start > now;

  const monthDays = now ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : 30;
  const budgetForPeriod = Math.round((budget.monthly / monthDays) * (data?.totalDays ?? 1));
  const top = data?.categories[0];
  const total = data?.spent ?? 0;
  const catName = (id: string) => budget.categories.find((c) => c.id === id)?.name ?? tcap(`cat.${id}`);
  const parts = data ? data.categories.slice(0, 3).map((c) => c.value / (total || 1)) : [];
  const rest = 1 - parts.reduce((s, v) => s + v, 0);
  const maxBar = Math.max(1, ...(data?.bars.map((b) => b.value) ?? [0]));
  const hiIdx = data ? data.bars.findIndex((b) => b.value === maxBar && b.value > 0) : -1;

  const summary = data
    ? t(period === "day" ? "siriDay" : "siriPeriod", {
        spent: compact(data.spent),
        category: top ? catName(top.id) : "-",
        percent: top && total ? Math.round((top.value / total) * 100) : 0,
        done: data.tasksDone,
        total: data.tasksTotal,
      })
    : "";

  function speak() {
    try {
      if (typeof speechSynthesis === "undefined") return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(summary);
      u.lang = locale === "en" ? "en-US" : "id-ID";
      speechSynthesis.speak(u);
    } catch {}
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-2 pb-36 md:pt-8 md:pb-10">
      <header className="flex items-center justify-between gap-2 py-2">
        <h1 className="t-large-title">{t("title")}</h1>
        <IconButton icon="export" label={t("exportTitle")} className="size-11 shrink-0" onClick={() => setExportOpen(true)} />
      </header>

      <SegmentedControl
        label={t("period")}
        value={period}
        onChange={(v) => {
          setPeriod(v);
          setAnchor(now);
        }}
        options={[
          { value: "day", label: t("day") },
          { value: "week", label: t("week") },
          { value: "month", label: t("month") },
        ]}
      />

      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <IconButton icon="chevron-left" label={t("prev")} className="size-11" onClick={() => anchor && setAnchor(shift(period, anchor, -1))} />
        <p className="t-headline text-center">{label}</p>
        <IconButton icon="chevron-right" label={t("next")} className="size-11" disabled={isFuture} onClick={() => anchor && setAnchor(shift(period, anchor, 1))} />
      </div>

      {error ? (
        <section role="alert" className={cx(CARD, "flex flex-col items-center gap-2 pb-4 text-center")}>
          <span className="pt-4 text-destructive"><Icon name="warning" size="xlarge" /></span>
          <h2 className="t-title-3">{t("errorTitle")}</h2>
          <p className="t-subheadline text-ink-secondary">{t("errorBody")}</p>
          <Button icon="retry" onClick={() => { financeStore.load(scenario); tasksStore.load(scenario); }}>{tcap("retry")}</Button>
        </section>
      ) : loading || !data ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          <Skeleton className="h-44 rounded-(--radius-card)" />
          <Skeleton className="h-64 rounded-(--radius-card)" />
          <Skeleton className="h-40 rounded-(--radius-card)" />
        </div>
      ) : !enough ? (
        <section className={cx(CARD, "flex flex-col items-center gap-2 px-6 py-10 text-center")}>
          <span className="text-ink-secondary"><Icon name="nav-recap" size="xlarge" /></span>
          <h2 className="t-title-3">{t("notEnoughTitle")}</h2>
          <p className="t-subheadline text-ink-tertiary">{t("notEnoughBody")}</p>
          <Button icon="add" fullWidth={false} className="mt-3 px-6" onClick={() => window.dispatchEvent(new Event("unio:capture"))}>{t("recordNow")}</Button>
        </section>
      ) : (
        <>
          <section className={CARD}>
            <div className="grid grid-cols-2 gap-3 py-1">
              {period !== "day" && (
                <Stat icon="income" title={t("income")} value={compact(data.income)} sub={t(period === "week" ? "thisWeek" : "thisMonth")} />
              )}
              <Stat icon="expense" title={t("spending")} value={compact(data.spent)} sub={t("ofBudget", { amount: compact(budgetForPeriod) })} />
              <Stat icon="nav-tasks" title={t("tasksDone")} value={`${data.tasksDone}/${data.tasksTotal}`} sub={t("percentDone", { percent: data.tasksTotal ? Math.round((data.tasksDone / data.tasksTotal) * 100) : 0 })} />
              {period !== "day" && <Stat icon="calendar" title={t("activeDays")} value={`${data.activeDays}/${data.totalDays}`} sub={t("daysLogged")} />}
            </div>
          </section>

          {period !== "day" && data.spent > 0 && (
            <>
              <section className={CARD}>
                <p className="t-subheadline pt-1 text-ink-secondary">{t(period === "week" ? "spendWeek" : "spendMonth")}</p>
                <p className="t-title-1">{rupiah(data.spent)}</p>
                <div className="flex h-36 items-end gap-2 pt-4" role="img" aria-label={t("barsLabel")}>
                  {data.bars.map((b, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <div className={cx("w-full rounded-(--radius-m)", i === hiIdx ? "bg-accent" : "bg-field")} style={{ height: `${Math.max(Math.round((b.value / maxBar) * 100), 3)}%` }} />
                      <span className="t-caption-1 text-ink-secondary">{b.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={cx(CARD, "pb-4")}>
                <p className="t-subheadline pt-1 pb-3 text-ink-secondary">{t("categoryShare")}</p>
                <div className="flex items-center gap-5">
                  <Donut
                    parts={[...parts, rest > 0.001 ? rest : 0]}
                    label={t("categoryShare")}
                    centerTop={`${top ? Math.round((top.value / (total || 1)) * 100) : 0}%`}
                    centerBottom={top ? catName(top.id) : "-"}
                  />
                  <ul className="flex flex-1 flex-col gap-2">
                    {data.categories.slice(0, 3).map((c, i) => (
                      <li key={c.id} className="flex items-center gap-2">
                        <span aria-hidden className={cx("size-3 rounded-(--radius-m)", DOT[i])} />
                        <span className="t-subheadline flex-1">{catName(c.id)}</span>
                        <span className="t-subheadline text-ink-secondary">{Math.round((c.value / (total || 1)) * 100)}%</span>
                      </li>
                    ))}
                    {rest > 0.001 && (
                      <li className="flex items-center gap-2">
                        <span aria-hidden className={cx("size-3 rounded-(--radius-m)", DOT[3])} />
                        <span className="t-subheadline flex-1">{t("other")}</span>
                        <span className="t-subheadline text-ink-secondary">{Math.round(rest * 100)}%</span>
                      </li>
                    )}
                  </ul>
                </div>
              </section>
            </>
          )}

          {period === "day" && (
            <section className={CARD}>
              <h2 className="t-headline min-h-11 leading-11">{t("spendByCategory")}</h2>
              {data.categories.length === 0 ? (
                <p className="t-subheadline py-6 text-center text-ink-secondary">{t("noSpending")}</p>
              ) : (
                data.categories.map((c, i) => (
                  <div key={c.id} className="relative flex min-h-14 items-center gap-3 py-2">
                    <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field"><Icon name="expense" size="small" /></span>
                    <span className="t-body flex-1">{catName(c.id)}</span>
                    <span className="t-subheadline text-ink-secondary">{rupiah(c.value)}</span>
                    {i < data.categories.length - 1 && <span aria-hidden className="absolute right-0 bottom-0 left-12 h-px bg-divider" />}
                  </div>
                ))
              )}
            </section>
          )}

          <section className={CARD}>
            <div className="flex min-h-11 items-center justify-between">
              <h2 className="t-headline flex items-center gap-2"><Icon name="mic" size="small" />{t("siriTitle")}</h2>
              <IconButton icon="mic" label={t("play")} className="size-11" onClick={speak} />
            </div>
            <p className="t-accent-serif-sm pt-1 pb-2 text-ink-secondary">&ldquo;{summary}&rdquo;</p>
          </section>
        </>
      )}

      {now && <ExportSheet open={exportOpen} onClose={() => setExportOpen(false)} txs={transactions} tasks={tasks} now={now} />}
    </div>
  );
}

function Stat({ icon, title, value, sub }: { icon: "income" | "expense" | "nav-tasks" | "calendar"; title: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-(--radius-card-inner) bg-surface-inset p-3">
      <span className="t-subheadline flex items-center gap-1.5 text-ink-secondary"><Icon name={icon} size="small" />{title}</span>
      <span className="t-title-3 mt-1">{value}</span>
      <span className="t-caption-1 text-ink-secondary">{sub}</span>
    </div>
  );
}
