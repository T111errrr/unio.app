import type { Transaction } from "./store";

function today(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** Data contoh lokal (sama dengan isi Figma). Diganti Supabase di tahap backend. */
export function createMockTransactions(): Transaction[] {
  return [
    { id: "x3", kind: "income", amount: 750_000, category: "freelance", note: "Freelance logo", pocket: "Superbank", at: today(15, 5) },
    { id: "x2", kind: "expense", amount: 60_000, category: "food", note: "Makan siang", pocket: "Bank Jago", at: today(12, 40) },
    { id: "x1", kind: "expense", amount: 25_000, category: "coffee", note: "Kopi", pocket: "Cash", at: today(8, 12) },
  ];
}
