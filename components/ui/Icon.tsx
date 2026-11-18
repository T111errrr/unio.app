import { ICONS, type IconName } from "./icon-registry";

export type { IconName };

/** Ukuran mengikuti komponen Figma `Icon` (11:554): kotak / tinggi glyph, dalam px. */
const SIZES = {
  small: { box: 18, glyph: 13 },
  medium: { box: 24, glyph: 17 },
  large: { box: 31, glyph: 22 },
  xlarge: { box: 39, glyph: 28 },
} as const;

export type IconSize = keyof typeof SIZES;

/** Ikon "isi penuh" di Figma yang punya tanda di dalamnya (centang / plus) — tandanya memakai warna on-accent. */
const FILLED_WITH_MARK = new Set<IconName>(["checkbox-on", "add-circle"]);

type IconProps = {
  name: IconName;
  size?: IconSize;
  /** Versi isi penuh (mis. `.fill` di SF Symbols). */
  filled?: boolean;
  /** Label untuk pembaca layar. Tanpa label, ikon dianggap hiasan. */
  label?: string;
  className?: string;
};

export function Icon({ name, size = "medium", filled = false, label, className = "" }: IconProps) {
  const Glyph = ICONS[name];
  const { box, glyph } = SIZES[size];
  const markClass = filled && FILLED_WITH_MARK.has(name) ? " [&_path]:stroke-(--unio-on-accent)" : "";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center${className ? " " + className : ""}`}
      style={{ width: box, height: box }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Glyph
        width={glyph}
        height={glyph}
        strokeWidth={1.75}
        fill={filled ? "currentColor" : "none"}
        className={markClass.trim()}
        aria-hidden="true"
      />
    </span>
  );
}
