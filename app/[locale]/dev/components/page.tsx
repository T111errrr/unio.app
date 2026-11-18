import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Gallery } from "./Gallery";

export const metadata = { title: "Komponen — dev" };

/** Halaman cek visual komponen dasar. Hanya untuk preview/dev, tidak tampil di produksi. */
export default async function ComponentsDevPage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  return <Gallery />;
}
