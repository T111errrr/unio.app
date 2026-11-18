import { cx } from "@/lib/cx";

/** Blok abu berdenyut untuk status Loading. Berhenti berdenyut bila "kurangi gerakan" aktif. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("rounded-(--radius-l) bg-field motion-safe:animate-pulse", className)} />;
}

/** Figma: Skeleton Row (358×68). */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cx("flex items-center gap-3 rounded-(--radius-card-inner) bg-surface px-4 py-3", className)}
    >
      <Skeleton className="size-11 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-3/4 rounded-(--radius-s)" />
        <Skeleton className="h-3.5 w-1/2 rounded-(--radius-s)" />
      </div>
      <Skeleton className="h-3 w-16 rounded-(--radius-s)" />
    </div>
  );
}
