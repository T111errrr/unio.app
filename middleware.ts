import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseEnv } from "./lib/supabase/env";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  if (!hasSupabaseEnv()) return response;

  // Segarkan sesi login (token dipakai ulang di Server Component) dan tulis cookie barunya ke respons.
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Lewati API, file internal Next/Vercel, dan semua file statis (yang punya titik: manifest, ikon, dst.)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
