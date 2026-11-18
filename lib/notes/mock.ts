import type { Note } from "./store";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function createMockNotes(): Note[] {
  return [
    { id: "n1", title: "📝 Evaluasi minggu ini", body: "Deadline deck klien maju ke Jumat. Pengeluaran makan siang naik, coba bawa bekal.", tag: "Pribadi", pinned: true, at: daysAgo(1), deletedAt: null },
    { id: "n2", title: "💡 Ide fitur Unio", body: "Widget saldo di home screen, rekap mingguan otomatis via Siri setiap Minggu malam.", tag: "Ide", pinned: false, at: daysAgo(2), deletedAt: null },
    { id: "n3", title: "🗒️ Notulen meeting klien", body: "Revisi slide 4–7, tambah studi kasus, kirim deck sebelum Jumat 10:00. Terkait tugas: Kirim revisi deck.", tag: "Kantor", pinned: false, at: daysAgo(3), deletedAt: null },
    { id: "n4", title: "📚 Bacaan minggu ini", body: "Refactoring UI bab 3, artikel HIG tentang Liquid Glass, video soal spacing.", tag: "Pribadi", pinned: false, at: daysAgo(5), deletedAt: null },
    { id: "n5", title: "🗑️ Draf lama proposal", body: "Versi pertama proposal klien, sudah diganti.", tag: "Kantor", pinned: false, at: daysAgo(9), deletedAt: daysAgo(2) },
  ];
}
