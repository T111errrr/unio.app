import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";
import { Toggle } from "./Toggle";

type Props = {
  title: string;
  /** Ikon di kotak kiri (36 px). Kosong = tanpa kotak. */
  leadingIcon?: IconName;
  /** Figma: Trailing = Chevron / Value / Toggle / Check */
  trailing?: "none" | "chevron" | "value" | "toggle" | "check";
  /** Teks di kanan untuk trailing="value". */
  value?: string;
  /** Untuk trailing="toggle" dan "check". */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  showDivider?: boolean;
  onClick?: () => void;
  className?: string;
};

export function ListRow({
  title,
  leadingIcon,
  trailing = "none",
  value,
  checked = false,
  onCheckedChange,
  showDivider = true,
  onClick,
  className,
}: Props) {
  let end: ReactNode = null;
  if (trailing === "chevron") end = <span className="text-ink-tertiary"><Icon name="chevron-right" size="small" /></span>;
  if (trailing === "value") end = <span className="t-body text-ink-secondary">{value}</span>;
  if (trailing === "check") end = checked ? <Icon name="check" /> : null;
  if (trailing === "toggle") end = <Toggle checked={checked} onCheckedChange={onCheckedChange} label={title} />;

  const classes = cx(
    "relative flex min-h-13 w-full items-center gap-3 px-1 py-2 text-left",
    showDivider &&
      cx(
        "after:absolute after:right-0 after:bottom-0 after:h-px after:bg-divider after:content-['']",
        leadingIcon ? "after:left-12" : "after:left-0",
      ),
    className,
  );

  const content = (
    <>
      {leadingIcon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-m) bg-field text-ink">
          <Icon name={leadingIcon} size="small" />
        </span>
      )}
      <span className="t-body min-w-0 flex-1 truncate text-ink">{title}</span>
      {end}
    </>
  );

  // Toggle adalah tombolnya sendiri; jangan menumpuk tombol di dalam tombol.
  if (onClick && trailing !== "toggle") {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
