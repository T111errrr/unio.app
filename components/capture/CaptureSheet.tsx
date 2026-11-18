"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { ListRow } from "@/components/ui/ListRow";
import { Toast } from "@/components/ui/Toast";
import { cx } from "@/lib/cx";
import {
  guessExpenseCategory,
  guessIncomeCategory,
  parseCapture,
  type ExpenseCategory,
  type IncomeCategory,
} from "@/lib/capture/parse";
import { financeStore } from "@/lib/finance/store";
import { notesStore } from "@/lib/notes/store";
import { tasksStore } from "@/lib/tasks/store";
import { TASK_LISTS, type TaskListId } from "@/lib/tasks/types";

type Tab = "expense" | "income" | "task" | "note";
const TABS: Tab[] = ["expense", "income", "task", "note"];

const EXPENSE: { id: ExpenseCategory; icon: IconName }[] = [
  { id: "food", icon: "cat-food" },
  { id: "coffee", icon: "cat-coffee" },
  { id: "transport", icon: "cat-transport" },
  { id: "shopping", icon: "cat-shopping" },
];
const INCOME: { id: IncomeCategory; icon: IconName }[] = [
  { id: "salary", icon: "income" },
  { id: "freelance", icon: "edit" },
  { id: "bonus", icon: "cat-bonus" },
  { id: "other", icon: "more" },
];

type Props = { open: boolean; onClose: () => void; initialTab?: Tab };

/** Figma: Capture (sheet mobile 34:*, modal desktop 152:*). Isi dibuat ulang tiap dibuka. */
export function CaptureSheet({ open, onClose, initialTab = "expense" }: Props) {
  const t = useTranslations("capture");
  const tc = useTranslations("common");
  const ref = useRef<HTMLDialogElement>(null);
  const [toast, setToast] = useState<{ message: string; undo: () => void } | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  function saved(undo: () => void) {
    setToast({ message: t("saved"), undo });
    onClose();
  }

  return (
    <>
      <dialog
        ref={ref}
        onClose={onClose}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        aria-label={t("title")}
        className={cx(
          "motion-sheet fixed inset-x-0 top-auto bottom-0 m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto bg-surface p-0 text-ink",
          "rounded-t-(--radius-card) rounded-b-none shadow-(--shadow-large)",
          "md:inset-0 md:m-auto md:h-fit md:max-w-md md:rounded-(--radius-card)",
        )}
      >
        {open && <CaptureForm key={String(open)} initialTab={initialTab} onClose={onClose} onSaved={saved} />}
      </dialog>
      {toast && (
        <div className="fixed inset-x-0 bottom-28 z-50 flex justify-center md:bottom-6">
          <Toast
            message={toast.message}
            actionLabel={tc("undo")}
            onAction={() => {
              toast.undo();
              setToast(null);
            }}
          />
        </div>
      )}
    </>
  );
}

function CaptureForm({ initialTab, onClose, onSaved }: { initialTab: Tab; onClose: () => void; onSaved: (undo: () => void) => void }) {
  const t = useTranslations("capture");
  const tt = useTranslations("tasks");
  const tc = useTranslations("common");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState<"today" | "tomorrow" | "custom">("today");
  const [custom, setCustom] = useState("");
  const [list, setList] = useState<TaskListId>("kantor");
  const [priority, setPriority] = useState(false);

  const money = tab === "expense" || tab === "income";
  const parsed = useMemo(() => parseCapture(text), [text]);
  const guessed = money && parsed.note ? (tab === "expense" ? guessExpenseCategory(parsed.note) : guessIncomeCategory(parsed.note)) : null;
  const chosen = category ?? guessed;
  const amount = parsed.amount;

  const canSave =
    money ? !!amount && !!chosen : tab === "task" ? title.trim().length > 0 && (when !== "custom" || !!custom) : title.trim().length > 0;

  function switchTab(next: Tab) {
    setTab(next);
    setCategory(null);
  }

  function save() {
    if (!canSave) return;
    if (money && amount && chosen) {
      const id = financeStore.add({ kind: tab as "expense" | "income", amount, category: chosen, note: parsed.note, pocket: t("pocketCash") });
      return onSaved(() => financeStore.remove(id));
    }
    if (tab === "task") {
      const d = new Date();
      let due: string | null = null;
      let allDay = true;
      if (when === "tomorrow") {
        d.setDate(d.getDate() + 1);
        d.setHours(10, 0, 0, 0);
        due = d.toISOString();
        allDay = false;
      } else if (when === "custom") {
        due = new Date(custom).toISOString();
        allDay = false;
      } else {
        d.setHours(0, 0, 0, 0);
        due = d.toISOString();
      }
      const id = tasksStore.add({ title: title.trim(), list, due, allDay, priority });
      return onSaved(() => tasksStore.discard(id));
    }
    const id = notesStore.add({ title: title.trim(), body, tag: t("tagPersonal") });
    onSaved(() => notesStore.discard(id));
  }

  const saveLabel = tab === "task" ? t("saveTask") : tab === "note" ? t("saveNote") : tc("save");
  const income = tab === "income";
  const cats = income ? INCOME : EXPENSE;

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-[max(2.125rem,env(safe-area-inset-bottom))]">
      <div aria-hidden="true" className="mx-auto h-[5px] w-9 rounded-(--radius-full) bg-ink-tertiary md:hidden" />
      <header className="grid grid-cols-[44px_1fr_44px] items-center">
        <IconButton icon="close" label={tc("close")} onClick={onClose} className="size-9 justify-self-start" />
        <h2 className="t-headline text-center">{t("title")}</h2>
        <span aria-hidden="true" />
      </header>

      <div role="tablist" aria-label={t("title")} className="flex justify-center gap-1.5 overflow-x-auto">
        {TABS.map((id) => (
          <Chip key={id} style={tab === id ? "selected" : "light"} onClick={() => switchTab(id)}>
            {t(id)}
          </Chip>
        ))}
      </div>

      {money && (
        <>
          <div className="flex flex-col items-center gap-1 py-4 text-center">
            <p className="flex items-baseline gap-1.5" aria-live="polite">
              <span className="t-title-2 text-ink-secondary">Rp</span>
              <span
                className={cx("text-[48px] leading-[56px] font-bold tracking-tight", !amount ? "text-ink-tertiary" : income ? "text-income" : "text-ink")}
              >
                {amount ? `${income ? "+" : "−"}${new Intl.NumberFormat("id-ID").format(amount)}` : "0"}
              </span>
            </p>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              enterKeyHint="done"
              className="t-accent-serif-sm w-full bg-transparent text-center text-ink-secondary outline-none placeholder:text-ink-tertiary"
            />
          </div>

          {amount && chosen && (
            <dl className="flex items-center rounded-(--radius-card-inner) border border-border bg-surface-inset px-1 py-3 text-center">
              {[
                [t("pocket"), t("pocketCash")],
                [t("category"), t(`cat.${chosen}`)],
                [t("time"), income ? t("today") : t("now")],
              ].map(([k, v], i) => (
                <Fragment key={k}>
                  {i > 0 && <div aria-hidden className="h-8 w-px shrink-0 bg-border" />}
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
                    <dt className="t-footnote text-ink-tertiary">{k}</dt>
                    <dd className="t-subheadline-em">{v}</dd>
                  </div>
                </Fragment>
              ))}
            </dl>
          )}
          {amount && !chosen && (
            <div className="flex justify-center">
              <Badge type="warning">{t("pickCategory")}</Badge>
            </div>
          )}

          <div className="flex justify-between" role="group" aria-label={t("category")}>
            {cats.map(({ id, icon }) => {
              const on = chosen === id;
              return (
                <button key={id} type="button" aria-pressed={on} onClick={() => setCategory(id)} className="flex min-h-11 w-20 flex-col items-center gap-1.5">
                  <span className={cx("flex size-14 items-center justify-center rounded-(--radius-control)", on ? "bg-accent text-on-accent shadow-(--shadow-button-bevel)" : "bg-field text-ink")}>
                    <Icon name={icon} />
                  </span>
                  <span className={cx("t-caption-1", on ? "text-ink" : "text-ink-secondary")}>{t(`cat.${id}`)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {tab === "task" && (
        <>
          <label className="flex flex-col gap-2">
            <span className="t-callout text-ink-secondary">{t("taskTitle")}</span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="t-body h-14 rounded-(--radius-control) bg-field px-6 text-ink outline-none"
            />
          </label>
          <div className="flex flex-wrap justify-center gap-2">
            <Chip style={when === "today" ? "selected" : "light"} onClick={() => setWhen("today")}>{tt("groups.today")}</Chip>
            <Chip style={when === "tomorrow" ? "selected" : "light"} onClick={() => setWhen("tomorrow")}>{t("tomorrow10")}</Chip>
            <span className="relative">
              <Chip style={when === "custom" ? "selected" : "light"} showChevron>{t("pickDate")}</Chip>
              <input
                type="datetime-local"
                aria-label={t("pickDate")}
                value={custom}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => {
                  setCustom(e.target.value);
                  setWhen("custom");
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </span>
          </div>
          <div>
            <ListRow leadingIcon="list" title={tt("detail.list")} trailing="valueChevron" value={tt(`lists.${list}`)} onClick={() => setList(TASK_LISTS[(TASK_LISTS.indexOf(list) + 1) % TASK_LISTS.length] ?? "kantor")} />
            <ListRow leadingIcon="priority" title={tt("priority")} trailing="toggle" checked={priority} onCheckedChange={setPriority} showDivider={false} />
          </div>
        </>
      )}

      {tab === "note" && (
        <>
          <label className="flex flex-col gap-2">
            <span className="t-callout text-ink-secondary">{tt("detail.titleLabel")}</span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="t-body h-14 rounded-(--radius-control) bg-field px-6 text-ink outline-none"
            />
          </label>
          <textarea
            aria-label={t("noteBody")}
            placeholder={t("noteBody")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="t-body h-40 w-full resize-none rounded-(--radius-control) bg-field px-5 py-3.5 text-ink outline-none placeholder:text-ink-tertiary"
          />
          <div className="flex justify-center gap-2">
            <Badge type="neutral">{t("tagPersonal")}</Badge>
            <Badge type="info" icon="calendar">
              {new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date())}
            </Badge>
          </div>
        </>
      )}

      <Button disabled={!canSave} onClick={save}>
        {saveLabel}
      </Button>
    </div>
  );
}
