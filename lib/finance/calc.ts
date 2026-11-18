import type { Pocket, PocketKind, Transaction } from "./store";

export const POCKET_ICON = { cash: "pocket", bank: "bank", ewallet: "device-phone", tabungan: "pocket", paylater: "nav-finance" } as const satisfies Record<PocketKind, string>;
export const POCKET_KINDS: PocketKind[] = ["cash", "bank", "ewallet", "tabungan", "paylater"];

export const rupiah = (n: number) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;

/** Ringkas gaya Figma: 3.420.000 → "Rp3,42 jt", 180.000 → "Rp180 rb". */
export function compact(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1_000_000) return `${sign}Rp${(Math.round(a / 10_000) / 100).toString().replace(".", ",")} jt`;
  if (a >= 1000) return `${sign}Rp${Math.round(a / 1000)} rb`;
  return `${sign}Rp${a}`;
}

export const sameMonth = (iso: string, now: Date) => {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export function monthSpent(txs: Transaction[], now: Date): number {
  return txs.filter((t) => t.kind === "expense" && sameMonth(t.at, now)).reduce((s, t) => s + t.amount, 0);
}
export function categorySpent(txs: Transaction[], category: string, now: Date): number {
  return txs.filter((t) => t.kind === "expense" && t.category === category && sameMonth(t.at, now)).reduce((s, t) => s + t.amount, 0);
}
/** Ringkasan bulan ini untuk satu kantong. */
export function pocketMonth(txs: Transaction[], name: string, now: Date) {
  let masuk = 0, keluar = 0, transfer = 0;
  for (const t of txs) {
    if (!sameMonth(t.at, now)) continue;
    if (t.kind === "income" && t.pocket === name) masuk += t.amount;
    if (t.kind === "expense" && t.pocket === name) keluar += t.amount;
    if (t.kind === "transfer" && (t.pocket === name || t.toPocket === name)) transfer += t.amount;
  }
  return { masuk, keluar, transfer };
}
export const pocketTxs = (txs: Transaction[], p: Pocket) => txs.filter((t) => t.pocket === p.name || t.toPocket === p.name);

/** Tanggal jatuh tempo berikutnya untuk Paylater. */
export function nextDue(dueDay: number, now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) d.setMonth(d.getMonth() + 1);
  return d;
}

/** Hanya angka → "1.250.000". Mengembalikan 0 untuk kosong. */
export const digitsToNumber = (s: string) => Number(s.replace(/\D/g, "")) || 0;
export const formatDigits = (s: string) => {
  const n = digitsToNumber(s);
  return n ? new Intl.NumberFormat("id-ID").format(n) : "";
};
