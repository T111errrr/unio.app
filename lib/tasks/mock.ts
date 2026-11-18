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
    { id: "t1", title: "📊 Kirim revisi deck klien", list: "kantor", due: at(0, 10), allDay: false, priority: true, done: false, repeat: null },
    { id: "t2", title: "📧 Balas email vendor", list: "kantor", due: at(-1, 16), allDay: false, priority: false, done: false, repeat: null },
    { id: "t3", title: "⚡️ Bayar listrik", list: "pribadi", due: at(0, 19), allDay: false, priority: false, done: false, repeat: null },
    { id: "t4", title: "🗓️ Meeting mingguan tim", list: "kantor", due: at(1, 9), allDay: false, priority: false, done: false, repeat: "weekly" },
    { id: "t5", title: "🛒 Belanja bulanan", list: "pribadi", due: at(1, 20), allDay: false, priority: false, done: false, repeat: null },
    { id: "t6", title: "🎨 Polish UI komponen Unio", list: "pribadi", due: at(3, 0), allDay: true, priority: true, done: false, repeat: null },
    { id: "t7", title: "💳 Bayar paylater", list: "pribadi", due: at(4, 0), allDay: true, priority: false, done: false, repeat: null },
    { id: "t8", title: "💡 Ide fitur recap mingguan", list: "ide", due: null, allDay: false, priority: false, done: false, repeat: null },
    { id: "t9", title: "📝 Susun notulen kickoff", list: "kantor", due: at(-2, 11), allDay: false, priority: false, done: true, repeat: null },
    { id: "t10", title: "🧾 Catat pengeluaran minggu lalu", list: "pribadi", due: at(-3, 20), allDay: false, priority: false, done: true, repeat: null },
  ];
}
