import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { TodayScreen } from "@/components/today/TodayScreen";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <TodayScreen />
    </Suspense>
  );
}
