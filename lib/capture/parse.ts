export type ExpenseCategory = "food" | "coffee" | "transport" | "shopping";
export type IncomeCategory = "salary" | "freelance" | "bonus" | "other";

const NUMBER = /(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta)?(?![a-z0-9])/i;
const MULTIPLIER: Record<string, number> = { rb: 1_000, ribu: 1_000, k: 1_000, jt: 1_000_000, juta: 1_000_000 };

const EXPENSE_WORDS: Record<ExpenseCategory, string[]> = {
  food: ["makan", "nasi", "ayam", "bakso", "lunch", "sarapan", "soto", "mie"],
  coffee: ["kopi", "cafe", "kafe", "latte", "teh"],
  transport: ["grab", "gojek", "ojek", "bensin", "parkir", "tol", "bus", "kereta"],
  shopping: ["belanja", "indomaret", "alfamart", "beli", "toko"],
};
const INCOME_WORDS: Record<IncomeCategory, string[]> = {
  salary: ["gaji"],
  freelance: ["freelance", "proyek", "project"],
  bonus: ["bonus", "thr"],
  other: [],
};

export type Parsed = { amount: number | null; note: string };

/** Mengambil nominal rupiah dari kalimat bebas: "kopi susu 25rb", "gaji 4,5jt", "beli sesuatu 48.000". */
export function parseCapture(input: string): Parsed {
  const m = NUMBER.exec(input);
  if (!m) return { amount: null, note: input.trim() };
  const raw = m[1] ?? "";
  const mult = (m[2] ? MULTIPLIER[m[2].toLowerCase()] : undefined) ?? 1;
  const thousands = /^\d{1,3}([.,]\d{3})+$/.test(raw);
  const value = thousands ? Number(raw.replace(/[.,]/g, "")) : Number(raw.replace(",", "."));
  const amount = Math.round(value * mult);
  const note = (input.slice(0, m.index) + " " + input.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
  return { amount: amount > 0 ? amount : null, note };
}

function guess<T extends string>(note: string, words: Record<T, string[]>): T | null {
  const lower = note.toLowerCase();
  for (const key of Object.keys(words) as T[]) if (words[key].some((w) => lower.includes(w))) return key;
  return null;
}
export const guessExpenseCategory = (note: string) => guess(note, EXPENSE_WORDS);
export const guessIncomeCategory = (note: string) => guess(note, INCOME_WORDS);
