import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "@/components/ui/Icon";

const TONES = {
  light: "border border-border bg-surface text-ink",
  dark: "bg-card-dark text-on-card-dark",
  accent: "bg-accent text-on-accent",
} as const;

type Props = {
  icon: IconName;
  /** Diameter dalam px. */
  size: number;
  tone?: keyof typeof TONES;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
};

/** Bulatan ikon hiasan yang melayang di ilustrasi onboarding (Figma: Ornament). Posisi diatur lewat className/style. */
export function Ornament({ icon, size, tone = "light", rotate = 0, className, style }: Props) {
  const iconSize = size >= 64 ? "large" : size >= 44 ? "medium" : "small";
  return (
    <span
      aria-hidden="true"
      className={cx("absolute inline-flex items-center justify-center rounded-(--radius-full) shadow-(--shadow-card-soft)", TONES[tone], className)}
      style={{ width: size, height: size, transform: `rotate(${rotate}deg)`, ...style }}
    >
      <Icon name={icon} size={iconSize} />
    </span>
  );
}
