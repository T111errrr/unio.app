import { z } from "zod";

export const TASK_LISTS = ["kantor", "pribadi", "ide"] as const;
export type TaskListId = (typeof TASK_LISTS)[number];

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  list: z.enum(TASK_LISTS),
  /** ISO 8601; null = tanpa tenggat */
  due: z.string().nullable(),
  /** Bila true, jam tidak ditampilkan */
  allDay: z.boolean().default(false),
  priority: z.boolean().default(false),
  done: z.boolean().default(false),
  repeat: z.enum(["weekly"]).nullable().default(null),
});

export type Task = z.infer<typeof taskSchema>;
export type TasksStatus = "loading" | "ready" | "error";
export type TasksView = "today" | "upcoming" | "done";
