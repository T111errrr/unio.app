# Mulai di sini

Panduan ini untuk Jeff. Bagian A dikerjakan sekali (±45 menit, semuanya gratis). Bagian B adalah cara
menjalankan setiap tugas bersama Claude Code.

## A. Persiapan sekali saja

### 1. GitHub (tempat menyimpan kode)
1. Buat akun di github.com (gratis).
2. Buat repository baru: nama `unio`, pilih **Private**, jangan centang "Add a README".
3. Unggah isi folder paket ini ke repo: di halaman repo klik **uploading an existing file**, seret semua
   isi folder `unio` (termasuk `CLAUDE.md`, `docs`, `styles`, `supabase`, `messages`), lalu **Commit changes**.
   File `.gitignore` dan `.env.example` tersembunyi di sebagian komputer — pastikan ikut terunggah.

### 2. Hubungkan GitHub ke Claude
1. Di claude.ai buka Settings → Connectors → GitHub → Connect, lalu izinkan akses ke repo `unio`.
2. Setelah itu Claude Code bisa membaca dan menulis kode di repo tersebut.

### 3. Supabase (database + login)
1. Buat akun di supabase.com dengan akun GitHub. Buat project `unio`, region **Southeast Asia (Singapore)**.
   Simpan password database di tempat aman.
2. Buka **SQL Editor**, tempel seluruh isi `supabase/migrations/0001_init.sql`, klik **Run**.
   Hasil yang benar: "Success. No rows returned".
3. Buka **Project Settings → API** dan salin tiga nilai: Project URL, `anon` key, `service_role` key.
   `service_role` itu rahasia: jangan dikirim di chat umum atau ditaruh di kode.

### 4. Vercel (hosting)
1. Buat akun di vercel.com dengan akun GitHub (paket **Hobby**).
2. **Add New → Project → Import** repo `unio`. Bila diminta framework, pilih Next.js.
   (Deploy pertama baru berhasil setelah tugas 1.02 selesai — itu normal.)
3. Di **Settings → Environment Variables** isi tiga variabel dari `.env.example` dengan nilai dari Supabase.

### 5. Figma untuk Claude Code
Hubungkan connector Figma di claude.ai (Settings → Connectors) supaya Claude Code bisa membaca desain.

## B. Menjalankan satu tugas

1. Buka Claude Code (claude.ai/code), pilih repo `unio`.
2. Kirim prompt seperti contoh di bawah, ganti ID tugasnya.
3. Tunggu sampai Claude membuka pull request. Buka link preview Vercel di iPhone dan laptop.
4. Cocokkan dengan Figma: light dan dark, lebar 390 / 1264 / 1440.
5. Kurang pas → balas di chat apa yang salah (boleh pakai screenshot). Sudah oke → minta Claude merge,
   lalu ubah status tugas di dokumen Rencana Dev.

### Prompt tugas pertama (1.02)

```
Kerjakan tugas 1.02 dari docs/handoff/tugas.md.
Baca CLAUDE.md dulu. Buat proyek Next.js terbaru (App Router, TypeScript, Tailwind, tanpa folder src)
di root repo ini tanpa menghapus file yang sudah ada (CLAUDE.md, docs, styles, supabase, messages).
Tambahkan manifest PWA + ikon app sementara, script lint/typecheck/test/build, dan hubungkan styles/tokens.css
ke tema Tailwind (tugas 1.04). Buka PR dan jelaskan cara saya mengeceknya di iPhone.
```

### Prompt umum untuk tugas berikutnya

```
Kerjakan tugas <ID> dari docs/handoff/tugas.md. Baca CLAUDE.md, lalu buka frame Figma terkait
(ID di docs/handoff/figma-map.md) sebelum menulis kode. Ikuti kriteria "Selesai bila".
Buka PR dan tulis layar mana yang perlu saya cek.
```

## C. Batas paket gratis yang perlu diingat

- Supabase Free: project dijeda setelah 7 hari tanpa aktivitas (tugas 1.13 memasang ping harian), database 500 MB,
  tanpa backup otomatis (tugas 1.13 memasang backup mingguan).
- Vercel Hobby: hanya untuk pemakaian pribadi/non-komersial.
- Notifikasi di iPhone hanya jalan bila Unio dipasang ke Home Screen (iOS 16.4+).
