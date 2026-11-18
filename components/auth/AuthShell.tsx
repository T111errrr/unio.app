import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

type Props = {
  /** Kalimat pada gelembung di panel visual (desktop). */
  speech: string;
  ornaments?: IconName[];
  children: ReactNode;
};

/** Kerangka layar auth: panel visual di kiri (hanya ≥ 1024 px) + formulir di tengah/kanan. */
export function AuthShell({ speech, ornaments = ["nav-finance", "nav-tasks", "nav-notes", "nav-recap"], children }: Props) {
  return (
    <div className="flex min-h-dvh bg-background text-ink">
      <aside
        aria-hidden="true"
        className="relative m-3 hidden w-[45%] max-w-2xl shrink-0 items-center justify-center overflow-hidden rounded-(--radius-card) bg-field lg:flex"
      >
        <div className="absolute size-175 rounded-(--radius-full) bg-surface" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex gap-4">
            {ornaments.map((name, index) => (
              <span
                key={name}
                className="flex size-12 items-center justify-center rounded-(--radius-xl) bg-surface text-ink shadow-(--shadow-card-soft)"
                style={{ transform: `translateY(${index % 2 === 0 ? 0 : 14}px)` }}
              >
                <Icon name={name} />
              </span>
            ))}
          </div>
          <p className="t-body-em rounded-(--radius-xl) bg-card-dark px-5 py-3 text-on-card-dark shadow-(--shadow-card-elevated)">
            {speech}
          </p>
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-100 flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
