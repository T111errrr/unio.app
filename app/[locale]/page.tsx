import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold text-ink">{t("name")}</h1>
        <p className="text-ink-tertiary">{t("tagline")}</p>
      </div>
      <LanguageSwitcher />
    </main>
  );
}
