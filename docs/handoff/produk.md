# Unio — ringkasan produk untuk dev

Dokumen lengkap (di claude.ai, milik Jeff): Unio — PRD v1.0, Unio — Rencana Dev v1, Unio — Brand & Business Brief.

## Apa itu Unio

Planner all-in-one untuk pekerja sibuk: mencatat tugas, uang, dan catatan dalam hitungan detik, lalu rekapnya
jadi sendiri. Tagline: "One app for your everything." v1 dipakai Jeff sendiri di iPhone 13 (PWA di Home Screen)
dan laptop Windows (browser), dengan biaya Rp0 per bulan.

## Prinsip produk

1. Sekali catat, langsung selesai: field penting terisi dalam satu alur cepat, tanpa merapikan ulang.
2. Rekap jadi sendiri: pengguna tidak menghitung atau menyusun laporan.
3. Terasa seperti app bawaan Apple, tanpa gaya yang dibuat-buat.
4. Gratis dijalankan: hanya layanan dengan paket gratis.
5. Cepat lebih dulu daripada lengkap: fitur yang membuat app terasa lambat ditunda.

## Target terukur v1

| Metrik | Target |
| --- | --- |
| Catat lewat Siri / Shortcut | ≤ 10 detik dari pemicu sampai tersimpan |
| Catat di dalam app | ≤ 3 tap untuk transaksi atau tugas |
| Kategorisasi otomatis | ≥ 80% entri Siri tidak perlu diedit |
| Kecepatan buka | Siap mengetik ≤ 2 detik di iPhone 13 |
| Kelancaran | Scroll dan animasi 60 fps di Safari iOS |
| Biaya | Rp0 per bulan (Vercel Hobby + Supabase Free) |

## Modul v1

- **Capture & Inbox:** catat cepat (pengeluaran, pemasukan, tugas, catatan); entri yang terputus di tengah alur masuk Inbox.
- **Today:** ringkasan hari ini (budget, statistik, tugas per list, transaksi, catatan terakhir).
- **Tasks:** list (Kantor, Pribadi, Ide…), tenggat, prioritas, subtugas, selesai/pending.
- **Finance:** kantong dengan saldo awal manual, Paylater (limit + jatuh tempo), transfer, kategori + kata kunci,
  budget dengan peringatan 80% dan 100%.
- **Notes:** teks kaya tanpa gambar, folder, tag, sematkan, cari.
- **Recap:** harian (Daily Review), mingguan, bulanan; grafik batang + donat; ekspor CSV.
- **Settings:** tampilan (tema), bahasa, notifikasi, Shortcuts & Siri (API key), data & Recently Deleted, akun.

## API untuk Siri Shortcuts

| Endpoint | Fungsi |
| --- | --- |
| `POST /api/capture` | Satu kalimat → transaksi, tugas, atau catatan. Kategori & kantong ditebak dari kata kunci; gagal → Inbox |
| `GET /api/summary` | Ringkasan hari ini / minggu ini sebagai kalimat untuk dibacakan Siri |
| `GET /api/shortcuts` | Daftar shortcut + status uji koneksi untuk layar Shortcuts & Siri |

Header `x-api-key`; `request_id` untuk anti entri ganda; 60 permintaan/menit per key.

| Shortcut | Pemicu | Yang terjadi |
| --- | --- | --- |
| Unio Expense | Back Tap 2×, "Hey Siri, Unio expense" | Dikte/ketik teks → pengeluaran; Siri menjawab mis. "Tersimpan: Kopi Rp25.000 · Makan & minum" |
| Unio Income | "Hey Siri, Unio income" | Sama, sebagai pemasukan |
| Unio Task | Back Tap 3×, "Hey Siri, Unio task" | Disimpan sebagai tugas, tenggat dibaca dari teks |
| Unio Note | "Hey Siri, Unio note" | Disimpan sebagai catatan |
| Unio Capture | "Hey Siri, Unio capture" | Parser memilih jenisnya; bila ragu, Shortcut menanyakan jenis lewat menu |
| Unio Summary | "Hey Siri, Unio summary" | Siri membacakan rekap hari ini |

Catatan: PRD mendaftar 6 shortcut, layar Shortcuts & Siri di Figma menampilkan 5 (tanpa Unio Income).
Tanyakan Jeff saat mengerjakan tugas 2.07/2.08 apakah Unio Income ditambahkan ke layar.

Urutan kategorisasi (PRD):
1. Kata kunci buatan pengguna di kategori.
2. Kamus bawaan, misalnya kopi, makan, grab, gojek, bensin, pulsa, listrik.
3. Riwayat: deskripsi yang pernah dicatat memakai kategori yang sama dengan sebelumnya.
4. Tidak ada yang cocok: Shortcut langsung menampilkan menu kategori (yang paling sering dipakai di atas),
   lalu entri tersimpan lengkap dalam alur yang sama.

Inbox hanya cadangan untuk entri yang terputus di tengah alur (mis. koneksi hilang, menu ditutup).
Contoh kalimat: "kopi 25rb cash", "gaji 5jt jago", "besok jam 10 kirim revisi deck".

## Keputusan yang sudah diambil

- Stack: Next.js (App Router, PWA) + Supabase + Vercel; repo GitHub privat; dibangun dengan Claude Code.
- Tetap di paket gratis di awal (Vercel Hobby, Supabase Free). Naik paket hanya bila Unio dibuka untuk umum/berbayar.
- UI dua bahasa sejak awal: Indonesia (default) dan Inggris.
- Font sistem + Inter; ikon Lucide (SF Pro / SF Symbols tidak boleh dikirim ke web non-Apple).
- Native iOS (Expo) ditunda sampai PWA v1 selesai dan dipakai.

## Di luar scope v1

Kolaborasi, investasi, timer fokus, pelacak kesehatan, template. Ditunda ke versi berikutnya: mode offline penuh,
sinkron bank/e-wallet, OCR struk, multi-mata uang, sinkron Google Calendar, gamifikasi, widget / Live Activities /
Apple Watch, Android native, monetisasi, lampiran besar.

## Keputusan terbuka

- Desain layar setup awal (saldo awal, rekening, kantong) — dibutuhkan sebelum tugas 3.01.
- Lucide vs Phosphor untuk ikon (sementara Lucide).
- Domain: `*.vercel.app` dulu atau beli domain.
