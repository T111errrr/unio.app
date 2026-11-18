# Unio

One app for your everything. Planner all-in-one (tugas, keuangan, catatan, recap) sebagai PWA.

- Mulai dari sini: [`docs/handoff/00-mulai-di-sini.md`](docs/handoff/00-mulai-di-sini.md)
- Aturan proyek untuk Claude Code: [`CLAUDE.md`](CLAUDE.md)
- Daftar tugas: [`docs/handoff/tugas.md`](docs/handoff/tugas.md)
- Peta desain Figma: [`docs/handoff/figma-map.md`](docs/handoff/figma-map.md)
- Ringkasan produk: [`docs/handoff/produk.md`](docs/handoff/produk.md)

Status: kode aplikasi dimulai di tugas 1.02 (Next.js 16, App Router, Tailwind 4, PWA).

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm install` | Pasang dependensi (Node 22 ke atas) |
| `npm run dev` | Jalankan app di komputer (http://localhost:3000) |
| `npm run lint` | Cek gaya kode |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm test` | Jalankan tes otomatis (Vitest) |
| `npm run build` | Build produksi, sama seperti di Vercel |

Token desain dari Figma ada di `styles/tokens.css` dan dipetakan ke Tailwind di `app/globals.css`:
`bg-surface`, `text-text-secondary`, `p-16` (16 px), `rounded-card`, `shadow-card-soft`, `ease-ios`, `duration-sheet`, dst.
Skala bawaan Tailwind dimatikan, jadi hanya token Unio yang bisa dipakai.
