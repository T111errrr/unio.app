import { Icon } from "@/components/ui/Icon";
import type { Note } from "@/lib/notes/store";

type Props = { note: Note; date: string; pinLabel: string; onOpen: () => void };

/** Kartu catatan di daftar (Figma "Note Card"). Seluruh kartu bisa ditekan. */
export function NoteCard({ note, date, pinLabel, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-11 w-full flex-col gap-1.5 rounded-(--radius-card-inner) bg-surface-inset p-4 text-left"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="t-body-em truncate">{note.title}</span>
        {note.pinned && <Icon name="pin" size="small" filled label={pinLabel} />}
      </span>
      <span className="t-subheadline line-clamp-3 text-ink-secondary">{note.body}</span>
      <span className="t-caption-1 text-ink-tertiary">
        {date} · {note.tag}
      </span>
    </button>
  );
}
