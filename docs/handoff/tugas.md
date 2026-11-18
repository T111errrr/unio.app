# Daftar tugas Unio v1

Sumber: tab "Daftar tugas" di dokumen Unio — Rencana Dev v1 (status terbaru ada di sana).
Satu baris = satu sesi Claude Code = satu branch + PR. Kerjakan berurutan; gate fase harus lolos sebelum lanjut.
Node Figma per layar ada di `figma-map.md`.

Status awal 16 Nov 2026: **siap** = bahannya sudah ada di repo ini dan tinggal dipasang/diverifikasi.

## Fase 1 · Fondasi (minggu 1–3)

| ID | Tugas | Selesai bila | Catatan |
| --- | --- | --- | --- |
| 1.01 | Akun GitHub, Vercel, Supabase + repo privat `unio` | Repo terhubung ke Vercel, link preview muncul | Dikerjakan Jeff, lihat `00-mulai-di-sini.md` |
| 1.02 | Next.js + TypeScript + Tailwind + manifest PWA | App kosong bisa dipasang di Home Screen iPhone | **kerangka ditulis manual (belum diverifikasi build — sandbox tanpa npm).** Next 15, Tailwind 4, manifest + ikon PWA. Verifikasi: `npm install && npm run build` atau preview Vercel |
| 1.03 | CLAUDE.md (aturan proyek) | Claude Code mengikuti aturan tanpa diulang | **siap** — `CLAUDE.md` |
| 1.04 | Token Figma → tokens.css + Tailwind | Warna light/dark, spacing, radius sama dengan Figma | **siap** — `styles/tokens.css`; tinggal dihubungkan ke tema Tailwind |
| 1.05 | Set ikon pengganti SF Symbols + peta simbol | Semua ikon di desain punya padanan | **siap** — `icon-map.md`; verifikasi nama Lucide, buat `Icon.tsx` |
| 1.06 | Bahasa ID/EN (next-intl) + pilihan bahasa | Semua teks UI lewat kunci; ganti bahasa langsung jalan | Awal: `messages/id.json`, `messages/en.json` |
| 1.07 | Komponen dasar (Button, Icon Button, Text Field, Segmented, Chip, Toggle, Badge, List Row, Card, Sheet, Dialog, Toast, Skeleton, Empty State, Progress Bar) | Cocok dengan Figma di light dan dark | Buat halaman `/dev/components` (hanya non-produksi) untuk cek visual |
| 1.08 | Tata letak: tab bar mobile, sidebar desktop, Sidebar Rail + drawer | Tampilan 390 / 1264 / 1440 px sesuai Figma | Breakpoint 768 dan 1280 |
| 1.09 | Tema light/dark/sistem + layar Tampilan | Ganti tema bekerja seperti prototype | Tanpa kedip saat muat |
| 1.10 | Skema database + RLS + migrasi | Semua tabel ada; akses data akun lain ditolak | **siap** — `supabase/migrations/0001_init.sql`, sudah lolos `supabase/tests/rls_check.sql` di Postgres 16 lokal; tinggal dijalankan di Supabase |
| 1.11 | Auth: Daftar, Masuk, Lupa password + state error | Alur auth lengkap dengan state di Figma | Supabase Auth email + password |
| 1.12 | Onboarding: Intro 1–3, Pasang ke Home Screen, izin notifikasi | Sesuai Figma; status izin tersimpan | |
| 1.13 | Backup mingguan (pg_dump) + ping harian anti-jeda | Backup pertama tersimpan di repo privat | GitHub Actions; Supabase Free menjeda project setelah 7 hari sepi |

**Gate 1:** login, ganti tema, dan ganti bahasa jalan di iPhone dan laptop.

## Fase 2 · Tugas + Catat cepat (minggu 4–5)

| ID | Tugas | Selesai bila |
| --- | --- | --- |
| 2.01 | Tugas: list Kantor/Pribadi/Ide, Mendatang/Selesai | Tambah, ubah, selesai, hapus jalan; 5 state |
| 2.02 | Detail tugas (sheet / panel desktop), subtugas, prioritas, tenggat | Perubahan tersimpan otomatis |
| 2.03 | Swipe aksi + hapus dengan Undo | Hapus bisa dibatalkan dalam 5 detik |
| 2.04 | Catat cepat: pengeluaran, pemasukan, tugas, catatan | Tersimpan dalam ≤ 3 tap; toast Tersimpan muncul |
| 2.05 | Inbox untuk entri yang gagal diurai | Entri bisa dilengkapi atau dihapus |
| 2.06 | API `/api/capture` + pengurai kata kunci | 10 kalimat contoh terurai benar (tes otomatis) |
| 2.07 | API key: buat, salin, cabut, uji koneksi | Layar Shortcuts & Siri berfungsi penuh |
| 2.08 | 5 Siri Shortcuts + panduan pasang | Back Tap 2× / 3× jalan di iPhone 13 |

**Gate 2:** tugas tercatat lewat Siri dalam kurang dari 1 menit.
Catatan: 2.04 butuh kantong & kategori minimal → buat data awal sederhana di 2.04, UI lengkapnya di Fase 3.

## Fase 3 · Keuangan (minggu 6–8)

| ID | Tugas | Selesai bila |
| --- | --- | --- |
| 3.01 | Desain + koding setup awal (saldo awal, rekening) | Desain disetujui Jeff, lalu jalan di app |
| 3.02 | Kantong & Paylater: tambah, ubah, detail | Saldo = saldo awal + transaksi + transfer |
| 3.03 | Transaksi: daftar, filter, detail, ubah, hapus | 5 state; masuk Recently Deleted saat dihapus |
| 3.04 | Transfer antar kantong | Saldo kedua kantong berubah benar |
| 3.05 | Kategori + kata kunci auto-kategori | Entri Siri masuk kategori yang benar |
| 3.06 | Budget bulanan + peringatan 80% / 100% | Progress dan warna peringatan sesuai Figma |
| 3.07 | Recently Deleted 30 hari + pulihkan | Data kembali utuh setelah dipulihkan |

**Gate 3:** saldo semua kantong cocok dengan bank dan e-wallet. 3.01 butuh desain baru dari Jeff (belum ada di Figma).

## Fase 4 · Today, Catatan, Recap (minggu 9–11)

| ID | Tugas | Selesai bila |
| --- | --- | --- |
| 4.01 | Today: ringkasan, tugas, transaksi, catatan, Inbox | Sesuai Figma dengan 5 state |
| 4.02 | Catatan: teks kaya, folder, tag, sematkan, cari | Editor jalan di iPhone dan laptop |
| 4.03 | Recap harian / mingguan / bulanan + grafik | Angka cocok dengan data |
| 4.04 | Ekspor CSV | File terbuka benar di Excel |
| 4.05 | Pencarian global + palet Ctrl K | Hasil tugas, transaksi, catatan, dan perintah muncul |
| 4.06 | Daily Review | Alur Lewati dan Selesai review jalan |
| 4.07 | Web Push: budget, uang masuk/keluar, pengingat, Daily Review | Notifikasi muncul di iPhone (PWA) dan laptop |
| 4.08 | Pengaturan: Umum, Notifikasi, Data, Akun, hapus akun | Semua aksi berfungsi |
| 4.09 | QA: cek visual 3 ukuran × 2 tema, aksesibilitas, performa | Lolos checklist; skor PWA Lighthouse hijau |
| 4.10 | Rilis v1 pribadi | Terpasang di iPhone dan laptop |

**Gate 4:** semua layar lolos cek visual dan tes → rilis v1 pribadi.

## Fase 5 · Uji pakai (minggu 12–15)

| ID | Tugas | Selesai bila |
| --- | --- | --- |
| 5.01 | Pakai harian 4 minggu + catat bug & ide | Catatan 4 minggu lengkap |
| 5.02 | Perbaikan mingguan | Tidak ada bug kritis tersisa |
| 5.03 | Evaluasi gate v1.5 | Keputusan lanjut ke v1.5 tercatat |

**Gate v1.5:** 4 minggu tanpa kembali ke Planner Jeff.
