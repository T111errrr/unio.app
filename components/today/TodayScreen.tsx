"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { TaskRow } from "@/components/tasks/TaskRow";
import { Link } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { useFinance } from "@/lib/finance/store";
import { useNotes } from "@/lib/notes/store";
import { dayDiff, isOverdue } from "@/lib/tasks/group";
import { tasksStore, useTasks } from "@/lib/tasks/store";
import { TASK_LISTS, type TaskListId } from "@/lib/tasks/types";
import { useTheme } from "@/lib/use-appearance";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-3 shadow-(--shadow-card-soft)";
const DAILY_BUDGET = 260_000;
type TodayTab = "todo" | "done" | "pending";
type Scenario = "default" | "empty" | "error" | "offline";

const hhmm = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const rupiah = (n: number) => new Intl.NumberFormat("id-ID").format(n);
/** 85.000 → "85 rb" (ringkas, mengikuti Figma) */
const short = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)} jt` : n >= 1000 ? `${Math.round(n / 1000)} rb` : String(n);

function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between">
      <h2 className="t-headline">{title}</h2>
      {action}
    </div>
  );
}

function Ring({ ratio, label }: { ratio: number; label: string }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const v = Math.min(Math.max(ratio, 0), 1);
  return (
    <svg viewBox="0 0 36 36" className="size-9 shrink-0 -rotate-90" role="img" aria-label={label}>
      <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" className="stroke-field" />
      <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${c * v} ${c}`} className={ratio > 1 ? "stroke-expense" : "stroke-accent"} />
    </svg>
  );
}

function MiniBars({ done, total }: { done: number; total: number }) {
  const n = Math.min(Math.max(total, 1), 7);
  const filled = total === 0 ? 0 : Math.round((done / total) * n);
  return (
    <div aria-hidden className="flex h-4 items-end gap-1">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={cx("w-1.5 rounded-(--radius-full)", i < filled ? "h-4 bg-accent" : "h-2 bg-field")} />
      ))}
    </div>
  );
}

function SeeAll({ href, label }: { href: "/tasks" | "/finance" | "/notes"; label: string }) {
  return (
    <Link href={href} className="t-subheadline flex min-h-11 items-center text-ink-secondary">
      {label}
    </Link>
  );
}

function EmptyBlock({ icon, title, body, action, href }: { icon: IconName; title: string; body: string; action: string; href: "/tasks" | "/finance" }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
      <span className="text-ink-secondary">
        <Icon name={icon} size="xlarge" />
      </span>
      <h3 className="t-title-3">{title}</h3>
      <p className="t-subheadline max-w-xs text-ink-tertiary">{body}</p>
      <Link
        href={href}
        className="t-body-em mt-2 inline-flex h-14 min-w-55 items-center justify-center gap-2 rounded-(--radius-control) bg-accent px-6 text-on-accent shadow-(--shadow-button-bevel)"
      >
        <Icon name="add" size="medium" />
        {action}
      </Link>
    </div>
  );
}

export function TodayScreen() {
  const t = useTranslations("today");
  const tt = useTranslations("tasks");
  const tcap = useTranslations("capture");
  const locale = useLocale();
  const params = useSearchParams();
  const scenario = (params.get("state") ?? "default") as Scenario;
  const { status, tasks, unsynced } = useTasks();
  const { transactions } = useFinance();
  const { notes } = useNotes();
  const [theme, setTheme] = useTheme();
  const [now, setNow] = useState<Date | null>(null);
  const [tab, setTab] = useState<TodayTab>("todo");
  const [collapsed, setCollapsed] = useState<Set<TaskListId>>(new Set());

  useEffect(() => {
    setNow(new Date());
    tasksStore.load(scenario);
  }, [scenario]);

  const empty = scenario === "empty";
  const ref = now ?? new Date(0);

  const todayTasks = useMemo(
    () => (now && !empty ? tasks.filter((x) => !x.deletedAt && x.due && (dayDiff(x.due, now) === 0 || isOverdue(x, now))) : []),
    [tasks, now, empty],
  );
  const inboxCount = tasks.filter((x) => !x.deletedAt && !x.done && !x.due).length;
  const doneCount = todayTasks.filter((x) => x.done).length;
  const todayTx = useMemo(
    () => (now && !empty ? transactions.filter((x) => dayDiff(x.at, now) === 0) : []),
    [transactions, now, empty],
  );
  const spent = todayTx.filter((x) => x.kind === "expense").reduce((s, x) => s + x.amount, 0);
  const lastNote = empty ? undefined : notes[0];

  const shown = todayTasks.filter((x) =>
    tab === "done" ? x.done : tab === "pending" ? !x.done && isOverdue(x, ref) : !x.done,
  );
  const byList = TASK_LISTS.map((id) => ({ id, items: shown.filter((x) => x.list === id) })).filter((g) => g.items.length > 0);

  const week = useMemo(() => {
    if (!now) return [];
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [now]);
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const dateLong = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });

  const loading = status === "loading" || !now;
  const error = status === "error";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-2 pb-36 md:pt-8 md:pb-10">
      <header className="flex items-start gap-2 py-2">
        <div className="min-w-0 flex-1">
          <p className="t-footnote tracking-wide text-ink-secondary uppercase">{now ? dateLong.format(now) : " "}</p>
          <h1 className="t-title-1">{t("greeting", { name: "Jeff" })}</h1>
          <p className="t-accent-serif-sm text-ink-secondary">{t("tagline")}</p>
        </div>
        <IconButton
          icon="nav-today"
          label={t("toggleTheme")}
          className="size-11 shrink-0"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </header>

      <div className={cx(CARD, "flex justify-between px-2")} role="group" aria-label={t("week")}>
        {week.map((d) => {
          const isToday = now ? dayDiff(d.toISOString(), now) === 0 : false;
          const has = tasks.some((x) => !x.deletedAt && !x.done && x.due && dayDiff(x.due, d) === 0);
          return (
            <div
              key={d.toISOString()}
              className={cx("flex min-h-14 w-11 flex-col items-center justify-center gap-0.5 rounded-(--radius-card-inner)", isToday && "bg-field")}
            >
              <span className="t-caption-1 text-ink-secondary">{weekdayShort.format(d)}</span>
              <span className="t-headline">{d.getDate()}</span>
              <span aria-hidden className={cx("size-1 rounded-(--radius-full)", has && !empty ? "bg-ink-secondary" : "bg-transparent")} />
            </div>
          );
        })}
      </div>

      {error ? (
        <section role="alert" className={cx(CARD, "flex flex-col items-center gap-2 pb-4 text-center")}>
          <h2 className="t-headline min-h-11 self-start leading-11">{t("sectionToday")}</h2>
          <span className="text-destructive">
            <Icon name="warning" size="xlarge" />
          </span>
          <h3 className="t-title-3">{t("errorTitle")}</h3>
          <p className="t-subheadline text-ink-secondary">{t("errorBody")}</p>
          <Button icon="retry" onClick={() => tasksStore.load(scenario)}>
            {tcap("retry")}
          </Button>
        </section>
      ) : loading ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          <Skeleton className="h-40 rounded-(--radius-card)" />
          <Skeleton className="h-72 rounded-(--radius-card)" />
          <Skeleton className="h-56 rounded-(--radius-card)" />
        </div>
      ) : (
        <>
          <section className={CARD}>
            <CardHeader title={t("summary")} />
            <div className="grid grid-cols-2 gap-3 pt-1 pb-1">
              <div className="flex flex-col gap-1 rounded-(--radius-card-inner) bg-surface-inset p-3">
                <span className="t-subheadline flex items-center gap-1.5 text-ink-secondary">
                  <Icon name="nav-finance" size="small" />
                  {t("expenseShort")}
                </span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="t-title-3">Rp{short(spent)}</span>
                  <Ring ratio={spent / DAILY_BUDGET} label={t("budgetUsed", { percent: Math.round((spent / DAILY_BUDGET) * 100) })} />
                </div>
                <span className="t-caption-1 text-ink-secondary">{t("ofBudget", { amount: short(DAILY_BUDGET) })}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-(--radius-card-inner) bg-surface-inset p-3">
                <span className="t-subheadline flex items-center gap-1.5 text-ink-secondary">
                  <Icon name="nav-tasks" size="small" />
                  {t("tasksShort")}
                </span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="t-title-3">{`${doneCount}/${todayTasks.length}`}</span>
                  <MiniBars done={doneCount} total={todayTasks.length} />
                </div>
                <span className="t-caption-1 text-ink-secondary">{todayTasks.length === 0 ? t("noTasksYet") : t("doneLabel")}</span>
              </div>
            </div>
          </section>

          {!empty && inboxCount > 0 && (
            <Link href="/inbox" className={cx(CARD, "flex min-h-14 items-center gap-3")}>
              <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field">
                <Icon name="nav-inbox" size="small" />
              </span>
              <span className="t-body flex-1">{t("inbox")}</span>
              <span className="t-subheadline text-ink-secondary">{t("inboxCount", { count: inboxCount })}</span>
              <span className="text-ink-tertiary">
                <Icon name="chevron-right" size="small" />
              </span>
            </Link>
          )}

          <section className={CARD}>
            <CardHeader title={t("tasksToday")} action={<SeeAll href="/tasks" label={t("seeAll")} />} />
            {todayTasks.length === 0 ? (
              <EmptyBlock icon="nav-tasks" title={t("emptyTasksTitle")} body={tt("emptyBody")} action={tt("addTask")} href="/tasks" />
            ) : (
              <>
                <SegmentedControl
                  label={t("tasksToday")}
                  value={tab}
                  onChange={setTab}
                  options={[
                    { value: "todo", label: t("tabTodo"), icon: "checkbox-off" },
                    { value: "done", label: t("tabDone"), icon: "check" },
                    { value: "pending", label: t("tabPending"), icon: "clock" },
                  ]}
                />
                {byList.map((g) => {
                  const open = !collapsed.has(g.id);
                  return (
                    <div key={g.id}>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() =>
                          setCollapsed((c) => {
                            const n = new Set(c);
                            if (open) n.add(g.id);
                            else n.delete(g.id);
                            return n;
                          })
                        }
                        className="flex min-h-11 w-full items-center gap-2 py-2"
                      >
                        <Icon name={open ? "chevron-down" : "chevron-right"} size="small" />
                        <span className="t-headline flex-1 text-left">{tt(`lists.${g.id}`)}</span>
                        <span className="t-footnote rounded-(--radius-full) bg-field px-2 py-0.5 text-ink-secondary">{g.items.length}</span>
                      </button>
                      {open &&
                        g.items.map((task, i) => (
                          <TaskRow
                            key={task.id}
                            title={task.title}
                            subtitle={`${task.due && !task.allDay ? hhmm(task.due) + " · " : ""}${tt(`lists.${task.list}`)}`}
                            done={task.done}
                            overdue={isOverdue(task, ref)}
                            priority={task.priority}
                            showDivider={i < g.items.length - 1}
                            toggleLabel={task.done ? tt("markOpen") : tt("markDone")}
                            priorityLabel={tt("priority")}
                            onToggle={() => tasksStore.toggle(task.id)}
                          />
                        ))}
                    </div>
                  );
                })}
                {byList.length === 0 && <p className="t-subheadline py-6 text-center text-ink-secondary">{t("nothingHere")}</p>}
              </>
            )}
          </section>

          <section className={CARD}>
            <CardHeader
              title={t("txToday")}
              action={
                unsynced ? (
                  <Badge type="notSynced">{t("oneUnsynced")}</Badge>
                ) : todayTx.length > 0 ? (
                  <SeeAll href="/finance" label={t("seeAll")} />
                ) : undefined
              }
            />
            {todayTx.length === 0 ? (
              <EmptyBlock icon="nav-finance" title={t("emptyTxTitle")} body={t("emptyTxBody")} action={t("addTx")} href="/finance" />
            ) : (
              todayTx.map((x, i) => (
                <div key={x.id} className="relative flex items-center gap-3 py-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-(--radius-card-inner) bg-field">
                    <Icon name={x.kind === "income" ? "income" : "expense"} size="small" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="t-body truncate">{x.note}</p>
                    <p className="t-footnote truncate text-ink-secondary">
                      {tcap(`cat.${x.category}`)} · {x.pocket}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cx("t-body-em", x.kind === "income" && "text-income")}>
                      {x.kind === "income" ? "+" : "−"}Rp{rupiah(x.amount)}
                    </p>
                    <p className="t-footnote text-ink-secondary">{hhmm(x.at)}</p>
                  </div>
                  {i < todayTx.length - 1 && <span aria-hidden className="absolute right-0 bottom-0 left-14 h-px bg-divider" />}
                </div>
              ))
            )}
          </section>

          {lastNote && (
            <section className={CARD}>
              <CardHeader title={t("lastNote")} action={<SeeAll href="/notes" label={t("seeAll")} />} />
              <Link href="/notes" className="flex flex-col gap-1 rounded-(--radius-card-inner) bg-surface-inset p-4">
                <span className="flex items-center justify-between gap-2">
                  <span className="t-body-em">{lastNote.title}</span>
                  {lastNote.pinned && <Icon name="pin" size="small" filled />}
                </span>
                <span className="t-subheadline line-clamp-3 text-ink-secondary">{lastNote.body}</span>
                <span className="t-caption-1 text-ink-tertiary">
                  {new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(lastNote.at))} · {lastNote.tag}
                </span>
              </Link>
            </section>
          )}
        </>
      )}

      {unsynced && !error && !loading && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-30 flex justify-center md:bottom-8">
          <Toast type="notSynced" message={tt("unsynced")} actionLabel={tcap("retry")} onAction={() => tasksStore.retrySync()} className="pointer-events-auto" />
        </div>
      )}
      {error && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-30 flex justify-center md:bottom-8">
          <Toast type="error" message={t("toastFailed")} actionLabel={tcap("retry")} onAction={() => tasksStore.load(scenario)} className="pointer-events-auto" />
        </div>
      )}
    </div>
  );
}
