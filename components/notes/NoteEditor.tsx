"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
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
  const locale = useLocale();
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
      <div className="flex h-full flex-col pt-[env(safe-area-inset-top)]">
        <header className="grid h-15 shrink-0 grid-cols-[44px_1fr_44px] items-center gap-2 px-4 py-2">
          <IconButton icon="chevron-left" label={tc("back")} onClick={save} className="size-11" />
          <h2 className="t-headline truncate text-center">{tag}</h2>
          <div className="relative">
            <IconButton icon="more" label={t("more")} onClick={() => setMenu((v) => !v)} className="size-11" />
            {menu && (
              <div role="menu" className="absolute top-12 right-0 z-10 w-48 rounded-(--radius-card-inner) border border-border bg-surface p-1 shadow-(--shadow-surface-floating)">
                <p className="t-footnote px-3 pt-2 pb-1 text-ink-secondary">{t("moveTo")}</p>
                {folders.map((f) => (
                  <button
                    key={f}
                    role="menuitemradio"
                    aria-checked={tag === f}
                    type="button"
                    className="t-body flex min-h-11 w-full items-center gap-2 rounded-(--radius-m) px-3"
                    onClick={() => {
                      setTag(f);
                      setMenu(false);
                    }}
                  >
                    <Icon name="folder" size="small" />
                    <span className="flex-1 text-left">{f}</span>
                    {tag === f && <Icon name="check" size="small" />}
                  </button>
                ))}
                <div aria-hidden className="mx-3 my-1 h-px bg-divider" />
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

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-40">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            aria-label={t("titlePlaceholder")}
            className="t-title-1 w-full bg-transparent outline-none placeholder:text-ink-tertiary"
          />
          {/* Figma: lencana statis (folder + tanggal). Pindah folder lewat menu "Opsi lainnya". */}
          <div className="flex flex-wrap gap-2">
            <Badge icon="folder">{tag}</Badge>
            {note && (
              <Badge type="info" icon="calendar">
                {new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(note.at))}
              </Badge>
            )}
          </div>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("bodyPlaceholder")}
            aria-label={t("bodyPlaceholder")}
            className="t-body min-h-72 w-full resize-none bg-transparent pt-2 outline-none placeholder:text-ink-tertiary"
          />
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-[max(2.625rem,env(safe-area-inset-bottom))] flex justify-center md:absolute md:px-4">
          <div className="pointer-events-auto flex w-full items-center gap-1 rounded-(--radius-card) border border-border bg-surface p-1.5 shadow-(--shadow-surface-floating)">
            {tools.map((x) => (
              <button
                key={x.key}
                type="button"
                aria-label={x.label}
                onClick={x.run}
                className="t-headline flex h-11 min-w-0 flex-1 items-center justify-center rounded-(--radius-full)"
              >
                {x.icon ? <Icon name={x.icon} size="small" /> : x.text}
              </button>
            ))}
            <button
              type="button"
              onClick={save}
              className="t-body-em h-11 w-23 shrink-0 rounded-(--radius-control) bg-accent text-on-accent shadow-(--shadow-button-bevel)"
            >
              {t("done")}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
