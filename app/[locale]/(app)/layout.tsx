import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/** Area app: wajib login. Bila Supabase belum diatur (mis. pratinjau awal), kerangka tetap tampil. */
export default async function AppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (hasSupabaseEnv()) {
    const { data } = await (await createClient()).auth.getUser();
    if (!data.user) redirect({ href: "/welcome", locale });
  }
  return <AppShell>{children}</AppShell>;
}
