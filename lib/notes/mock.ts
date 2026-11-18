import type { Note } from "./store";

export function createMockNotes(): Note[] {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return [
    {
      id: "n1",
      title: "📝 Evaluasi minggu ini",
      body: "Deadline deck klien maju ke Jumat. Pengeluaran makan siang naik, coba bawa bekal.",
      tag: "Pribadi",
      pinned: true,
      at: d.toISOString(),
    },
  ];
}
