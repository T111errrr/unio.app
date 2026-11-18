import type { BudgetCategory, Pocket, Transaction } from "./store";

function at(daysAgo: number, h: number, m: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Data contoh lokal (sama dengan isi Figma). Diganti Supabase di tahap backend. */
export function createMockTransactions(): Transaction[] {
  return [
    { id: "x3", kind: "income", amount: 750_000, category: "freelance", note: "Freelance logo", pocket: "Superbank", at: at(0, 15, 5), source: "Manual" },
    { id: "x2", kind: "expense", amount: 60_000, category: "food", note: "Makan siang", pocket: "Bank Jago", at: at(0, 12, 40), source: "Manual" },
    { id: "x1", kind: "expense", amount: 25_000, category: "coffee", note: "Kopi susu", pocket: "Cash", at: at(0, 8, 12), source: "Siri · Unio Expense", memo: "Ngopi sambil meeting dengan klien di kafe dekat kantor." },
    { id: "x4", kind: "transfer", amount: 500_000, category: "transfer", note: "Ke Tabungan", pocket: "Bank Jago", toPocket: "Superbank", at: at(1, 20, 10), source: "Manual" },
    { id: "x5", kind: "expense", amount: 40_000, category: "transport", note: "Bensin", pocket: "Cash", at: at(1, 17, 30), source: "Back Tap" },
    { id: "x6", kind: "income", amount: 4_500_000, category: "salary", note: "Gaji November", pocket: "Bank Jago", at: at(Math.max(new Date().getDate() - 1, 3), 9, 0), source: "Manual" },
    { id: "x7", kind: "expense", amount: 350_000, category: "bills", note: "Listrik", pocket: "Bank Jago", at: at(Math.max(new Date().getDate() - 1, 4), 10, 0), source: "Manual" },
    { id: "x8", kind: "expense", amount: 850_000, category: "shopping", note: "Sepatu lari", pocket: "Paylater", at: at(Math.max(new Date().getDate() - 3, 5), 14, 0), source: "Manual" },
  ];
}

export function createMockPockets(): Pocket[] {
  return [
    { id: "p1", name: "Bank Jago", kind: "bank", balance: 3_420_000 },
    { id: "p2", name: "Cash", kind: "cash", balance: 180_000 },
    { id: "p3", name: "Superbank", kind: "tabungan", balance: 1_200_000 },
    { id: "p4", name: "Paylater", kind: "paylater", balance: 1_250_000, limit: 2_000_000, dueDay: 25, installment: 425_000 },
  ];
}

export function createMockCategories(): BudgetCategory[] {
  return [
    { id: "coffee", name: "Kopi", emoji: "☕", limit: 300_000, keywords: ["kopi", "latte", "americano", "kenangan", "starbucks"] },
    { id: "food", name: "Makan & minum", emoji: "🍜", limit: 1_000_000, keywords: ["makan", "bakso", "nasi"] },
    { id: "transport", name: "Transport", emoji: "🚗", limit: 500_000, keywords: ["bensin", "ojol", "parkir"] },
    { id: "shopping", name: "Belanja", emoji: "🛍️", limit: 1_000_000, keywords: ["belanja", "sepatu"] },
    { id: "bills", name: "Tagihan", emoji: "⚡", limit: 600_000, keywords: ["listrik", "wifi", "pulsa"] },
  ];
}

export { inDays };
