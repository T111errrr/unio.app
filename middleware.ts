import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Lewati API, file internal Next/Vercel, dan semua file statis (yang punya titik: manifest, ikon, dst.)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
