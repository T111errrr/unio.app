import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { TopBar, type TopBarProps } from "./TopBar";

type Props = {
  topBar: TopBarProps;
  hero: ReactNode;
  title: string;
  accent: string;
  body: string;
  /** Baris chip di bawah teks (Intro 2 dan 3). */
  chips?: ReactNode;
  centered?: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  /** Bagian bawah tombol utama: tombol Lewati atau teks "Sudah punya akun?". */
  secondary: ReactNode;
};

/** Kerangka satu layar Intro: bilah atas, ilustrasi, judul + aksen serif, tombol. Lebar dibatasi 430 px (tampilan iPhone). */
export function IntroScreen({ topBar, hero, title, accent, body, chips, centered, primaryLabel, onPrimary, secondary }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col bg-background text-ink">
      <TopBar {...topBar} />
      <div aria-hidden="true" className="relative mx-auto min-h-90 w-full max-w-97.5 flex-1 overflow-visible">
        {hero}
      </div>
      <div className={`flex flex-col gap-2.5 px-6 pt-2 ${centered ? "items-center text-center" : ""}`}>
        <h1 className="t-large-title">
          {title}
          <span className="t-accent-serif block">{accent}</span>
        </h1>
        <p className="t-body text-ink-secondary">{body}</p>
      </div>
      {chips && <div className="flex justify-center gap-2 pt-5">{chips}</div>}
      <div className="flex flex-col items-center gap-2 px-6 pb-[max(2.75rem,env(safe-area-inset-bottom))] pt-5">
        <Button onClick={onPrimary}>{primaryLabel}</Button>
        {secondary}
      </div>
    </div>
  );
}
