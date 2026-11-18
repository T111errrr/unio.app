import type { Task } from "./types";

function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Data contoh lokal (sama dengan isi Figma). Diganti Supabase di tahap backend. */
export function createMockTasks(): Task[] {
  return [
    { id: "t1", title: "📊 Kirim revisi deck klien", list: "kantor", due: at(0, 22), allDay: false, priority: true, done: false, repeat: null, notes: "Revisi slide 4–7 sesuai masukan, kirim PDF + link Figma.", tags: ["Klien", "Desain"], subtasks: [{ id: "s1", title: "Revisi slide 4–7", done: true }, { id: "s2", title: "Export PDF", done: false }, { id: "s3", title: "Kirim email ke klien", done: false }], deletedAt: null },
    { id: "t2", title: "📧 Balas email vendor", list: "kantor", due: at(-1, 16), allDay: false, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t3", title: "⚡️ Bayar listrik", list: "pribadi", due: at(0, 23), allDay: false, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t4", title: "🗓️ Meeting mingguan tim", list: "kantor", due: at(1, 9), allDay: false, priority: false, done: false, repeat: "weekly", notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t5", title: "🛒 Belanja bulanan", list: "pribadi", due: at(1, 20), allDay: false, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t6", title: "🎨 Polish UI komponen Unio", list: "pribadi", due: at(3, 0), allDay: true, priority: true, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t7", title: "💳 Bayar paylater", list: "pribadi", due: at(4, 0), allDay: true, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t8", title: "💡 Ide fitur recap mingguan", list: "ide", due: null, allDay: false, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t11", title: "🛒 Cari kado ulang tahun", list: "pribadi", due: null, allDay: false, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t12", title: "📞 Hubungi vendor percetakan", list: "kantor", due: null, allDay: false, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: at(-1, 10) },
    { id: "t13", title: "🧹 Bersihkan folder unduhan", list: "pribadi", due: null, allDay: false, priority: false, done: false, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: at(-3, 10) },
    { id: "t9", title: "📝 Susun notulen kickoff", list: "kantor", due: at(-2, 11), allDay: false, priority: false, done: true, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
    { id: "t10", title: "🧾 Catat pengeluaran minggu lalu", list: "pribadi", due: at(-3, 20), allDay: false, priority: false, done: true, repeat: null, notes: "", tags: [], subtasks: [], deletedAt: null },
  ];
}
