import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <h1 className="t-title-1">{t("nav.settings")}</h1>
      {/* Sementara: daftar lengkap pengaturan dibuat di fase berikutnya. */}
      <Link
        href="/settings/appearance"
        className="flex min-h-13 items-center rounded-(--radius-card) bg-surface px-4 shadow-(--shadow-card-soft)"
      >
        {t("theme.title")}
      </Link>
    </div>
  );
}
