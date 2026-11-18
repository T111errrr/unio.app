import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { AuthShell } from "@/components/auth/AuthShell";
import { LinkButton } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export default async function WelcomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return (
    <AuthShell speech={t("speechWelcome")}>
      <AuthBrand />
      <div className="flex flex-col gap-2">
        <h1 className="t-large-title">{t("welcomeTitle")}</h1>
        <p className="t-title-1 font-serif italic">{t("welcomeAccent")}</p>
        <p className="t-body text-ink-secondary">{t("welcomeBody")}</p>
      </div>
      <div className="flex flex-col gap-3">
        <LinkButton href="/signup">{t("createAccount")}</LinkButton>
        <LinkButton href="/login" variant="secondary">
          {t("haveAccount")}
        </LinkButton>
      </div>
      <p className="t-footnote text-ink-tertiary">{t("welcomeNote")}</p>
    </AuthShell>
  );
}
