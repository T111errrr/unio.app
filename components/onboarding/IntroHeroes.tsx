import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Chip } from "@/components/ui/Chip";
import { Mascot } from "./Mascot";
import { Ornament } from "./Ornament";

function StepCard({
  step,
  title,
  rotate,
  elevated,
  className,
  children,
}: {
  step: number;
  title: string;
  rotate: number;
  elevated?: boolean;
  className: string;
  children: ReactNode;
}) {
  const t = useTranslations("onboarding");
  return (
    <div
      className={`absolute flex flex-col gap-2.5 rounded-(--radius-xl) border border-border bg-surface p-4 ${
        elevated ? "shadow-(--shadow-card-elevated)" : "shadow-(--shadow-card-soft)"
      } ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <p className="t-caption-2 text-ink-tertiary">{t("step", { n: step })}</p>
      <p className="t-subheadline-em">{title}</p>
      {children}
    </div>
  );
}

/** Intro 1: tiga kartu langkah penyiapan (saldo → rekening → kantong) bertumpuk. */
export function IntroHero1() {
  const t = useTranslations("onboarding");
  return (
    <>
      <Ornament icon="calendar" size={69} rotate={6} style={{ left: 48, top: 12 }} />
      <StepCard step={3} title={t("card3Title")} rotate={6} className="left-36 top-7 w-49">
        <div className="flex gap-1.5">
          <Chip style="selected">{t("pocketDaily")}</Chip>
          <Chip>{t("pocketSavings")}</Chip>
        </div>
      </StepCard>
      <StepCard step={2} title={t("card2Title")} rotate={-5} className="left-9 top-27 w-69">
        <div className="flex gap-1.5">
          <Chip style="selected">{t("bankJago")}</Chip>
          <Chip>{t("bankSuper")}</Chip>
          <Chip>{t("cash")}</Chip>
        </div>
      </StepCard>
      <Ornament icon="chart-line" size={30} tone="dark" rotate={-8} style={{ left: 104, top: 110 }} />
      <StepCard step={1} title={t("card1Title")} rotate={3} elevated className="left-30 top-54 w-50">
        <div className="flex items-center gap-1 rounded-(--radius-l) bg-field px-3.5 py-2.5">
          <span className="t-body text-ink-secondary">{t("fieldCurrency")}</span>
          <span className="t-title-3 text-ink">{t("fieldSample")}</span>
          <span className="h-4.5 w-0.5 rounded-(--radius-xs) bg-ink" />
        </div>
        <p className="t-caption-1 text-ink-secondary">{t("cardHint")}</p>
      </StepCard>
      <Ornament icon="bank" size={60} tone="dark" style={{ left: 297, top: 140 }} />
      <Ornament icon="checkbox-on" size={57} style={{ left: 40, top: 280 }} />
    </>
  );
}

function Bubble({ className, tail }: { className: string; tail: "left" | "right" }) {
  const t = useTranslations("onboarding");
  return (
    <span
      className={`t-subheadline-em absolute whitespace-nowrap border border-border bg-surface px-3.5 py-2.5 shadow-(--shadow-card-soft) rounded-t-(--radius-card-inner) ${
        tail === "left" ? "rounded-br-(--radius-card-inner) rounded-bl-(--radius-s)" : "rounded-bl-(--radius-card-inner) rounded-br-(--radius-s)"
      } ${className}`}
    >
      {t("bubble")}
    </span>
  );
}

/** Intro 2: maskot dengan gelembung ucapan Siri. */
export function IntroHero2() {
  return (
    <>
      <Mascot rotate={4} className="absolute left-1/2 top-47 -translate-x-1/2 -translate-y-1/2" />
      <Ornament icon="mic" size={68} rotate={-11} style={{ left: 20, top: 56 }} />
      <Bubble tail="right" className="right-3 top-15" />
      <Bubble tail="left" className="left-7 top-67" />
      <Ornament icon="checkbox-on" size={64} tone="dark" rotate={9} style={{ left: 280, top: 302 }} />
      <Ornament icon="nav-tasks" size={45} rotate={8} style={{ left: 47, top: 330 }} />
      <Ornament icon="nav-notes" size={40} tone="accent" rotate={15} style={{ left: 239, top: -2 }} />
    </>
  );
}

/** Intro 3: maskot dengan ikon modul. */
export function IntroHero3() {
  return (
    <>
      <Mascot rotate={3} className="absolute left-1/2 top-47 -translate-x-1/2 -translate-y-1/2" />
      <Ornament icon="nav-tasks" size={72} style={{ left: 14, top: 50 }} />
      <Ornament icon="nav-finance" size={42} tone="dark" rotate={7} style={{ left: 297, top: 18 }} />
      <Ornament icon="nav-notes" size={72} style={{ left: 284, top: 280 }} />
      <Ornament icon="chart-line" size={56} tone="dark" rotate={7} style={{ left: 26, top: 300 }} />
    </>
  );
}
