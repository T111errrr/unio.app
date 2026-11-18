import type { Transaction } from "@/lib/finance/store";
import type { Task } from "@/lib/tasks/types";

export type Period = "day" | "week" | "month";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Rentang [start, end] (inklusif, awal hari) untuk periode yang berisi `anchor`. Minggu mulai Senin. */
export function rangeOf(period: Period, anchor: Date): { start: Date; end: Date } {
  const a = startOfDay(anchor);
  if (period === "day") return { start: a, end: a };
  if (period === "week") {
    const start = addDays(a, -((a.getDay() + 6) % 7));
    return { start, end: addDays(start, 6) };
  }
  return { start: new Date(a.getFullYear(), a.getMonth(), 1), end: new Date(a.getFullYear(), a.getMonth() + 1, 0) };
}

export function shift(period: Period, anchor: Date, dir: 1 | -1): Date {
  if (period === "day") return addDays(anchor, dir);
  if (period === "week") return addDays(anchor, 7 * dir);
  return new Date(anchor.getFullYear(), anchor.getMonth() + dir, 1);
}

const inRange = (iso: string, r: { start: Date; end: Date }) => {
  const t = startOfDay(new Date(iso)).getTime();
  return t >= r.start.getTime() && t <= r.end.getTime();
};
export const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export type RecapData = {
  income: number;
  spent: number;
  tasksDone: number;
  tasksTotal: number;
  activeDays: number;
  totalDays: number;
  /** Pengeluaran per hari (minggu/hari) atau per minggu (bulan). */
  bars: { label: string; value: number }[];
  categories: { id: string; value: number }[];
};

export function buildRecap(period: Period, anchor: Date, txs: Transaction[], tasks: Task[], weekdayShort: (d: Date) => string): RecapData {
  const r = rangeOf(period, anchor);
  const totalDays = Math.round((r.end.getTime() - r.start.getTime()) / 86_400_000) + 1;
  const tx = txs.filter((t) => inRange(t.at, r));
  const ts = tasks.filter((t) => !t.deletedAt && t.due && inRange(t.due, r));
  const spendTx = tx.filter((t) => t.kind === "expense");
  const active = new Set<string>([...tx.map((t) => dayKey(t.at)), ...ts.filter((t) => t.done).map((t) => dayKey(t.due as string))]);

  const bars: { label: string; value: number }[] = [];
  if (period === "month") {
    for (let i = 0; i * 7 < totalDays; i++) {
      const from = addDays(r.start, i * 7);
      const to = addDays(from, 6);
      bars.push({ label: `M${i + 1}`, value: spendTx.filter((t) => inRange(t.at, { start: from, end: to })).reduce((s, t) => s + t.amount, 0) });
    }
  } else {
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(r.start, i);
      bars.push({ label: weekdayShort(d), value: spendTx.filter((t) => dayKey(t.at) === dayKey(d.toISOString())).reduce((s, t) => s + t.amount, 0) });
    }
  }

  const byCat = new Map<string, number>();
  for (const t of spendTx) byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
  const categories = [...byCat.entries()].map(([id, value]) => ({ id, value })).sort((a, b) => b.value - a.value);

  return {
    income: tx.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0),
    spent: spendTx.reduce((s, t) => s + t.amount, 0),
    tasksDone: ts.filter((t) => t.done).length,
    tasksTotal: ts.length,
    activeDays: active.size,
    totalDays,
    bars,
    categories,
  };
}

export function inPeriod(iso: string, period: Period, anchor: Date) {
  return inRange(iso, rangeOf(period, anchor));
}

/** CSV aman untuk Excel/Sheets: nilai dalam tanda kutip, kutip digandakan. */
export function toCsv(rows: string[][]): string {
  // Sel yang diawali = + - @ diberi apostrof agar tidak dibaca sebagai rumus di Excel/Sheets.
  const safe = (c: string) => (/^[=+\-@]/.test(c) ? `'${c}` : c);
  return rows.map((r) => r.map((c) => `"${safe(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
}
