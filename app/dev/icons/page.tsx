import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ICONS, type IconName } from "@/components/ui/icon-registry";

export const metadata = { title: "Ikon — dev" };

/** Halaman cek visual ikon. Hanya untuk preview/dev, tidak tampil di produksi. */
export default function IconsDevPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const names = Object.keys(ICONS) as IconName[];

  return (
    <main className="min-h-dvh bg-background p-6 text-ink">
      <h1 className="mb-1 text-2xl font-semibold">Ikon ({names.length})</h1>
      <p className="mb-6 text-ink-secondary">Nama semantik → ikon Lucide. Baris atas: 4 ukuran. Kanan: versi isi penuh.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {names.map((name) => (
          <li key={name} className="flex flex-col gap-3 rounded-(--radius-m) bg-surface p-4 shadow-(--shadow-card-soft)">
            <div className="flex items-end gap-3">
              <Icon name={name} size="small" />
              <Icon name={name} size="medium" />
              <Icon name={name} size="large" />
              <Icon name={name} size="xlarge" />
              <span className="ml-auto text-accent">
                <Icon name={name} size="large" filled />
              </span>
            </div>
            <code className="text-xs text-ink-tertiary">{name}</code>
          </li>
        ))}
      </ul>
    </main>
  );
}
