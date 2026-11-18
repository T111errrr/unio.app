"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { markOnboardingFinished, requestNotificationPermission, saveNotificationChoice } from "@/lib/onboarding";
import { InstallScreen } from "./InstallScreen";
import { IntroHero1, IntroHero2, IntroHero3 } from "./IntroHeroes";
import { IntroScreen } from "./IntroScreen";
import { NotificationScreen } from "./NotificationScreen";

type Step = "intro1" | "intro2" | "intro3" | "install" | "notif" | "blocked";

/** Alur onboarding satu halaman: Intro 1–3 → Pasang aplikasi → Izin notifikasi (→ Diblokir). */
export function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro1");

  const finish = (status: "done" | "skipped") => {
    markOnboardingFinished(status);
    router.replace("/today");
  };

  const allow = async () => {
    const result = await requestNotificationPermission();
    saveNotificationChoice(result);
    if (result === "granted") finish("done");
    else if (result === "denied" || result === "unsupported") setStep("blocked");
  };

  const skipButton = (to: Step) => (
    <Button variant="ghost" onClick={() => setStep(to)}>
      {t("skip")}
    </Button>
  );

  switch (step) {
    case "intro1":
      return (
        <IntroScreen
          topBar={{ leading: "close", leadingLabel: t("skipAll"), onLeading: () => setStep("install"), total: 3, current: 0 }}
          hero={<IntroHero1 />}
          title={t("intro1Title")}
          accent={t("intro1Accent")}
          body={t("intro1Body")}
          primaryLabel={t("start")}
          onPrimary={() => setStep("intro2")}
          secondary={skipButton("install")}
        />
      );
    case "intro2":
      return (
        <IntroScreen
          topBar={{ leading: "back", leadingLabel: tc("back"), onLeading: () => setStep("intro1"), total: 3, current: 1 }}
          hero={<IntroHero2 />}
          title={t("intro2Title")}
          accent={t("intro2Accent")}
          body={t("intro2Body")}
          centered
          chips={
            <>
              <Chip style="selected">{t("chipMoney")}</Chip>
              <Chip>{tn("tasks")}</Chip>
              <Chip>{tn("notes")}</Chip>
            </>
          }
          primaryLabel={t("next")}
          onPrimary={() => setStep("intro3")}
          secondary={skipButton("install")}
        />
      );
    case "intro3":
      return (
        <IntroScreen
          topBar={{ leading: "back", leadingLabel: tc("back"), onLeading: () => setStep("intro2"), total: 3, current: 2 }}
          hero={<IntroHero3 />}
          title={t("intro3Title")}
          accent={t("intro3Accent")}
          body={t("intro3Body")}
          centered
          chips={
            <>
              <Chip>{tn("tasks")}</Chip>
              <Chip style="selected">{tn("finance")}</Chip>
              <Chip>{tn("notes")}</Chip>
            </>
          }
          primaryLabel={t("startNow")}
          onPrimary={() => setStep("install")}
          secondary={
            <p className="t-subheadline flex items-center gap-1 text-ink-secondary">
              {t("haveAccount")}
              <Link href="/login" className="t-subheadline-em inline-flex min-h-11 items-center text-ink">
                {t("signIn")}
              </Link>
            </p>
          }
        />
      );
    case "install":
      return (
        <InstallScreen
          topBar={{ leading: "close", leadingLabel: tc("close"), onLeading: () => setStep("notif"), total: 2, current: 0 }}
          onContinue={() => setStep("notif")}
          onLater={() => setStep("notif")}
        />
      );
    case "notif":
    case "blocked":
      return (
        <NotificationScreen
          topBar={{ leading: "back", leadingLabel: tc("back"), onLeading: () => setStep("install"), total: 2, current: 1 }}
          blocked={step === "blocked"}
          onAllow={allow}
          onLater={() => {
            saveNotificationChoice("skipped");
            finish(step === "blocked" ? "done" : "skipped");
          }}
        />
      );
  }
}
