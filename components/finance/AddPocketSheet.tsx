"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { SelectField, TextField } from "@/components/ui/TextField";
import { cx } from "@/lib/cx";
import { digitsToNumber, POCKET_ICON, POCKET_KINDS } from "@/lib/finance/calc";
import { financeStore, type PocketKind } from "@/lib/finance/store";
import { AmountField } from "./AmountField";

/** Tambah kantong (Figma 46:2520) dan Tambah Paylater (46:2583). */
export function AddPocketSheet({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (name: string) => void }) {
  const t = useTranslations("finance");
  const [kind, setKind] = useState<PocketKind>("bank");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [limit, setLimit] = useState("");
  const [dueDay, setDueDay] = useState(25);
  useEffect(() => {
    if (open) {
      setKind("bank");
      setName("");
      setBalance("");
      setLimit("");
      setDueDay(25);
    }
  }, [open]);

  const paylater = kind === "paylater";
  const ok = name.trim().length > 0;

  return (
    <Sheet open={open} onClose={onClose} title={t("addPocket")}>
      <div className="flex flex-col gap-4">
        {paylater ? (
          <>
        <div className="flex items-start justify-between" role="group" aria-label={t("pocketType")}>
              {POCKET_KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className="flex min-h-11 w-15 flex-col items-center gap-1.5"
                >
                  <span className={cx("flex size-14 items-center justify-center rounded-(--radius-control)", kind === k ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "bg-field text-ink")}>
                    <Icon name={POCKET_ICON[k]} />
                  </span>
                  <span className={cx("t-caption-1", kind === k ? "text-ink" : "text-ink-secondary")}>{t(`kind.${k}`)}</span>
                </button>
              ))}
            </div>
            <TextField label={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
            <AmountField label={t("limit")} value={limit} onChange={setLimit} />
            <AmountField label={t("debtNow")} value={balance} onChange={setBalance} />
            <SelectField label={t("dueDate")} value={dueDay} onChange={(e) => setDueDay(Number(e.target.value))}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{t("everyDate", { day: d })}</option>
              ))}
            </SelectField>
          </>
        ) : (
          <>
            {/* Figma: grup abu-abu berisi kartu putih (jenis, nama, saldo). */}
            <div className="flex flex-col gap-2.5 rounded-(--radius-card) bg-field px-1.5 pt-3.5 pb-1.5">
              <p className="t-callout px-2 text-ink-secondary">{t("pocketDetail")}</p>
              <div className="flex flex-col gap-4 rounded-(--radius-card-inner) bg-surface px-4 pt-5 pb-4">
        <div className="flex items-start justify-between" role="group" aria-label={t("pocketType")}>
                  {POCKET_KINDS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={kind === k}
                      onClick={() => setKind(k)}
                      className="flex min-h-11 w-15 flex-col items-center gap-1.5"
                    >
                      <span className={cx("flex size-14 items-center justify-center rounded-(--radius-control)", kind === k ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "bg-field text-ink")}>
                        <Icon name={POCKET_ICON[k]} />
                      </span>
                      <span className={cx("t-caption-1", kind === k ? "text-ink" : "text-ink-secondary")}>{t(`kind.${k}`)}</span>
                    </button>
                  ))}
                </div>
                <TextField label={t("pocketName")} value={name} onChange={(e) => setName(e.target.value)} />
                <AmountField label={t("balanceNow")} value={balance} onChange={setBalance} />
              </div>
            </div>
            <p className="t-footnote text-ink-secondary">{t("paylaterHint")}</p>
          </>
        )}
        <Button
          disabled={!ok}
          onClick={() => {
            financeStore.addPocket({
              name: name.trim(),
              kind,
              balance: digitsToNumber(balance),
              ...(paylater ? { limit: digitsToNumber(limit), dueDay, installment: 0 } : {}),
            });
            onAdded(name.trim());
            onClose();
          }}
        >
          {paylater ? t("savePaylater") : t("savePocket")}
        </Button>
      </div>
    </Sheet>
  );
}
