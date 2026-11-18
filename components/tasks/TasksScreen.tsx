"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { cx } from "@/lib/cx";
import { filterTasks, GROUP_ORDER, groupKeyOf, isOverdue, dayDiff, type TaskGroupKey } from "@/lib/tasks/group";
import { tasksStore, useTasks } from "@/lib/tasks/store";
import { TASK_LISTS, type Task, type TaskListId, type TasksView } from "@/lib/tasks/types";
import { Dialog } from "@/components/ui/Dialog";
import { Toast } from "@/components/ui/Toast";
import { Sheet } from "@/components/ui/Sheet";
import { useMediaQuery } from "@/lib/use-media-query";
import { TaskDetail } from "./TaskDetail";
import { TaskRow } from "./TaskRow";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-3 shadow-(--shadow-card-soft)";

export function TasksScreen() {
  const t = useTranslations("tasks");
  const tc = useTranslations("common");
  const locale = useLocale();
  const params = useSearchParams();
  const scenario = (params.get("state") ?? "default") as "default" | "empty" | "error" | "offline";
  const { status, tasks, unsynced } = useTasks();
  const [list, setList] = useState<TaskListId | "all">("all");
  const [view, setView] = useState<TasksView>("upcoming");
  const [now, setNow] = useState<Date | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [undoId, setUndoId] = useState<string | null>(null);
  const wide = useMediaQuery("(min-width: 1024px)");
  const openTask = tasks.find((x) => x.id === openId && !x.deletedAt) ?? null;

  useEffect(() => {
    setNow(new Date());
    tasksStore.load(scenario);
  }, [scenario]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }), [locale]);
  const timeFmt = useMemo(() => ({ format: (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` }), []);

  const visible = useMemo(() => (now ? filterTasks(tasks, list, view, now) : []), [tasks, list, view, now]);
  const upcomingCount = useMemo(() => (now ? filterTasks(tasks, "all", "upcoming", now).length : 0), [tasks, now]);
  const overdueCount = useMemo(() => (now ? tasks.filter((x) => isOverdue(x, now)).length : 0), [tasks, now]);

  const deleting = tasks.find((x) => x.id === deleteId) ?? null;

  useEffect(() => {
    if (!undoId) return;
    const timer = setTimeout(() => setUndoId(null), 5000);
    return () => clearTimeout(timer);
  }, [undoId]);

  function confirmDelete() {
    if (!deleteId) return;
    tasksStore.remove(deleteId);
    if (openId === deleteId) setOpenId(null);
    setUndoId(deleteId);
    setDeleteId(null);
  }

  const listName = (id: TaskListId) => t(`lists.${id}`);

  function subtitle(task: Task, key: TaskGroupKey, n: Date): string {
    const parts: string[] = [];
    if (task.due) {
      const d = new Date(task.due);
      const time = task.allDay ? null : timeFmt.format(d);
      const diff = dayDiff(task.due, n);
      if (key === "today" && diff < 0) parts.push([diff === -1 ? t("yesterday") : dateFmt.format(d), time].filter(Boolean).join(", "));
      else if (key === "today" || key === "tomorrow") time && parts.push(time);
      else parts.push([dateFmt.format(d), time].filter(Boolean).join(", "));
    }
    parts.push(listName(task.list));
    if (task.repeat) parts.push(t("weekly"));
    return parts.join(" · ");
  }

  const groups = useMemo(() => {
    if (!now) return [];
    if (view === "done") return [{ key: null as TaskGroupKey | null, items: visible }];
    if (view === "today") return [{ key: "today" as TaskGroupKey, items: visible }];
    return GROUP_ORDER.map((key) => ({ key: key as TaskGroupKey | null, items: visible.filter((x) => groupKeyOf(x, now) === key) })).filter((g) => g.items.length > 0);
  }, [visible, view, now]);

  const emptyTitle = view === "done" ? t("emptyDone") : list === "all" ? t("emptyTitleAll") : t("emptyTitle", { list: listName(list) });

  return (
    <div className={cx("mx-auto w-full px-4 pt-2 pb-36 md:pt-8 md:pb-10", wide && openTask ? "grid max-w-6xl grid-cols-[1fr_380px] items-start gap-6" : "max-w-3xl")}>
    <div className="flex min-w-0 flex-col gap-4">
      <header className="flex min-h-15 items-center gap-2 py-2">
        <div className="min-w-0 flex-1">
          <h1 className="t-large-title text-ink">{t("title")}</h1>
          {status === "ready" && (
            <p className="t-accent-serif-sm hidden text-ink-secondary md:block">{t("summary", { count: upcomingCount, overdue: overdueCount })}</p>
          )}
        </div>
        <IconButton icon="search" label={t("search")} className="size-11 md:hidden" />
        <Button icon="add" fullWidth={false} className="hidden shrink-0 md:inline-flex">{t("newTask")}</Button>
      </header>

      {unsynced && (
        <div role="status" className="flex items-center gap-3 rounded-(--radius-card-inner) border border-border bg-surface px-4 py-3">
          <Icon name="not-synced" />
          <div className="min-w-0 flex-1">
            <p className="t-subheadline-em text-ink">{t("unsynced")}</p>
            <p className="t-footnote text-ink-secondary">{t("unsyncedBody")}</p>
          </div>
          <Button variant="secondary" icon="retry" fullWidth={false} className="h-11 shrink-0 px-4" onClick={() => tasksStore.retrySync()}>
            {tc("retry")}
          </Button>
        </div>
      )}

      <div role="group" aria-label={t("lists.label")} className="-mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip style={list === "all" ? "selected" : "light"} onClick={() => setList("all")}>{t("lists.all")}</Chip>
        {TASK_LISTS.map((id) => (
          <Chip key={id} style={list === id ? "selected" : "light"} onClick={() => setList(id)}>{listName(id)}</Chip>
        ))}
        <Chip>{t("lists.add")}</Chip>
      </div>

      <SegmentedControl
        className="md:hidden"
        label={t("views.label")}
        value={view}
        onChange={setView}
        options={[
          { value: "today", label: t("views.today") },
          { value: "upcoming", label: t("views.upcoming") },
          { value: "done", label: t("views.done") },
        ]}
      />
      <SegmentedControl
        className="hidden w-80 self-end md:flex"
        label={t("views.label")}
        value={view === "today" ? "upcoming" : view}
        onChange={setView}
        options={[
          { value: "upcoming", label: t("views.upcoming"), icon: "checkbox-off" },
          { value: "done", label: t("views.done"), icon: "check" },
        ]}
      />

      {status === "loading" && (
        <div className={cx(CARD, "flex flex-col gap-2")} aria-busy="true">
          {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} className="px-0" />)}
        </div>
      )}

      {status === "error" && (
        <div role="alert" className={cx(CARD, "flex flex-col items-center gap-2 px-4 pt-6 pb-4 text-center")}>
          <Icon name="warning" size="xlarge" className="text-destructive" />
          <h2 className="t-title-3 text-ink">{t("errorTitle")}</h2>
          <p className="t-subheadline text-ink-secondary">{t("errorBody")}</p>
          <Button icon="retry" fullWidth onClick={() => tasksStore.load(scenario)}>{tc("retry")}</Button>
        </div>
      )}

      {status === "ready" && groups.length === 0 && (
        <EmptyState
          icon="nav-tasks"
          title={emptyTitle}
          description={view === "done" ? undefined : t("emptyBody")}
          actionLabel={view === "done" ? undefined : t("addTask")}
          className="border border-border py-8"
        />
      )}

      {status === "ready" && now && groups.map((g) => (
        <section key={g.key ?? "done"} className={cx(CARD, "flex flex-col gap-1")}>
          {g.key && (
            <h2 className="t-headline py-2 text-ink">
              {g.key === "today" || g.key === "tomorrow"
                ? `${t(`groups.${g.key}`)} · ${dateFmt.format(new Date(now.getTime() + (g.key === "tomorrow" ? 86_400_000 : 0)))}`
                : t(`groups.${g.key}`)}
            </h2>
          )}
          {g.items.map((task, i) => (
            <TaskRow
              key={task.id}
              title={task.title}
              subtitle={subtitle(task, groupKeyOf(task, now), now)}
              done={task.done}
              overdue={isOverdue(task, now)}
              priority={task.priority}
              showDivider={i < g.items.length - 1}
              toggleLabel={task.done ? t("markOpen") : t("markDone")}
              priorityLabel={t("priority")}
              onToggle={() => tasksStore.toggle(task.id)}
              onOpen={() => setOpenId(task.id)}
              swipe={{
                doneLabel: t("views.done"),
                deleteLabel: tc("delete"),
                onDone: () => tasksStore.toggle(task.id),
                onDelete: () => setDeleteId(task.id),
              }}
            />
          ))}
        </section>
      ))}
    </div>
      {openTask && wide && (
        <aside className="sticky top-8 rounded-(--radius-card) border border-border bg-surface p-5 shadow-(--shadow-card-soft)">
          <TaskDetail key={openTask.id} task={openTask} showHeader onClose={() => setOpenId(null)} onDelete={() => setDeleteId(openTask.id)} />
        </aside>
      )}
      <Sheet open={!!openTask && !wide} onClose={() => setOpenId(null)} title={t("detail.title")}>
        {openTask && !wide && <TaskDetail key={openTask.id} task={openTask} onClose={() => setOpenId(null)} onDelete={() => setDeleteId(openTask.id)} />}
      </Sheet>
      <Dialog
        open={!!deleting}
        onClose={() => setDeleteId(null)}
        type="destructive"
        title={t("delete.title")}
        message={deleting ? t("delete.message", { title: deleting.title }) : undefined}
        confirmLabel={tc("delete")}
        onConfirm={confirmDelete}
      />
      {undoId && (
        <div className="fixed inset-x-0 bottom-28 z-50 flex justify-center md:bottom-6">
          <Toast
            message={t("delete.toast")}
            actionLabel={tc("undo")}
            onAction={() => {
              tasksStore.restore(undoId);
              setUndoId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
