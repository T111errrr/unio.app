import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { rupiah } from "@/lib/finance/calc";
import type { Transaction } from "@/lib/finance/store";

type Props = { tx: Transaction; categoryLabel: string; right: string; onOpen: () => void; divider?: boolean };

export function TxRow({ tx, categoryLabel, right, onOpen, divider = true }: Props) {
  const sign = tx.kind === "income" ? "+" : tx.kind === "expense" ? "−" : "";
  const sub = tx.kind === "transfer" ? `${tx.pocket} → ${tx.toPocket}` : `${categoryLabel} · ${tx.pocket}`;
  return (
    <button type="button" onClick={onOpen} className="relative flex min-h-14 w-full items-center gap-3 py-3 text-left">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-(--radius-card-inner) bg-field">
        <Icon name={tx.kind === "income" ? "income" : tx.kind === "expense" ? "expense" : "transfer"} size="small" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="t-body block truncate">{tx.note}</span>
        <span className="t-footnote block truncate text-ink-secondary">{sub}</span>
      </span>
      <span className="text-right">
        <span className={cx("t-body-em block", tx.kind === "income" && "text-income")}>{sign}{rupiah(tx.amount)}</span>
        <span className="t-footnote block text-ink-secondary">{right}</span>
      </span>
      {divider && <span aria-hidden className="absolute right-0 bottom-0 left-14 h-px bg-divider" />}
    </button>
  );
}
