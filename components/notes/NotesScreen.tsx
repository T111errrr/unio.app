"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { cx } from "@/lib/cx";
import { notesStore, useNotes, type Note } from "@/lib/notes/store";
import { NoteCard } from "./NoteCard";
import { NoteEditor } from "./NoteEditor";

const CARD_P = "flex flex-col gap-2.5 rounded-(--radius-card) border border-border bg-surface p-4 shadow-(--shadow-card-soft)";
const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 py-3 shadow-(--shadow-card-soft)";
type Scenario = "default" | "empty" | "error" | "offline";
type Sort = "recent" | "title";

export function NotesScreen() {
  const t = useTranslations("notes");
  const tcap = useTranslations("capture");
  const locale = useLocale();
  const params = useSearchParams();
  const scenario = (params.get("state") ?? "default") as Scenario;
  const { status, notes, folders, unsynced } = useNotes();
  const [folder, setFolder] = useState<string>("all");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [openId, setOpenId] = useState<string | null>(null);
  const [undoId, setUndoId] = useState<string | null>(null);
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    notesStore.load(scenario);
  }, [scenario]);
  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);
  useEffect(() => {
    if (!undoId) return;
    const timer = setTimeout(() => setUndoId(null), 5000);
    return () => clearTimeout(timer);
  }, [undoId]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }), [locale]);
  const live = useMemo(() => notes.filter((n) => !n.deletedAt), [notes]);
  const inFolder = live.filter((n) => folder === "all" || n.tag === folder);
  const q = query.trim().toLowerCase();
  const results = q ? live.filter((n) => (n.title + " " + n.body).toLowerCase().includes(q)) : [];
  const pinned = inFolder.filter((n) => n.pinned);
  const rest = inFolder
    .filter((n) => !n.pinned)
    .sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title, locale) : b.at.localeCompare(a.at)));
  const openNote = notes.find((n) => n.id === openId && !n.deletedAt) ?? null;

  function remove(id: string) {
    notesStore.remove(id);
    setUndoId(id);
  }
  function newNote() {
    const id = notesStore.add({ title: "", body: "", tag: folder === "all" ? (folders[0] ?? "Pribadi") : folder });
    setOpenId(id);
  }
  function card(n: Note) {
    return <NoteCard key={n.id} note={n} date={dateFmt.format(new Date(n.at))} pinLabel={t("pinned")} onOpen={() => setOpenId(n.id)} />;
  }

  const loading = status === "loading";
  const error = status === "error";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-35 md:pt-8 md:pb-10">
      <header className="flex items-center justify-between gap-2 py-2">
        <h1 className="t-large-title">{t("title")}</h1>
        <IconButton
          icon={searching ? "close" : "search"}
          label={searching ? t("closeSearch") : t("search")}
          className="size-11 shrink-0"
          onClick={() => {
            setSearching((v) => !v);
            setQuery("");
          }}
        />
      </header>

      {searching ? (
        <div className="flex h-12 items-center gap-2 rounded-(--radius-full) border-[1.5px] border-accent bg-surface px-4">
          <Icon name="search" size="small" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
            className="t-body min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-tertiary"
          />
          {query && (
            <button type="button" aria-label={t("clearSearch")} onClick={() => setQuery("")} className="-mr-2 flex size-11 items-center justify-center">
              <Icon name="close" size="small" />
            </button>
          )}
        </div>
      ) : (
        <div className="-mx-4 flex gap-2 overflow-x-auto overflow-y-hidden px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={t("folder")}>
          {["all", ...folders].map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={folder === f}
              onClick={() => setFolder(f)}
              className={cx(
                "t-footnote-em relative h-[30px] shrink-0 rounded-(--radius-m) px-3 before:absolute before:-inset-y-[7px] before:inset-x-0 before:content-['']",
                folder === f ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "bg-field text-ink",
              )}
            >
              {f === "all" ? t("all") : f}
            </button>
          ))}
          {addingFolder ? (
            <input
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onBlur={() => {
                notesStore.addFolder(folderName);
                setFolderName("");
                setAddingFolder(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              placeholder={t("folderName")}
              aria-label={t("folderName")}
              className="t-footnote-em h-[30px] w-28 shrink-0 rounded-(--radius-m) bg-field px-3 outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingFolder(true)}
              className="t-footnote-em relative h-[30px] shrink-0 rounded-(--radius-m) bg-field px-3 text-ink before:absolute before:-inset-y-[7px] before:inset-x-0 before:content-['']"
            >
              {t("newFolder")}
            </button>
          )}
        </div>
      )}

      {error ? (
        <section role="alert" className={cx(CARD, "flex flex-col items-center gap-2 pb-4 text-center")}>
          <span className="pt-4 text-destructive">
            <Icon name="warning" size="xlarge" />
          </span>
          <h2 className="t-title-3">{t("errorTitle")}</h2>
          <p className="t-subheadline text-ink-secondary">{t("errorBody")}</p>
          <Button icon="retry" onClick={() => notesStore.load(scenario)}>
            {tcap("retry")}
          </Button>
        </section>
      ) : loading ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          <Skeleton className="h-56 rounded-(--radius-card)" />
          <Skeleton className="h-80 rounded-(--radius-card)" />
        </div>
      ) : searching && q ? (
        <>
          <section className={CARD_P}>
            <h2 className="t-headline py-2">{t("results", { count: results.length, query: query.trim() })}</h2>
            <div className="flex flex-col gap-2.5">{results.map(card)}</div>
          </section>
          <section className={cx(CARD, "flex flex-col items-center gap-1 py-4 text-center")}>
            <p className="t-body-em">{t("notFoundTitle")}</p>
            <p className="t-footnote text-ink-secondary">{t("notFoundBody")}</p>
          </section>
        </>
      ) : live.length === 0 ? (
        <EmptyState icon="nav-notes" title={t("emptyTitle")} description={t("emptyBody")} actionLabel={t("write")} onAction={newNote} />
      ) : inFolder.length === 0 ? (
        <p className="t-subheadline py-10 text-center text-ink-secondary">{t("emptyFolder")}</p>
      ) : (
        <>
          {pinned.length > 0 && (
            <section className={CARD_P}>
              <h2 className="t-headline py-2">{t("pinnedTitle")}</h2>
              <div className="flex flex-col gap-2.5">{pinned.map(card)}</div>
            </section>
          )}
          {rest.length > 0 && (
            <section className={CARD_P}>
              <div className="flex items-center justify-between gap-2 py-2">
                <h2 className="t-headline">{t("latest")}</h2>
                <button type="button" onClick={() => setSort(sort === "recent" ? "title" : "recent")} className="t-subheadline relative flex items-center text-ink-secondary before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']">
                  {sort === "recent" ? t("sort") : t("sortTitle")}
                </button>
              </div>
              <div className="flex flex-col gap-2.5">{rest.map(card)}</div>
            </section>
          )}
        </>
      )}

      {!loading && !error && !searching && live.length > 0 && (
        <button
          type="button"
          onClick={newNote}
          aria-label={t("write")}
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+7.5rem)] z-20 flex size-14 items-center justify-center rounded-(--radius-full) bg-accent text-on-accent shadow-(--shadow-button-bevel) md:bottom-8"
        >
          <Icon name="add" size="medium" />
        </button>
      )}

      <NoteEditor note={openNote} folders={folders} onClose={() => setOpenId(null)} onDelete={remove} />

      {(undoId || (unsynced && !error && !loading)) && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-30 flex justify-center md:bottom-8">
          {undoId ? (
            <Toast message={t("deleted")} actionLabel={t("undo")} onAction={() => { notesStore.restore(undoId); setUndoId(null); }} className="pointer-events-auto" />
          ) : (
            <Toast type="notSynced" message={t("unsynced")} actionLabel={tcap("retry")} onAction={() => notesStore.retrySync()} className="pointer-events-auto" />
          )}
        </div>
      )}
    </div>
  );
}
