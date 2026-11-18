import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SettingsScreen } from "@/components/settings/SettingsScreen";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <SettingsScreen />
    </Suspense>
  );
}
