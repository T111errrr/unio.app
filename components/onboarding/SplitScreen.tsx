import type { ReactNode } from "react";
import { TopBar, type TopBarProps } from "./TopBar";
import { Brand } from "./Brand";

type Props = {
  topBar: TopBarProps;
  /** Ilustrasi untuk layar sempit (di bawah bilah atas). */
  mobileVisual: ReactNode;
  /** Ilustrasi untuk panel kiri (≥ 1024 px). */
  desktopVisual: ReactNode;
  title: ReactNode;
  body: ReactNode;
  /** Konten tambahan di antara teks dan tombol (langkah-langkah, badge). */
  extra?: ReactNode;
  actions: ReactNode;
};

/** Layar onboarding yang berubah bentuk: mobile = satu kolom bergaya iPhone; ≥ 1024 px = panel visual + formulir (Figma desktop). */
export function SplitScreen({ topBar, mobileVisual, desktopVisual, title, body, extra, actions }: Props) {
  return (
    <div className="flex min-h-dvh bg-background text-ink">
      <aside
        aria-hidden="true"
        className="relative m-3 hidden w-[45%] max-w-2xl shrink-0 items-center justify-center overflow-hidden rounded-(--radius-card) bg-surface-inset lg:flex"
      >
        <div className="absolute size-175 rounded-(--radius-full) bg-surface opacity-60" />
        <div className="relative h-140 w-120">{desktopVisual}</div>
      </aside>
      <div className="flex flex-1 flex-col lg:items-center lg:justify-center">
        <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col lg:max-w-100 lg:flex-none lg:gap-5">
          <div className="lg:hidden">
            <TopBar {...topBar} />
          </div>
          <div aria-hidden="true" className="relative min-h-72 flex-1 lg:hidden">
            {mobileVisual}
          </div>
          <div className="hidden lg:block">
            <Brand />
          </div>
          <div className="flex flex-col gap-2 px-6 pt-4 lg:px-0 lg:pt-3">
            <h1 className="t-large-title">{title}</h1>
            <p className="t-body text-ink-secondary">{body}</p>
          </div>
          {extra && <div className="px-6 pt-4 lg:px-0 lg:pt-0">{extra}</div>}
          <div className="flex flex-col gap-3 px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-5 lg:gap-5 lg:p-0">{actions}</div>
        </div>
      </div>
    </div>
  );
}
