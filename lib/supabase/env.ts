/** Kunci publik Supabase (aman di browser). Kosong = belum diatur di Vercel / .env.local. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function hasSupabaseEnv() {
  return SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
}
