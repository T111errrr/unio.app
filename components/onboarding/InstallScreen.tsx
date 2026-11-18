"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Ornament } from "./Ornament";
import { SplitScreen } from "./SplitScreen";
import type { TopBarProps } from "./TopBar";

type Props = { topBar: TopBarProps; onContinue: () => void; onLater: () => void };

const TILES: IconName[] = [
  "calendar", "app-camera", "app-compass", "app-cloud",
  "app-media", "edit", "app-message", "nav-settings",
  "chart-line", "clock", "add" /* diganti ikon Unio */, "app-briefcase",
  "app-phone", "app-photo", "folder", "cat-shopping",
];

function PhoneIllustration() {
  const t = useTranslations("onboarding");
  return (
    <div className="relative mx-auto h-85 w-full max-w-90">
      <div className="absolute left-1/2 top-0 size-90 -translate-x-1/2 rounded-(--radius-full) bg-[radial-gradient(circle,var(--unio-halo),var(--unio-halo-clear)_70%)]" />
      <div className="absolute left-1/2 top-3.5 grid h-74 w-59 -translate-x-1/2 grid-cols-4 content-start gap-x-3.5 gap-y-5 overflow-hidden rounded-(--radius-card) border border-border bg-surface-inset p-3 shadow-(--shadow-card-soft)">
        {TILES.map((icon, index) =>
          index === 10 ? (
            <span key={icon + index} className="flex size-12 items-center justify-center gap-1 rounded-(--radius-l) border-2 border-dashed border-ink bg-card-dark">
              <span className="h-3.5 w-1 rounded-(--radius-xs) bg-on-card-dark" />
              <span className="h-3.5 w-1 rounded-(--radius-xs) bg-on-card-dark" />
            </span>
          ) : (
            <span key={icon + index} className="flex size-10.5 items-center justify-center rounded-(--radius-l) border border-border bg-surface shadow-(--shadow-card-soft)">
              <Icon name={icon} />
            </span>
          ),
        )}
      </div>
      <Ornament icon="export" size={52} tone="dark" style={{ right: 20, top: 32 }} />
      <Ornament icon="magic" size={52} style={{ left: 7, top: 169 }} />
      <div className="absolute left-1/2 top-65 flex w-62.5 -translate-x-1/2 items-center gap-2.5 rounded-(--radius-card-inner) border border-border bg-surface px-3 py-2.5 shadow-(--shadow-card-elevated)">
        <Icon name="add" />
        <div className="flex flex-col">
          <span className="t-subheadline-em">{t("addToHome")}</span>
          <span className="t-footnote text-ink-secondary">{t("addToHomeSub")}</span>
        </div>
      </div>
    </div>
  );
}

function LaptopIllustration() {
  const t = useTranslations("onboarding");
  return (
    <>
      <Ornament icon="device-phone" size={48} rotate={6} style={{ left: 40, top: 40 }} />
      <div className="absolute left-4 top-24 w-110 overflow-hidden rounded-(--radius-control) border border-border bg-surface shadow-(--shadow-card-elevated)">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-(--radius-full) bg-expense" />
          <span className="size-2.5 rounded-(--radius-full) bg-warning" />
          <span className="size-2.5 rounded-(--radius-full) bg-income" />
          <span className="flex flex-1 items-center gap-2 rounded-(--radius-full) bg-field py-1.5 pl-3 pr-2">
            <Icon name="lock" size="small" />
            <span className="t-footnote flex-1 text-ink-secondary">{t("browserUrl")}</span>
            <span className="flex size-6.5 items-center justify-center rounded-(--radius-m) bg-card-dark text-on-card-dark">
              <Icon name="add" size="small" />
            </span>
          </span>
        </div>
        <div className="flex h-68 gap-3 p-4">
          <span className="w-28 rounded-(--radius-l) bg-surface-inset" />
          <span className="flex-1 rounded-(--radius-l) bg-surface-inset" />
        </div>
      </div>
      <div className="absolute left-40 top-52 flex w-75 flex-col gap-3 rounded-(--radius-card-inner) border border-border bg-surface p-5 shadow-(--shadow-card-elevated)">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center gap-1 rounded-(--radius-m) bg-card-dark">
            <span className="h-3 w-1 rounded-(--radius-xs) bg-on-card-dark" />
            <span className="h-3 w-1 rounded-(--radius-xs) bg-on-card-dark" />
          </span>
          <span className="t-headline">{t("installPrompt")}</span>
        </div>
        <div className="flex gap-2">
          <span className="t-body-em flex h-12 flex-1 items-center justify-center rounded-(--radius-control) border border-border bg-surface shadow-(--shadow-surface-floating)">{t("installCancel")}</span>
          <span className="t-body-em flex h-12 flex-1 items-center justify-center rounded-(--radius-control) bg-accent text-on-accent shadow-(--shadow-button-bevel)">{t("installConfirm")}</span>
        </div>
      </div>
      <Ornament icon="checkbox-on" size={40} tone="dark" rotate={-6} style={{ right: 20, bottom: 80 }} />
    </>
  );
}

function LaptopSteps() {
  const t = useTranslations("onboarding");
  const steps: { text: string; icon: IconName }[] = [
    { text: t("installStep1"), icon: "add" },
    { text: t("installStep2"), icon: "check" },
    { text: t("installStep3"), icon: "home" },
  ];
  return (
    <ol className="hidden flex-col rounded-(--radius-card) border border-border bg-surface px-4 lg:flex">
      {steps.map((step, i) => (
        <li key={step.text} className={`flex items-center gap-3 py-3.5 ${i < steps.length - 1 ? "border-b border-border" : ""}`}>
          <span className="t-footnote-em flex size-7 shrink-0 items-center justify-center rounded-(--radius-full) bg-card-dark text-on-card-dark">{i + 1}</span>
          <span className="t-subheadline flex-1">{step.text}</span>
          <span className="text-ink-secondary">
            <Icon name={step.icon} size="small" />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Pasang aplikasi: iPhone (Add to Home Screen) di layar sempit, laptop (Install app) di layar lebar. */
export function InstallScreen({ topBar, onContinue, onLater }: Props) {
  const t = useTranslations("onboarding");
  return (
    <SplitScreen
      topBar={topBar}
      mobileVisual={<PhoneIllustration />}
      desktopVisual={<LaptopIllustration />}
      title={
        <>
          <span className="lg:hidden">{t("installPhoneTitle")}</span>
          <span className="hidden lg:inline">{t("installLaptopTitle")}</span>
        </>
      }
      body={
        <>
          <span className="lg:hidden">{t("installPhoneBody")}</span>
          <span className="hidden lg:inline">{t("installLaptopBody")}</span>
        </>
      }
      extra={<LaptopSteps />}
      actions={
        <>
          <Button onClick={onContinue}>{t("installDone")}</Button>
          <Button variant="ghost" onClick={onLater}>
            {t("later")}
          </Button>
        </>
      }
    />
  );
}
