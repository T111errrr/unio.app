"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { cx } from "@/lib/cx";
import { notesStore, type Note } from "@/lib/notes/store";

type Props = {
  note: Note | null;
  folders: string[];
  onClose: () => void;
  onDelete: (id: string) => void;
};

/** Editor catatan layar penuh (Figma 50:2853). Judul + isi + toolbar melayang. */
export function NoteEditor({ note, folders, onClose, onDelete }: Props) {
  const t = useTranslations("notes");
  const tc = useTranslations("common");
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("Pribadi");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setTag(note.tag);
      setMenu(false);
      if (!d.open) d.showModal();
    } else if (d.open) d.close();
  }, [note]);

  function save() {
    if (!note) return;
    const empty = !title.trim() && !body.trim();
    if (empty) notesStore.discard(note.id);
    else notesStore.update(note.id, { title: title.trim() || t("untitled"), body, tag });
    onClose();
  }

  function insert(prefix: string, wrap?: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = body.slice(a, b);
    const next = wrap ? body.slice(0, a) + wrap + sel + wrap + body.slice(b) : body.slice(0, a) + prefix + body.slice(a);
    setBody(next);
    requestAnimationFrame(() => el.focus());
  }

  const tools: { key: string; label: string; icon?: IconName; text?: string; run: () => void }[] = [
    { key: "h", label: t("tool.heading"), text: "A", run: () => insert("## ") },
    { key: "b", label: t("tool.bold"), text: "B", run: () => insert("", "**") },
    { key: "l", label: t("tool.list"), icon: "list", run: () => insert("• ") },
    { key: "c", label: t("tool.checklist"), icon: "checkbox-off", run: () => insert("☐ ") },
    { key: "k", label: t("tool.link"), icon: "tag", run: () => insert("https://") },
    { key: "p", label: note?.pinned ? t("unpin") : t("pin"), icon: "pin", run: () => note && notesStore.togglePin(note.id) },
  ];

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        save();
      }}
      aria-label={t("editor")}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-background p-0 text-ink md:inset-0 md:m-auto md:h-[85dvh] md:max-w-2xl md:rounded-(--radius-card)"
    >
      <div className="flex h-full flex-col">
        <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
          <IconButton icon="chevron-left" label={tc("back")} onClick={save} className="size-11" />
          <h2 className="t-headline truncate text-center">{tag}</h2>
          <div className="relative">
            <IconButton icon="more" label={t("more")} onClick={() => setMenu((v) => !v)} className="size-11" />
            {menu && (
              <div role="menu" className="absolute top-12 right-0 z-10 w-48 rounded-(--radius-card-inner) border border-border bg-surface p-1 shadow-(--shadow-surface-floating)">
                <button
                  role="menuitem"
                  type="button"
                  className="t-body flex min-h-11 w-full items-center gap-2 rounded-(--radius-m) px-3 text-destructive"
                  onClick={() => {
                    if (note) onDelete(note.id);
                    onClose();
                  }}
                >
                  <Icon name="delete" size="small" />
                  {t("delete")}
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-40">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            aria-label={t("titlePlaceholder")}
            className="t-title-1 mt-2 w-full bg-transparent py-2 outline-none placeholder:text-ink-tertiary"
          />
          <div className="flex flex-wrap gap-2 py-2" role="group" aria-label={t("folder")}>
            {folders.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={tag === f}
                onClick={() => setTag(f)}
                className={cx(
                  "t-footnote-em relative inline-flex h-8 items-center gap-1.5 rounded-(--radius-m) px-3 before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']",
                  tag === f ? "bg-accent text-on-accent" : "bg-field text-ink-secondary",
                )}
              >
                <Icon name="folder" size="small" />
                {f}
              </button>
            ))}
          </div>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("bodyPlaceholder")}
            aria-label={t("bodyPlaceholder")}
            className="t-body mt-2 min-h-72 w-full resize-none bg-transparent outline-none placeholder:text-ink-tertiary"
          />
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex justify-center px-4 md:absolute">
          <div className="pointer-events-auto flex items-center gap-1 rounded-(--radius-full) border border-border bg-surface py-2 pr-2 pl-3 shadow-(--shadow-surface-floating)">
            {tools.map((x) => (
              <button
                key={x.key}
                type="button"
                aria-label={x.label}
                onClick={x.run}
                className="t-headline flex size-11 items-center justify-center rounded-(--radius-full)"
              >
                {x.icon ? <Icon name={x.icon} size="small" /> : x.text}
              </button>
            ))}
            <button
              type="button"
              onClick={save}
              className="t-body-em ml-1 h-11 rounded-(--radius-full) bg-accent px-5 text-on-accent shadow-(--shadow-button-bevel)"
            >
              {t("done")}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
