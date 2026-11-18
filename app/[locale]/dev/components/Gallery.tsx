"use client";

// Halaman dev: teks di sini sengaja ditulis langsung (bukan lewat messages/*.json) karena hanya contoh.

import { useState, type ReactNode } from "react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Badge, type BadgeType } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { ListRow } from "@/components/ui/ListRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { SelectField, TextField } from "@/components/ui/TextField";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="t-title-3 text-ink">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

const BADGES: BadgeType[] = ["neutral", "info", "success", "warning", "danger", "paylater", "transfer", "notSynced"];

export function Gallery() {
  const [seg2, setSeg2] = useState<"todo" | "done">("todo");
  const [seg3, setSeg3] = useState<"a" | "b" | "c">("b");
  const [on, setOn] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [danger, setDanger] = useState(false);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  const changeTheme = (value: "system" | "light" | "dark") => {
    setTheme(value);
    document.documentElement.dataset.theme = value;
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 bg-background p-6 text-ink">
      <header className="flex flex-col gap-4">
        <h1 className="t-title-1">Komponen dasar</h1>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Tema"
            value={theme}
            onChange={changeTheme}
            options={[
              { value: "system", label: "Sistem" },
              { value: "light", label: "Terang" },
              { value: "dark", label: "Gelap" },
            ]}
          />
          <LanguageSwitcher />
        </div>
      </header>

      <Section title="Button">
        <div className="flex w-80 flex-col gap-3">
          <Button icon="add">Primary</Button>
          <Button variant="secondary" icon="add">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Primary disabled</Button>
          <Button variant="secondary" disabled>Secondary disabled</Button>
          <Button tone="destructive">Hapus</Button>
        </div>
      </Section>

      <Section title="Icon Button">
        <IconButton icon="add" label="Tambah" />
        <IconButton icon="add" label="Tambah" variant="primary" />
        <IconButton icon="add" label="Tambah" disabled />
        <IconButton icon="add" label="Tambah" variant="primary" disabled />
      </Section>

      <Section title="Text Field">
        <div className="flex w-80 flex-col gap-4">
          <TextField label="Label" placeholder="Contoh: Superbank" helper="Teks bantuan opsional" />
          <TextField label="Terisi" defaultValue="Bank Jago" />
          <TextField label="Galat" defaultValue="" error="Wajib diisi" />
          <TextField label="Nonaktif" placeholder="Tidak bisa diubah" disabled />
          <TextField label="Nominal" kind="currency" placeholder="0" />
          <SelectField label="Tipe" defaultValue="">
            <option value="" disabled>Pilih tipe</option>
            <option value="bank">Bank</option>
            <option value="ewallet">E-wallet</option>
          </SelectField>
        </div>
      </Section>

      <Section title="Segmented Control">
        <div className="flex w-80 flex-col gap-3">
          <SegmentedControl
            label="2 segmen"
            value={seg2}
            onChange={setSeg2}
            options={[
              { value: "todo", label: "To do" },
              { value: "done", label: "Completed" },
            ]}
          />
          <SegmentedControl
            label="3 segmen dengan ikon"
            value={seg3}
            onChange={setSeg3}
            options={[
              { value: "a", label: "To do", icon: "nav-tasks" },
              { value: "b", label: "Completed", icon: "check" },
              { value: "c", label: "Pending", icon: "clock" },
            ]}
          />
        </div>
      </Section>

      <Section title="Chip">
        <Chip>NOV</Chip>
        <Chip showChevron>NOV</Chip>
        <Chip style="selected" showChevron>NOV</Chip>
        <div className="rounded-(--radius-l) bg-card-dark p-3">
          <Chip style="onDark" showChevron>NOV</Chip>
        </div>
        <Chip onClick={() => undefined}>Bisa ditekan</Chip>
      </Section>

      <Section title="Toggle">
        <Toggle checked={on} onCheckedChange={setOn} label="Contoh" />
        <Toggle checked={false} label="Mati" />
        <Toggle checked disabled label="Nonaktif nyala" />
        <Toggle checked={false} disabled label="Nonaktif mati" />
      </Section>

      <Section title="Badge">
        {BADGES.map((type) => (
          <Badge key={type} type={type}>{type}</Badge>
        ))}
        <Badge type="success" icon="income">Pemasukan</Badge>
      </Section>

      <Section title="Progress Bar">
        <div className="flex w-80 flex-col gap-4">
          <ProgressBar label="Makan & minum" valueText="Rp420 rb / 1 jt" ratio={0.42} />
          <ProgressBar label="Makan & minum" valueText="Rp840 rb / 1 jt" ratio={0.84} />
          <ProgressBar label="Makan & minum" valueText="Rp1,1 jt / 1 jt" ratio={1.1} />
        </div>
      </Section>

      <Section title="Card">
        <Card title="Judul kartu" inset className="w-80">
          <p className="t-body">Isi kartu terang</p>
        </Card>
        <Card style="dark" title="Judul kartu" inset className="w-80">
          <p className="t-body">Isi kartu gelap</p>
        </Card>
      </Section>

      <Section title="List Row">
        <div className="w-80">
          <ListRow title="Notifikasi" leadingIcon="notifications" trailing="chevron" onClick={() => undefined} />
          <ListRow title="Bahasa" leadingIcon="list" trailing="value" value="Indonesia" onClick={() => undefined} />
          <ListRow title="Pengingat" leadingIcon="clock" trailing="toggle" checked={on} onCheckedChange={setOn} />
          <ListRow title="Terang" trailing="check" checked onClick={() => undefined} showDivider={false} />
        </div>
      </Section>

      <Section title="Toast">
        <Toast message="Tersimpan: Kopi Rp25.000" actionLabel="Undo" onAction={() => undefined} />
        <Toast type="notSynced" message="Belum tersinkron" actionLabel="Coba lagi" onAction={() => undefined} />
        <Toast type="error" message="Gagal menyimpan" actionLabel="Retry" onAction={() => undefined} />
      </Section>

      <Section title="Dialog dan Sheet">
        <Button fullWidth={false} variant="secondary" onClick={() => setConfirm(true)}>Dialog konfirmasi</Button>
        <Button fullWidth={false} variant="secondary" onClick={() => setDanger(true)}>Dialog hapus</Button>
        <Button fullWidth={false} variant="secondary" onClick={() => setSheet(true)}>Sheet</Button>
      </Section>

      <Section title="Empty State dan Skeleton">
        <EmptyState
          className="w-80"
          icon="nav-finance"
          title="Belum ada transaksi"
          description="Catat pengeluaran pertamamu."
          actionLabel="Catat sekarang"
          onAction={() => undefined}
        />
        <div className="flex w-80 flex-col gap-2">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </Section>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Buang perubahan?"
        message="Perubahan yang belum disimpan akan hilang."
        confirmLabel="Buang"
        onConfirm={() => setConfirm(false)}
      />
      <Dialog
        open={danger}
        onClose={() => setDanger(false)}
        type="destructive"
        title="Hapus transaksi?"
        message="Transaksi dipindah ke Recently Deleted dan bisa dipulihkan 30 hari."
        confirmLabel="Hapus"
        onConfirm={() => setDanger(false)}
      />
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Catat cepat">
        <TextField label="Nominal" kind="currency" placeholder="0" />
        <Button onClick={() => setSheet(false)}>Simpan</Button>
      </Sheet>
    </main>
  );
}
