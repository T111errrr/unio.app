"use client";

import { useTranslations } from "next-intl";

export function Brand() {
  const t = useTranslations("app");
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden="true" className="flex size-9 items-center justify-center gap-1 rounded-(--radius-l) bg-card-dark">
        <span className="h-3 w-1 rounded-(--radius-xs) bg-on-card-dark" />
        <span className="h-3 w-1 rounded-(--radius-xs) bg-on-card-dark" />
      </span>
      <span className="t-headline">{t("name")}</span>
    </div>
  );
}
