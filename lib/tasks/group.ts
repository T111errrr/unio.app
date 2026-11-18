import type { Task, TaskListId, TasksView } from "./types";

export type TaskGroupKey = "today" | "tomorrow" | "week" | "later" | "none";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function dayDiff(due: string, now: Date): number {
  return Math.round((startOfDay(new Date(due)).getTime() - startOfDay(now).getTime()) / 86_400_000);
}

export function groupKeyOf(task: Task, now: Date): TaskGroupKey {
  if (!task.due) return "none";
  const diff = dayDiff(task.due, now);
  if (diff <= 0) return "today"; // termasuk yang terlambat
  if (diff === 1) return "tomorrow";
  if (diff <= 7) return "week";
  return "later";
}

export function isOverdue(task: Task, now: Date): boolean {
  if (!task.due || task.done) return false;
  return task.allDay ? dayDiff(task.due, now) < 0 : new Date(task.due).getTime() < now.getTime();
}

export function filterTasks(tasks: Task[], list: TaskListId | "all", view: TasksView, now: Date): Task[] {
  return tasks
    .filter((t) => (list === "all" || t.list === list))
    .filter((t) => {
      if (view === "done") return t.done;
      if (t.done) return false;
      if (view === "today") return groupKeyOf(t, now) === "today";
      return true;
    })
    .sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9"));
}

export const GROUP_ORDER: TaskGroupKey[] = ["today", "tomorrow", "week", "later", "none"];
