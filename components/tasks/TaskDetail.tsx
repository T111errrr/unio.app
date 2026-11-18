"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { ListRow } from "@/components/ui/ListRow";
import { TextField } from "@/components/ui/TextField";
import { dayDiff } from "@/lib/tasks/group";
import { tasksStore } from "@/lib/tasks/store";
import { TASK_LISTS, type Task } from "@/lib/tasks/types";
import { TaskRow } from "./TaskRow";

type Props = {
  task: Task;
  /** Panel desktop menampilkan judul + tombol tutup sendiri; Sheet mobile sudah punya header. */
  showHeader?: boolean;
  onClose: () => void;
  /** Minta konfirmasi hapus (dialog ada di layar induk). */
  onDelete: () => void;
};

function toInput(due: string | null): string {
  if (!due) return "";
  const d = new Date(due);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Figma: Tasks — Detail (38:1677 mobile, 153:3750 panel desktop). Perubahan tersimpan otomatis. */
export function TaskDetail({ task, showHeader = false, onClose, onDelete }: Props) {
  const t = useTranslations("tasks");
  const td = useTranslations("tasks.detail");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [newSub, setNewSub] = useState("");
  const dateInput = useRef<HTMLInputElement>(null);

  function dueLabel(): string {
    if (!task.due) return td("none");
    const d = new Date(task.due);
    const diff = dayDiff(task.due, new Date());
    const day =
      diff === 0 ? t("groups.today") : diff === 1 ? t("groups.tomorrow") : new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(d);
    const time = task.allDay ? "" : `, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return day + time;
  }

  const doneCount = task.subtasks.filter((s) => s.done).length;
  const nextList = TASK_LISTS[(TASK_LISTS.indexOf(task.list) + 1) % TASK_LISTS.length];

  return (
    <div className="flex flex-col gap-4">
      {showHeader && (
        <header className="flex items-center gap-2">
          <h2 className="t-headline flex-1">{td("title")}</h2>
          <IconButton icon="more" label={td("more")} className="size-11" />
          <IconButton icon="close" label={tc("close")} className="size-11" onClick={onClose} />
        </header>
      )}

      <TextField
        label={td("titleLabel")}
        value={task.title}
        onChange={(e) => tasksStore.update(task.id, { title: e.target.value })}
      />
      <textarea
        aria-label={td("notes")}
        placeholder={td("notes")}
        value={task.notes}
        onChange={(e) => tasksStore.update(task.id, { notes: e.target.value })}
        className="t-body h-22 w-full resize-none rounded-(--radius-control) bg-field px-5 py-3.5 text-ink outline-none placeholder:text-ink-tertiary"
      />

      <div className="rounded-(--radius-card-inner) bg-surface-inset px-3 py-1">
        <div className="relative">
          <ListRow leadingIcon="calendar" title={td("due")} trailing="valueChevron" value={dueLabel()} />
          <input
            ref={dateInput}
            type="datetime-local"
            aria-label={td("due")}
            value={toInput(task.due)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            onChange={(e) =>
              tasksStore.update(task.id, { due: e.target.value ? new Date(e.target.value).toISOString() : null, allDay: false })
            }
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
        <ListRow
          leadingIcon="retry"
          title={td("repeat")}
          trailing="valueChevron"
          value={task.repeat ? t("weekly") : td("no")}
          onClick={() => tasksStore.update(task.id, { repeat: task.repeat ? null : "weekly" })}
        />
        <ListRow
          leadingIcon="list"
          title={td("list")}
          trailing="valueChevron"
          value={t(`lists.${task.list}`)}
          onClick={() => tasksStore.update(task.id, { list: nextList })}
        />
        <ListRow
          leadingIcon="priority"
          title={t("priority")}
          trailing="toggle"
          checked={task.priority}
          onCheckedChange={(v) => tasksStore.update(task.id, { priority: v })}
          showDivider={false}
        />
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {task.tags.map((tag, i) => (
            <Badge key={tag} type={i === 1 ? "info" : "neutral"} icon={i === 1 ? "calendar" : "tag"}>
              {tag}
            </Badge>
          ))}
          <Chip>{td("addTag")}</Chip>
        </div>
      )}

      <section aria-label={td("subtasks")} className="flex flex-col">
        <div className="flex items-center justify-between py-2">
          <h3 className="t-headline">{td("subtasks")}</h3>
          {task.subtasks.length > 0 && (
            <span className="t-subheadline text-ink-secondary">
              {doneCount}/{task.subtasks.length}
            </span>
          )}
        </div>
        {task.subtasks.map((s, i) => (
          <TaskRow
            key={s.id}
            title={s.title}
            done={s.done}
            showDivider={i < task.subtasks.length - 1}
            toggleLabel={s.done ? t("markOpen") : t("markDone")}
            priorityLabel=""
            onToggle={() => tasksStore.toggleSubtask(task.id, s.id)}
          />
        ))}
        <form
          className="mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            const title = newSub.trim();
            if (!title) return;
            tasksStore.addSubtask(task.id, title);
            setNewSub("");
          }}
        >
          <TextField aria-label={td("addSubtask")} placeholder={td("addSubtask")} value={newSub} onChange={(e) => setNewSub(e.target.value)} />
        </form>
      </section>

      <div className="flex gap-2.5">
        <IconButton
          icon="delete"
          label={tc("delete")}
          className="text-destructive"
          onClick={onDelete}
        />
        <Button className="flex-1" onClick={onClose}>
          {tc("save")}
        </Button>
      </div>
    </div>
  );
}
