import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

/** Maskot Unio (Figma 78:1003): kapsul gelap 380×212 dengan dua mata tegak. Putar lewat `rotate`. */
export function Mascot({ rotate = 0, className, style }: { rotate?: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={cx("flex h-53 w-95 items-center justify-center gap-10 rounded-[118px] bg-card-dark", className)}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <span className="h-14 w-5 rounded-(--radius-m) bg-on-card-dark" />
      <span className="h-14 w-5 rounded-(--radius-m) bg-on-card-dark" />
    </div>
  );
}
