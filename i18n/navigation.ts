import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Pakai ini (bukan next/link / next/navigation) agar tautan otomatis membawa bahasa aktif.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
