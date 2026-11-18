import { getTranslations } from "next-intl/server";

export async function AuthBrand() {
  const t = await getTranslations("app");
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden="true" className="flex size-9 items-center justify-center gap-1 rounded-(--radius-l) bg-accent">
        <span className="h-3 w-1 rounded-(--radius-xs) bg-on-accent" />
        <span className="h-3 w-1 rounded-(--radius-xs) bg-on-accent" />
      </span>
      <span className="t-headline">{t("name")}</span>
    </div>
  );
}
