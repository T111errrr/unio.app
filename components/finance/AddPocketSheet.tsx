"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
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
        <div className="flex justify-between gap-1" role="group" aria-label={t("pocketType")}>
          {POCKET_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className="flex min-h-11 w-14 flex-col items-center gap-1"
            >
              <span className={cx("flex size-12 items-center justify-center rounded-(--radius-card-inner)", kind === k ? "bg-accent text-on-accent" : "bg-field")}>
                <Icon name={POCKET_ICON[k]} />
              </span>
              <span className={cx("t-caption-1", kind === k ? "t-footnote-em" : "text-ink-secondary")}>{t(`kind.${k}`)}</span>
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-2">
          <span className="t-subheadline text-ink-secondary">{paylater ? t("name") : t("pocketName")}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="t-body h-14 rounded-(--radius-control) border-[1.5px] border-transparent bg-field px-5 outline-none focus:border-accent focus:bg-surface" />
        </label>
        {paylater ? (
          <>
            <AmountField label={t("limit")} value={limit} onChange={setLimit} />
            <AmountField label={t("debtNow")} value={balance} onChange={setBalance} />
            <label className="flex flex-col gap-2">
              <span className="t-subheadline text-ink-secondary">{t("dueDate")}</span>
              <select value={dueDay} onChange={(e) => setDueDay(Number(e.target.value))} className="t-body h-14 rounded-(--radius-control) bg-field px-5 outline-none">
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{t("everyDate", { day: d })}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <AmountField label={t("balanceNow")} value={balance} onChange={setBalance} />
        )}
        <p className="t-footnote text-ink-secondary">{t("paylaterHint")}</p>
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
