"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { useFinance } from "@/lib/finance/store";
import { useNotes } from "@/lib/notes/store";
import { tasksStore, useTasks } from "@/lib/tasks/store";

type Tab = "all" | "tasks" | "money" | "notes";
const RECENT_KEY = "unio.recentSearches";
const SUGGESTIONS = ["#kantor", "> Rp100rb", "minggu ini"];
const rupiah = (n: number) => new Intl.NumberFormat("id-ID").format(n);

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

/** Pencarian global: tugas, transaksi, catatan (Figma 57:4376 / 57:4440 / 57:4531). Ctrl+K membukanya. */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("search");
  const tcap = useTranslations("capture");
  const locale = useLocale();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [recent, setRecent] = useState<string[]>([]);
  const { tasks } = useTasks();
  const { transactions } = useFinance();
  const { notes } = useNotes();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setQ("");
      setTab("all");
      setRecent(readRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!open && d.open) d.close();
  }, [open]);

  const term = q.trim().toLowerCase();
  const res = useMemo(() => {
    if (!term) return { tasks: [], money: [], notes: [] };
    return {
      tasks: tasks.filter((x) => !x.deletedAt && x.title.toLowerCase().includes(term)),
      money: transactions.filter((x) => (x.note + " " + x.pocket).toLowerCase().includes(term)),
      notes: notes.filter((x) => !x.deletedAt && (x.title + " " + x.body).toLowerCase().includes(term)),
    };
  }, [term, tasks, transactions, notes]);
  const total = res.tasks.length + res.money.length + res.notes.length;
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  function remember() {
    if (!term) return;
    const next = [q.trim(), ...recent.filter((r) => r !== q.trim())].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  }
  function go(href: "/tasks" | "/finance" | "/notes") {
    remember();
    onClose();
    router.push(href);
  }
  function createTask() {
    tasksStore.add({ title: q.trim(), list: "pribadi", due: null, allDay: false, priority: false });
    go("/tasks");
  }

  const show = (k: Tab) => tab === "all" || tab === k;
  const label = "t-footnote-em tracking-wide text-ink-secondary uppercase px-1 pt-2";
  const row = "flex min-h-14 w-full items-center gap-3 py-2 text-left";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={t("title")}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-background p-0 text-ink md:m-auto md:h-[80dvh] md:max-w-xl md:rounded-(--radius-card)"
    >
      <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-(--radius-full) border-[1.5px] border-accent bg-field px-4">
            <Icon name="search" size="small" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && remember()}
              placeholder={t("placeholder")}
              aria-label={t("title")}
              className="t-body min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-tertiary"
            />
            {q && (
              <button type="button" aria-label={t("clear")} onClick={() => setQ("")} className="-mr-2 flex size-11 items-center justify-center">
                <Icon name="close" size="small" />
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="t-body min-h-11 px-1">{t("cancel")}</button>
        </div>

        {!term ? (
          <>
            {recent.length > 0 && (
              <>
                <p className={label}>{t("recent")}</p>
                <div className="rounded-(--radius-card) bg-surface px-4">
                  {recent.map((r, i) => (
                    <button key={r} type="button" onClick={() => setQ(r)} className={cx(row, i > 0 && "border-t border-divider")}>
                      <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field"><Icon name="clock" size="small" /></span>
                      <span className="t-body flex-1">{r}</span>
                      <span className="text-ink-tertiary"><Icon name="chevron-right" size="small" /></span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className={label}>{t("try")}</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setQ(s)} className="t-footnote-em relative h-9 rounded-(--radius-m) bg-field px-3 before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']">{s}</button>
              ))}
            </div>
          </>
        ) : total === 0 ? (
          <section className="flex flex-col items-center gap-2 rounded-(--radius-card) bg-surface px-6 py-10 text-center">
            <span className="text-ink-secondary"><Icon name="search" size="xlarge" /></span>
            <h2 className="t-title-3">{t("notFound")}</h2>
            <p className="t-subheadline text-ink-tertiary">{t("notFoundBody", { query: q.trim() })}</p>
            <Button icon="add" fullWidth={false} className="mt-2 px-6" onClick={createTask}>{t("createTask", { query: q.trim() })}</Button>
          </section>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto" role="group" aria-label={t("filter")}>
              {([["all", total], ["tasks", res.tasks.length], ["money", res.money.length], ["notes", res.notes.length]] as const).map(([k, n]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={tab === k}
                  onClick={() => setTab(k)}
                  className={cx(
                    "t-footnote-em relative h-[30px] shrink-0 rounded-(--radius-m) px-3 before:absolute before:-inset-y-[7px] before:inset-x-0 before:content-['']",
                    tab === k ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "bg-field text-ink",
                  )}
                >
                  {t(`tab.${k}`)} · {n}
                </button>
              ))}
            </div>
            {show("tasks") && res.tasks.length > 0 && (
              <>
                <p className={label}>{t("tab.tasks")}</p>
                <div className="rounded-(--radius-card) bg-surface px-4">
                  {res.tasks.map((x, i) => (
                    <button key={x.id} type="button" onClick={() => go("/tasks")} className={cx(row, i > 0 && "border-t border-divider")}>
                      <span className="size-6 shrink-0 rounded-(--radius-full) border-[1.5px] border-ink-tertiary" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="t-body block truncate">{x.title}</span>
                        <span className="t-footnote block text-ink-secondary">{x.due ? dateFmt.format(new Date(x.due)) : t("noDate")}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {show("money") && res.money.length > 0 && (
              <>
                <p className={label}>{t("tab.money")}</p>
                <div className="rounded-(--radius-card) bg-surface px-4">
                  {res.money.map((x, i) => (
                    <button key={x.id} type="button" onClick={() => go("/finance")} className={cx(row, i > 0 && "border-t border-divider")}>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-(--radius-card-inner) bg-field">
                        <Icon name={x.kind === "income" ? "income" : "expense"} size="small" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="t-body block truncate">{x.note}</span>
                        <span className="t-footnote block truncate text-ink-secondary">{tcap(`cat.${x.category}`)} · {x.pocket}</span>
                      </span>
                      <span className="text-right">
                        <span className={cx("t-body-em block", x.kind === "income" && "text-income")}>{x.kind === "income" ? "+" : "−"}Rp{rupiah(x.amount)}</span>
                        <span className="t-footnote block text-ink-secondary">{dateFmt.format(new Date(x.at))}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {show("notes") && res.notes.length > 0 && (
              <>
                <p className={label}>{t("tab.notes")}</p>
                <div className="rounded-(--radius-card) bg-surface px-4">
                  {res.notes.map((x, i) => (
                    <button key={x.id} type="button" onClick={() => go("/notes")} className={cx(row, i > 0 && "border-t border-divider")}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-m) bg-field"><Icon name="nav-notes" size="small" /></span>
                      <span className="t-body min-w-0 flex-1 truncate">{x.title}</span>
                      <span className="text-ink-tertiary"><Icon name="chevron-right" size="small" /></span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
