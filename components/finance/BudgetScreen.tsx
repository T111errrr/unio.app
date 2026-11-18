"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { categorySpent, compact, digitsToNumber, monthSpent, rupiah } from "@/lib/finance/calc";
import { financeStore, type BudgetCategory, type Transaction } from "@/lib/finance/store";
import { TextField } from "@/components/ui/TextField";
import { AmountField } from "./AmountField";
import { FullScreen } from "./FullScreen";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-4 shadow-(--shadow-card-soft)";

type Props = { open: boolean; onClose: () => void; monthly: number; categories: BudgetCategory[]; txs: Transaction[]; now: Date };

/** Budget & kategori (Figma 46:2708): budget bulanan, batas per kategori, kata kunci otomatis. */
export function BudgetScreen({ open, onClose, monthly, categories, txs, now }: Props) {
  const t = useTranslations("finance");
  const spent = monthSpent(txs, now);
  const ratio = monthly ? spent / monthly : 0;
  const [editId, setEditId] = useState<string | "monthly" | "new" | null>(null);
  const [val, setVal] = useState("");
  const [name, setName] = useState("");
  const [kwCat, setKwCat] = useState<string>("coffee");
  const [kw, setKw] = useState("");
  const [addingKw, setAddingKw] = useState(false);
  const kwCategory = categories.find((c) => c.id === kwCat) ?? categories[0];
  const warn = ratio >= 0.8;

  function openEdit(id: string | "monthly" | "new", current: number) {
    setEditId(id);
    setVal(current ? new Intl.NumberFormat("id-ID").format(current) : "");
    setName("");
  }
  function save() {
    const n = digitsToNumber(val);
    if (editId === "monthly") financeStore.setBudget(n);
    else if (editId === "new") name.trim() && financeStore.addCategory(name.trim(), n);
    else if (editId) financeStore.setCategoryLimit(editId, n);
    setEditId(null);
  }

  return (
    <FullScreen open={open} onClose={onClose} title={t("budgetTitle")}>
      <section className="flex flex-col gap-3 rounded-(--radius-card) bg-card-dark px-5 py-5 text-on-card-dark shadow-(--shadow-card-elevated)">
        <p className="t-subheadline text-on-card-dark-secondary">{t("monthlyBudget")}</p>
        <button type="button" onClick={() => openEdit("monthly", monthly)} className="t-large-title min-h-11 text-left" aria-label={t("editBudget")}>{rupiah(monthly)}</button>
        <p className="t-subheadline text-on-card-dark-secondary">{t("monthlyLimit")}</p>
        <div role="progressbar" aria-label={t("monthlyBudget")} aria-valuenow={Math.round(Math.min(ratio, 1) * 100)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-(--radius-full) bg-on-card-dark/20">
          <div className={cx("h-full rounded-(--radius-full)", warn ? "bg-warning" : "bg-on-card-dark")} style={{ width: `${Math.round(Math.min(ratio, 1) * 100)}%` }} />
        </div>
        <div className="flex justify-between">
          <div><p className="t-footnote text-on-card-dark-secondary">{t("used")}</p><p className="t-body-em">{rupiah(spent)}</p></div>
          <div className="text-right"><p className="t-footnote text-on-card-dark-secondary">{t("left")}</p><p className={cx("t-body-em", warn && "text-warning")}>{rupiah(Math.max(monthly - spent, 0))}</p></div>
        </div>
      </section>

      <section className={CARD}>
        <div className="flex min-h-11 items-center justify-between">
          <h3 className="t-headline">{t("perCategory")}</h3>
          <button type="button" onClick={() => openEdit("new", 0)} className="t-subheadline flex min-h-11 items-center text-ink-secondary">{t("addCategory")}</button>
        </div>
        <div className="flex flex-col gap-1">
          {categories.map((c) => {
            const s = categorySpent(txs, c.id, now);
            const r = c.limit ? s / c.limit : 0;
            const tone = r >= 1 ? "bg-expense" : r >= 0.8 ? "bg-warning" : "bg-accent";
            return (
              <button key={c.id} type="button" onClick={() => openEdit(c.id, c.limit)} className="flex min-h-11 flex-col justify-center gap-1.5 py-2 text-left" aria-label={`${c.name}, ${t("editLimit")}`}>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="t-subheadline-em">{c.emoji} {c.name}</span>
                  <span className={cx("t-footnote", r >= 1 ? "text-expense" : r >= 0.8 ? "text-warning" : "text-ink-secondary")}>{compact(s)} / {compact(c.limit)}</span>
                </span>
                <span role="progressbar" aria-label={c.name} aria-valuenow={Math.round(Math.min(r, 1) * 100)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-(--radius-full) bg-field">
                  <span className={cx("block h-full rounded-(--radius-full)", tone)} style={{ width: `${Math.round(Math.min(r, 1) * 100)}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {kwCategory && (
        <section className={CARD}>
          <h3 className="t-headline min-h-11 leading-11">{t("keywordsTitle", { name: kwCategory.name })}</h3>
          <p className="t-footnote text-ink-secondary">{t("keywordsBody", { name: kwCategory.name })}</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("category")}>
            {categories.map((c) => (
              <button key={c.id} type="button" aria-pressed={kwCategory.id === c.id} onClick={() => setKwCat(c.id)} className={cx("t-footnote-em relative h-8 rounded-(--radius-m) px-3 before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']", kwCategory.id === c.id ? "bg-accent text-on-accent" : "bg-field text-ink")}>{c.name}</button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {kwCategory.keywords.map((k) => (
              <span key={k} className="t-footnote-em rounded-(--radius-full) border border-border px-3 py-1.5">{k}</span>
            ))}
            {addingKw ? (
              <input
                autoFocus
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onBlur={() => { financeStore.addKeyword(kwCategory.id, kw); setKw(""); setAddingKw(false); }}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                aria-label={t("newKeyword")}
                className="t-footnote-em h-8 w-28 rounded-(--radius-full) bg-field px-3 outline-none"
              />
            ) : (
              <button type="button" onClick={() => setAddingKw(true)} className="t-footnote-em relative rounded-(--radius-full) bg-field px-3 py-1.5 before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']">{t("addKeyword")}</button>
            )}
          </div>
        </section>
      )}

      <Sheet open={editId !== null} onClose={() => setEditId(null)} title={editId === "monthly" ? t("monthlyBudget") : editId === "new" ? t("addCategory") : t("editLimit")}>
        <div className="flex flex-col gap-4">
          {editId === "new" && (
            <TextField label={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <AmountField label={t("limit")} value={val} onChange={setVal} />
          <Button disabled={!digitsToNumber(val) || (editId === "new" && !name.trim())} onClick={save}>{t("save")}</Button>
        </div>
      </Sheet>
    </FullScreen>
  );
}
