import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/i18n/navigation";

/** State "Tautan terkirim": dipakai setelah Lupa password dan setelah Daftar (bila konfirmasi email aktif). */
export function CheckEmailNotice({ email, kind }: { email: string; kind: "reset" | "confirm" }) {
  const t = useTranslations("auth");
  return (
    <div role="status" className="flex flex-col gap-4">
      <span className="flex size-14 items-center justify-center rounded-(--radius-control) bg-field">
        <Icon name="nav-inbox" size="large" />
      </span>
      <h2 className="t-title-1">{t(kind === "reset" ? "linkSentTitle" : "confirmTitle")}</h2>
      <p className="t-body text-ink-secondary">{t(kind === "reset" ? "linkSentBody" : "confirmBody", { email })}</p>
      <Link href="/login" className="t-body-em relative self-start before:absolute before:-inset-3 before:content-['']">
        {t("backToSignIn")}
      </Link>
    </div>
  );
}
