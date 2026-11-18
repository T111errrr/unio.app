import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="t-title-1">{t("finance")}</h1>
    </div>
  );
}
