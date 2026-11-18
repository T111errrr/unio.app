"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Ornament } from "./Ornament";
import { SplitScreen } from "./SplitScreen";
import type { TopBarProps } from "./TopBar";

type Props = {
  topBar: TopBarProps;
  /** `blocked` = izin ditolak di browser (Figma: Notifikasi diblokir). */
  blocked: boolean;
  onAllow: () => void;
  onLater: () => void;
};

function NotifCard({
  icon,
  n,
  rotate,
  faded,
  className,
}: {
  icon: IconName;
  n: 1 | 2 | 3;
  rotate: number;
  faded?: boolean;
  className: string;
}) {
  const t = useTranslations("onboarding");
  return (
    <div
      className={`absolute flex items-center gap-3 rounded-(--radius-xl) border border-border bg-surface py-3 pl-3.5 pr-4 shadow-(--shadow-card-elevated) ${faded ? "opacity-60" : ""} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-(--radius-l) bg-surface-inset">
        <Icon name={icon} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="t-caption-1 text-ink-tertiary">{t(`sampleNotif${n}Meta`)}</span>
        <span className="t-headline truncate">{t(`sampleNotif${n}Title`)}</span>
        <span className="t-footnote truncate text-ink-secondary">{t(`sampleNotif${n}Body`)}</span>
      </span>
    </div>
  );
}

/** Tiga notifikasi contoh bertumpuk + ornamen. Dipakai di layar sempit dan panel desktop. */
function NotifStack() {
  return (
    <div className="relative mx-auto h-full min-h-72 w-full max-w-110">
      <NotifCard icon="chart-pie" n={1} rotate={3} faded className="left-[8%] top-[18%] w-[76%]" />
      <NotifCard icon="notifications" n={2} rotate={-2} className="left-[4%] top-[34%] w-[84%]" />
      <NotifCard icon="nav-finance" n={3} rotate={1} className="left-0 top-[52%] w-[92%]" />
      <Ornament icon="notifications" size={64} tone="dark" rotate={-8} style={{ right: "8%", top: "6%" }} />
      <Ornament icon="checkbox-on" size={44} rotate={6} style={{ left: "6%", top: "8%" }} />
      <Ornament icon="chart-line" size={40} rotate={-6} style={{ right: "4%", bottom: "12%" }} />
      <Ornament icon="nav-finance" size={52} tone="dark" rotate={8} style={{ left: "10%", bottom: "6%" }} />
    </div>
  );
}

/** Izin notifikasi dan keadaan "diblokir". */
export function NotificationScreen({ topBar, blocked, onAllow, onLater }: Props) {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  return (
    <SplitScreen
      topBar={topBar}
      mobileVisual={<NotifStack />}
      desktopVisual={<NotifStack />}
      title={blocked ? t("notifBlockedTitle") : t("notifTitle")}
      body={blocked ? t("notifBlockedBody") : t("notifBody")}
      extra={blocked ? <Badge type="warning">{t("notifBlockedBadge")}</Badge> : undefined}
      actions={
        <>
          <Button onClick={onAllow}>{blocked ? tc("retry") : t("notifAllow")}</Button>
          <Button variant="ghost" onClick={onLater}>
            {blocked ? t("notifContinue") : t("later")}
          </Button>
        </>
      }
    />
  );
}
