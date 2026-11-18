import type { ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/** Layar auth: bila sudah masuk, langsung ke Today. */
export default async function AuthLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (hasSupabaseEnv()) {
    const { data } = await (await createClient()).auth.getUser();
    if (data.user) redirect({ href: "/today", locale });
  }
  return children;
}
