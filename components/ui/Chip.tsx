import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

type Props = {
  children: ReactNode;
  /** Figma: Style = Light / On Dark / Selected */
  style?: "light" | "onDark" | "selected";
  showChevron?: boolean;
  /** Bila diisi, chip menjadi tombol. */
  onClick?: () => void;
  className?: string;
};

const STYLES = {
  light: "bg-field text-ink",
  onDark: "bg-on-card-dark text-ink shadow-(--shadow-surface-floating)",
  selected: "bg-accent text-on-accent shadow-(--shadow-button-bevel)",
} as const;

export function Chip({ children, style = "light", showChevron = false, onClick, className }: Props) {
  const classes = cx(
    "t-footnote-em relative inline-flex h-[30px] items-center gap-1.5 rounded-(--radius-m) py-1.5 pl-3 pr-2.5",
    STYLES[style],
    onClick && "before:absolute before:-inset-y-[7px] before:inset-x-0 before:content-['']",
    className,
  );
  const content = (
    <>
      {children}
      {showChevron && <Icon name="chevron-down" size="small" />}
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  ) : (
    <span className={classes}>{content}</span>
  );
}
