import { setRequestLocale } from "next-intl/server";
import { AppearanceSettings } from "@/components/layout/AppearanceSettings";

type Props = { params: Promise<{ locale: string }> };

export default async function AppearancePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AppearanceSettings />;
}
