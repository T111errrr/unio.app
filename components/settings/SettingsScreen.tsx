"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { ListRow } from "@/components/ui/ListRow";
import { Toast } from "@/components/ui/Toast";
import { ExportSheet } from "@/components/recap/ExportSheet";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { useFinance } from "@/lib/finance/store";
import { notesStore, useNotes } from "@/lib/notes/store";
import { settingsStore, useSettings, type NotifKey, type ShortcutKey } from "@/lib/settings/store";
import { tasksStore, useTasks } from "@/lib/tasks/store";
import { useReduceMotion, useTheme } from "@/lib/use-appearance";
import type { Theme } from "@/lib/theme";

const CARD = "rounded-(--radius-card) border border-border bg-surface px-4 shadow-(--shadow-card-soft)";
type View = "main" | "appearance" | "notifications" | "shortcuts" | "deleted" | "deleteAccount";
const SHORTCUTS: { key: ShortcutKey; icon: IconName; hint: boolean }[] = [
  { key: "expense", icon: "expense", hint: true },
  { key: "income", icon: "income", hint: false },
  { key: "task", icon: "nav-tasks", hint: true },
  { key: "capture", icon: "add", hint: false },
  { key: "note", icon: "nav-notes", hint: false },
  { key: "summary", icon: "mic", hint: false },
];

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="t-footnote-em px-4 tracking-wide text-ink-secondary uppercase">{title}</h2>}
      <div className={CARD}>{children}</div>
    </section>
  );
}

export function SettingsScreen() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const scenario = params.get("state") ?? "default";
  const [view, setView] = useState<View>("main");
  const [theme, setTheme] = useTheme();
  const [reduce, setReduce] = useReduceMotion();
  const s = useSettings();
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const { transactions } = useFinance();
  const [exportOpen, setExportOpen] = useState(false);
  const [signOut, setSignOut] = useState(false);
  const [revoke, setRevoke] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [perm, setPerm] = useState<string>("default");
  const [test, setTest] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [testAt, setTestAt] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    tasksStore.load("default");
    notesStore.load("default");
    try {
      setPerm(typeof Notification === "undefined" ? "unsupported" : scenario === "denied" ? "denied" : Notification.permission);
    } catch {
      setPerm("unsupported");
    }
  }, [scenario]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const deletedTasks = tasks.filter((x) => x.deletedAt);
  const deletedNotes = notes.filter((x) => x.deletedAt);
  const deletedCount = deletedTasks.length + deletedNotes.length;
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const themeLabel = theme === "system" ? t("themeSystem") : theme === "light" ? t("themeLight") : t("themeDark");
  const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  function copyKey() {
    // Kunci lengkap hanya ada di server; di sini yang disalin hanya bentuk tersamar.
    const masked = `unio_sk_••••••••••${s.keyTail}`;
    navigator.clipboard?.writeText(masked).then(() => setToast(t("copied")), () => setToast(t("copyFailed")));
  }
  function sendTest() {
    setTest("loading");
    setTimeout(() => {
      const ok = scenario !== "offline";
      setTestAt(hhmm(new Date()));
      setTest(ok ? "ok" : "fail");
    }, 900);
  }
  const back = (to: View = "main") => (
    <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 py-2">
      <IconButton icon="chevron-left" label={tc("back")} className="size-11" onClick={() => (to === "main" ? (view === "main" ? router.back() : setView("main")) : setView(to))} />
      <h1 className="t-headline text-center">{view === "main" ? t("title") : t(`views.${view}`)}</h1>
      <span aria-hidden className="size-11" />
    </header>
  );

  const wrap = (children: ReactNode) => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-2 pb-36 md:pt-8 md:pb-10">
      {back()}
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-30 flex justify-center md:bottom-8">
          <Toast message={toast} className="pointer-events-auto" />
        </div>
      )}
    </div>
  );

  if (view === "appearance") {
    const opts: { v: Theme; label: string; icon?: IconName }[] = [
      { v: "system", label: t("themeSystemFull"), icon: "nav-today" },
      { v: "light", label: t("themeLight") },
      { v: "dark", label: t("themeDark") },
    ];
    return wrap(
      <>
        <div className={CARD}>
          {opts.map((o, i) => (
            <ListRow key={o.v} title={o.label} leadingIcon={o.icon} trailing={theme === o.v ? "check" : "none"} checked={theme === o.v} showDivider={i < opts.length - 1} onClick={() => setTheme(o.v)} />
          ))}
        </div>
        <p className="t-footnote px-4 text-ink-secondary">{t("themeNote")}</p>
        <Group title={t("language")}>
          {(["id", "en"] as const).map((l, i) => (
            <ListRow key={l} title={l === "id" ? "Bahasa Indonesia" : "English"} trailing={locale === l ? "check" : "none"} checked={locale === l} showDivider={i === 0} onClick={() => router.replace(pathname, { locale: l })} />
          ))}
        </Group>
        <Group>
          <ListRow title={t("reduceMotion")} trailing="toggle" checked={reduce} onCheckedChange={setReduce} showDivider={false} />
        </Group>
      </>,
    );
  }

  if (view === "notifications") {
    const row = (k: NotifKey, icon: IconName, last = false) => (
      <ListRow key={k} leadingIcon={icon} title={t(`notif.${k}`)} trailing="toggle" checked={s.notif[k]} onCheckedChange={(v) => settingsStore.setNotif(k, v)} showDivider={!last} />
    );
    return wrap(
      <>
        {perm === "denied" && (
          <div role="alert" className="flex gap-3 rounded-(--radius-card-inner) border border-border bg-surface px-4 py-3">
            <span className="text-destructive"><Icon name="notifications-off" /></span>
            <div>
              <p className="t-subheadline-em">{t("notif.deniedTitle")}</p>
              <p className="t-footnote text-ink-secondary">{t("notif.deniedBody")}</p>
            </div>
          </div>
        )}
        <Group title={t("notif.tasks")}>
          {row("dueReminder", "nav-tasks")}
          <label className="relative flex min-h-14 items-center gap-3 py-2">
            <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field"><Icon name="calendar" size="small" /></span>
            <span className="t-body flex-1">{t("dailyReview")}</span>
            <input type="time" value={s.reviewTime} onChange={(e) => settingsStore.setReviewTime(e.target.value)} aria-label={t("dailyReview")} className="t-body min-h-11 bg-transparent text-ink-secondary outline-none" />
          </label>
        </Group>
        <Group title={t("notif.finance")}>
          {row("budget", "warning")}
          {row("paylater", "nav-finance")}
          {row("incoming", "income")}
          {row("outgoing", "expense", true)}
        </Group>
        <p className="t-footnote px-4 text-ink-secondary">{t("notif.note")}</p>
      </>,
    );
  }

  if (view === "shortcuts") {
    return wrap(
      <>
        <p className="t-accent-serif-sm text-ink-secondary">{t("sc.intro")}</p>
        <section className={cx(CARD, "py-3")}>
          <h2 className="t-headline min-h-11 leading-11">{t("sc.step1")}</h2>
          <div className="flex min-h-12 items-center gap-2 rounded-(--radius-control) bg-field py-1 pr-1 pl-4">
            <code className="t-subheadline min-w-0 flex-1 truncate">unio_sk_••••••••••{s.keyTail}</code>
            <button type="button" onClick={copyKey} className="t-footnote-em relative h-8 rounded-(--radius-m) bg-accent px-3 text-on-accent before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']">{t("sc.copy")}</button>
          </div>
          <div className="flex min-h-11 items-center gap-2">
            <span className="t-footnote text-ink-secondary">{t("sc.created", { date: dateFmt.format(new Date(s.keyCreated)) })} ·</span>
            <button type="button" onClick={() => setRevoke(true)} className="t-footnote-em min-h-11 text-destructive">{t("sc.revoke")}</button>
          </div>
        </section>
        <section className={cx(CARD, "py-3")}>
          <h2 className="t-headline min-h-11 leading-11">{t("sc.step2")}</h2>
          {SHORTCUTS.map((x, i) => (
            <div key={x.key} className="relative flex min-h-16 items-center gap-3 py-2">
              <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field"><Icon name={x.icon} size="small" /></span>
              <span className="min-w-0 flex-1">
                <span className="t-body block">Unio {t(`sc.names.${x.key}`)}</span>
                <span className="t-caption-1 block text-ink-secondary">{x.hint ? t(`sc.backTap.${x.key}`) + " · " : ""}&ldquo;Hey Siri, Unio {t(`sc.names.${x.key}`).toLowerCase()}&rdquo;</span>
              </span>
              <button
                type="button"
                aria-pressed={s.shortcuts[x.key]}
                onClick={() => settingsStore.toggleShortcut(x.key)}
                className={cx("t-footnote-em relative h-8 rounded-(--radius-m) px-3 before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']", s.shortcuts[x.key] ? "bg-field text-ink" : "bg-accent text-on-accent")}
              >
                {s.shortcuts[x.key] ? t("sc.installed") : t("sc.add")}
              </button>
              {i < SHORTCUTS.length - 1 && <span aria-hidden className="absolute right-0 bottom-0 left-12 h-px bg-divider" />}
            </div>
          ))}
        </section>
        <section className={cx(CARD, "flex flex-col gap-3 py-3")}>
          <h2 className="t-headline min-h-11 leading-11">{t("sc.step3")}</h2>
          {test === "ok" && <p role="status" className="t-footnote-em flex items-center gap-2 self-start rounded-(--radius-full) bg-field px-3 py-1.5 text-income"><Icon name="check" size="small" />{t("sc.testOk", { time: testAt })}</p>}
          {test === "fail" && (
            <div role="alert" className="rounded-(--radius-card-inner) bg-field px-3 py-3">
              <p className="t-footnote-em flex items-center gap-2 text-destructive"><Icon name="warning" size="small" />{t("sc.testFail")}</p>
              <ul className="t-footnote mt-1 list-disc pl-6 text-ink-secondary">
                <li>{t("sc.fail1")}</li>
                <li>{t("sc.fail2")}</li>
              </ul>
            </div>
          )}
          <Button variant="secondary" icon="retry" disabled={test === "loading"} onClick={sendTest}>{test === "loading" ? t("sc.testing") : t("sc.sendTest")}</Button>
          <div className="h-1" />
        </section>
      </>,
    );
  }

  if (view === "deleted") {
    return wrap(
      deletedCount === 0 ? (
        <section className={cx(CARD, "flex flex-col items-center gap-2 px-6 py-10 text-center")}>
          <span className="text-ink-secondary"><Icon name="delete" size="xlarge" /></span>
          <h2 className="t-title-3">{t("del.emptyTitle")}</h2>
          <p className="t-subheadline text-ink-tertiary">{t("del.emptyBody")}</p>
        </section>
      ) : (
        <>
          <p className="t-footnote px-4 text-ink-secondary">{t("del.noteHint")}</p>
          <div className={CARD}>
            {[
              ...deletedTasks.map((x) => ({ id: x.id, kind: "task" as const, title: x.title, at: x.deletedAt as string })),
              ...deletedNotes.map((x) => ({ id: x.id, kind: "note" as const, title: x.title, at: x.deletedAt as string })),
            ]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((x, i, arr) => {
                const left = now ? Math.max(30 - Math.floor((now.getTime() - new Date(x.at).getTime()) / 86_400_000), 0) : 30;
                return (
                  <div key={x.id} className="relative flex min-h-16 items-center gap-3 py-2">
                    <span className="flex size-9 items-center justify-center rounded-(--radius-m) bg-field"><Icon name={x.kind === "task" ? "nav-tasks" : "nav-notes"} size="small" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="t-body block truncate">{x.title}</span>
                      <span className="t-caption-1 block text-ink-secondary">{t(x.kind === "task" ? "del.task" : "del.noteKind")} · {t("del.daysLeft", { count: left })}</span>
                    </span>
                    <button type="button" onClick={() => { if (x.kind === "task") tasksStore.restore(x.id); else notesStore.restore(x.id); setToast(t("del.restored")); }} className="t-footnote-em relative h-8 rounded-(--radius-m) bg-field px-3 before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']">{t("del.restore")}</button>
                    {i < arr.length - 1 && <span aria-hidden className="absolute right-0 bottom-0 left-12 h-px bg-divider" />}
                  </div>
                );
              })}
          </div>
        </>
      ),
    );
  }

  if (view === "deleteAccount") {
    const ok = confirmText.trim().toUpperCase() === t("del.keyword");
    return wrap(
      <section className={cx(CARD, "flex flex-col gap-3 py-4")}>
        <span className="text-destructive"><Icon name="warning" size="xlarge" /></span>
        <h2 className="t-title-3">{t("account.title")}</h2>
        <p className="t-subheadline text-ink-secondary">{t("account.body")}</p>
        <Button variant="secondary" icon="export" onClick={() => setExportOpen(true)}>{t("exportCsv")}</Button>
        <label className="flex flex-col gap-2">
          <span className="t-footnote text-ink-secondary">{t("account.type", { word: t("del.keyword") })}</span>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="t-body h-14 rounded-(--radius-control) border-[1.5px] border-transparent bg-field px-5 outline-none focus:border-destructive focus:bg-surface" />
        </label>
        <Button tone="destructive" disabled={!ok} onClick={() => setToast(t("account.pending"))}>{t("account.delete")}</Button>
        {now && <ExportSheet open={exportOpen} onClose={() => setExportOpen(false)} txs={transactions} tasks={tasks} now={now} />}
      </section>,
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-2 pb-36 md:pt-8 md:pb-10">
      {back()}
      <div className={cx(CARD, "py-3")}>
        <ListRow title="Jeff" trailing="chevron" leadingIcon="person" showDivider={false} className="min-h-16" />
        <p className="t-footnote -mt-2 pb-2 pl-12 text-ink-secondary">jeff@email.com</p>
      </div>
      <Group title={t("general")}>
        <ListRow leadingIcon="nav-today" title={t("views.appearance")} trailing="valueChevron" value={themeLabel} onClick={() => setView("appearance")} />
        <ListRow leadingIcon="notifications" title={t("views.notifications")} trailing="chevron" onClick={() => setView("notifications")} />
        <ListRow leadingIcon="mic" title={t("views.shortcuts")} trailing="valueChevron" value={t("sc.connected")} onClick={() => setView("shortcuts")} />
        <ListRow leadingIcon="calendar" title={t("dailyReview")} trailing="valueChevron" value={s.reviewTime} showDivider={false} onClick={() => setView("notifications")} />
      </Group>
      <Group title={t("financeTasks")}>
        <ListRow leadingIcon="pocket" title={t("pockets")} trailing="chevron" onClick={() => router.push("/finance")} />
        <ListRow leadingIcon="tag" title={t("categories")} trailing="chevron" onClick={() => router.push("/finance")} />
        <ListRow leadingIcon="list" title={t("taskLists")} trailing="chevron" showDivider={false} onClick={() => router.push("/tasks")} />
      </Group>
      <Group title={t("data")}>
        <ListRow leadingIcon="export" title={t("exportCsv")} trailing="chevron" onClick={() => setExportOpen(true)} />
        <ListRow leadingIcon="delete" title={t("views.deleted")} trailing="valueChevron" value={String(deletedCount)} showDivider={false} onClick={() => setView("deleted")} />
      </Group>
      <Group title={t("account.section")}>
        <ListRow leadingIcon="lock" title={t("signOut")} trailing="chevron" onClick={() => setSignOut(true)} />
        <ListRow leadingIcon="delete" title={t("account.delete")} trailing="chevron" showDivider={false} className="text-destructive" onClick={() => setView("deleteAccount")} />
      </Group>
      <p className="t-footnote text-center text-ink-tertiary">Unio v1.0 · Rp0/bulan</p>

      {now && <ExportSheet open={exportOpen} onClose={() => setExportOpen(false)} txs={transactions} tasks={tasks} now={now} />}
      <Dialog open={signOut} onClose={() => setSignOut(false)} title={t("signOutTitle")} message={t("signOutBody")} confirmLabel={t("signOut")} onConfirm={() => router.push("/login")} />
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-30 flex justify-center md:bottom-8">
          <Toast message={toast} className="pointer-events-auto" />
        </div>
      )}
    </div>
  );
}
