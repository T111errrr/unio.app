import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/ForgotForm";
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
        <h1 className="t-large-title">{t("forgotTitle")}</h1>
        <p className="t-body text-ink-secondary">{t("forgotBody")}</p>
      </div>
      <ForgotForm />
      <p className="t-subheadline flex justify-center gap-1.5 text-ink-secondary">
        {t("rememberPassword")}
        <Link href="/login" className="t-subheadline-em relative text-ink before:absolute before:-inset-3 before:content-['']">
          {t("signIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
