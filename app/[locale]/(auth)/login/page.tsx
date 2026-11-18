import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return (
    <AuthShell speech={t("speechBack")}>
      <AuthBrand />
      <div className="flex flex-col gap-1">
        <h1 className="t-large-title">{t("signIn")}</h1>
        <p className="t-body text-ink-secondary">{t("signInSubtitle")}</p>
      </div>
      <LoginForm />
      <p className="t-subheadline flex justify-center gap-1.5 text-ink-secondary">
        {t("noAccount")}
        <Link href="/signup" className="t-subheadline-em relative text-ink before:absolute before:-inset-3 before:content-['']">
          {t("signUp")}
        </Link>
      </p>
    </AuthShell>
  );
}
