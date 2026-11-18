# Unio — aturan proyek untuk Claude Code

Unio ("One app for your everything.") adalah planner all-in-one: tugas, keuangan, catatan, dan recap.
Pemilik proyek: Jeff, desainer UI/UX **tanpa pengalaman koding**. Jelaskan hasil kerja dengan bahasa
Indonesia sederhana, tanpa jargon, dan selalu sebutkan cara mengeceknya di link preview.

## Sumber kebenaran

1. **Desain:** file Figma `4Ahe1gJdFOTNXZ274mEct9` (baca lewat Figma MCP). Peta layar dan komponen: `docs/handoff/figma-map.md`.
2. **Rencana & urutan kerja:** `docs/handoff/tugas.md` (41 tugas, 5 fase). Kerjakan satu ID tugas per branch/PR.
3. **Produk:** `docs/handoff/produk.md` (ringkasan PRD + keputusan).
4. Bila desain dan dokumen berbeda, **desain Figma yang menang**; catat perbedaannya di deskripsi PR.

## Stack (jangan diganti tanpa persetujuan Jeff)

- Next.js (App Router) + TypeScript strict + Tailwind CSS, sebagai PWA.
- Supabase: Auth, Postgres + RLS, Edge Functions + Cron. Migrasi di `supabase/migrations/`.
- TanStack Query (optimistic update), Zod (validasi dipakai bersama UI dan API), next-intl (ID + EN).
- Hosting Vercel Hobby. **Semua layanan harus tetap di paket gratis** — jangan menambah layanan berbayar
  atau dependensi yang butuh akun baru tanpa bertanya dulu.

## Struktur

```
app/[locale]/(auth)/…        masuk, daftar, lupa password, onboarding
app/[locale]/(app)/…         today, tasks, finance, notes, recap, inbox, settings
app/api/capture|summary|shortcuts/route.ts
components/ui/               komponen dasar (1 file per komponen Figma)
components/<modul>/          komponen khusus modul
lib/                         supabase client, query, zod schema, parser capture, format rupiah/tanggal
messages/id.json, en.json    semua teks UI
styles/tokens.css            token dari Figma (JANGAN ubah nilainya di kode)
supabase/migrations/, supabase/tests/
```

## Aturan UI (wajib)

- **Token saja.** Warna, radius, spacing, bayangan, font, durasi animasi memakai variabel di `tokens.css`
  (hubungkan ke tema Tailwind). Tidak ada hex, px radius, atau ukuran font liar di komponen.
- **Tema:** `data-theme="light|dark|system"` di `<html>`, tersimpan di profil + localStorage, tanpa kedip saat muat.
- **Tata letak responsif:** < 768 px = mobile (tab bar melayang + tombol tangkap); 768–1279 px = desktop dengan
  Sidebar Rail 72 px + drawer; ≥ 1280 px = desktop dengan Sidebar 248 px. Acuan frame Figma: 390, 1264, 1440.
- **Lima state per layar:** Default, Loading (skeleton), Empty, Error, Belum tersinkron. Semuanya ada di Figma.
- **Dua bahasa:** tidak ada teks UI yang ditulis langsung di komponen; semua lewat `messages/*.json`.
  Default `id`. Teks Indonesia mengikuti Figma persis; tambahkan padanan Inggris yang ringkas.
- **Area tap minimal 44×44 px** untuk semua yang bisa ditekan (tampilan boleh lebih kecil, area tekan tidak).
- **Judul navbar mobile selalu di tengah:** slot kiri dan kanan tetap 44 px walau ikonnya disembunyikan.
- **Font:** `var(--font-sans)` (font sistem; Inter sebagai cadangan lewat `next/font`) dan Instrument Serif Italic
  untuk aksen. **Jangan** mengirim SF Pro sebagai webfont dan **jangan** memakai glyph SF Symbols — lisensinya
  hanya untuk platform Apple. Ikon memakai Lucide sesuai `docs/handoff/icon-map.md`.
- **Emoji** hanya untuk konten buatan pengguna (kategori, list). Ornamen/ikon antarmuka memakai ikon garis.
- **Gerak:** kurva dan durasi dari token (`--ease-ios`, dst.). Sheet/dialog naik dari bawah di mobile; modal di
  tengah + drawer kanan di desktop; Esc dan klik di luar menutup. Hormati `prefers-reduced-motion` dan
  pengaturan "Kurangi gerakan".
- **Aksesibilitas:** kontras teks ≥ 4.5:1, fokus keyboard terlihat, label untuk tombol ikon, urutan tab logis.
- **Shortcut desktop gaya Windows:** Ctrl+K pencarian, Ctrl+N catat cepat, Esc tutup.

## Aturan data

- Uang = bilangan bulat rupiah (`bigint`), tampil dengan `Intl.NumberFormat('id-ID')`. Tidak ada float.
- Semua tabel ber-RLS; client hanya memakai anon key. Service role **hanya** di route server (`/api/*`),
  tidak pernah di kode client, tidak pernah di-commit.
- Hapus = soft delete (`deleted_at`) + Undo 5 detik; pulih dari Recently Deleted sampai 30 hari.
- Simpan dulu tampil dulu (optimistic); bila gagal tampilkan status "Belum tersinkron" + Coba lagi.
- API Shortcuts: header `x-api-key` (disimpan sebagai hash SHA-256), `request_id` untuk anti entri ganda,
  batas 60 permintaan/menit per key.
- Rahasia hanya di Environment Variables Vercel / `.env.local` (lihat `.env.example`). Jangan commit `.env*`.

## Cara kerja

1. Baca tugas di `docs/handoff/tugas.md`, buka frame Figma terkait (ID di `figma-map.md`) sebelum menulis kode.
2. Branch `tugas/<id>-<nama-singkat>`, commit kecil berbahasa Indonesia, satu PR per tugas.
3. Sebelum membuka PR jalankan: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
   Untuk perubahan skema: jalankan `supabase/tests/rls_check.sql` di database uji.
4. Deskripsi PR: apa yang berubah, layar mana yang perlu dicek Jeff (light + dark, 390 / 1264 / 1440),
   dan apa yang belum selesai. Jangan menyatakan selesai bila ada tes gagal.
5. Jangan menghapus data, mengganti skema yang sudah berisi data, atau menjalankan perintah yang tidak bisa
   dibatalkan tanpa persetujuan Jeff.
6. Hal di luar scope v1 (lihat `produk.md`) tidak dikerjakan; catat sebagai ide v1.5.
