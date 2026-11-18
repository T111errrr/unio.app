"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ListRow } from "@/components/ui/ListRow";
import { Sheet } from "@/components/ui/Sheet";
import { cx } from "@/lib/cx";
import type { Transaction } from "@/lib/finance/store";
import { toCsv } from "@/lib/recap/calc";
import type { Task } from "@/lib/tasks/types";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

type Props = { open: boolean; onClose: () => void; txs: Transaction[]; tasks: Task[]; now: Date };

/** Ekspor CSV (Figma 53:3573) + keadaan berhasil (53:3635). File dibuat di perangkat, tidak dikirim ke mana pun. */
export function ExportSheet({ open, onClose, txs, tasks, now }: Props) {
  const t = useTranslations("recap");
  const [withTx, setWithTx] = useState(true);
  const [withTasks, setWithTasks] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFrom(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
      setTo(iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
      setDone(null);
    }
  }, [open, now]);

  const invalid = (!withTx && !withTasks) || !from || !to || from > to;

  function run() {
    const inR = (d: string) => iso(new Date(d)) >= from && iso(new Date(d)) <= to;
    const rows: string[][] = [];
    if (withTx) {
      rows.push([t("csv.tx"), "", "", "", "", ""], [t("csv.date"), t("csv.type"), t("csv.note"), t("csv.category"), t("csv.pocket"), t("csv.amount")]);
      for (const x of txs.filter((x) => inR(x.at))) rows.push([iso(new Date(x.at)), x.kind, x.note, x.category, x.pocket, String(x.amount)]);
    }
    if (withTasks) {
      if (rows.length) rows.push([]);
      rows.push([t("csv.tasks"), "", "", ""], [t("csv.date"), t("csv.title"), t("csv.list"), t("csv.status")]);
      for (const x of tasks.filter((x) => !x.deletedAt && x.due && inR(x.due))) rows.push([iso(new Date(x.due as string)), x.title, x.list, x.done ? t("csv.done") : t("csv.open")]);
    }
    const name = `unio-${from}-${to}.csv`;
    const url = URL.createObjectURL(new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDone(name);
  }

  const dateCls = "t-body h-14 w-full rounded-(--radius-control) bg-field px-4 outline-none";

  return (
    <Sheet open={open} onClose={onClose} title={t("exportTitle")}>
      {done ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <span className="text-income"><Icon name="checkbox-on" size="xlarge" filled /></span>
          <h3 className="t-title-3">{t("exportDone")}</h3>
          <p className="t-subheadline break-all text-ink-secondary">{done}</p>
          <Button className="mt-3" onClick={onClose}>{t("close")}</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-(--radius-card-inner) bg-surface-inset px-3 py-1">
            <ListRow leadingSurface leadingIcon="nav-finance" title={t("transactions")} trailing="check" checked={withTx} onClick={() => setWithTx(!withTx)} />
            <ListRow leadingSurface leadingIcon="nav-tasks" title={t("tasks")} trailing="check" checked={withTasks} onClick={() => setWithTasks(!withTasks)} showDivider={false} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2"><span className="t-callout text-ink-secondary">{t("from")}</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={dateCls} /></label>
            <label className="flex flex-col gap-2"><span className="t-callout text-ink-secondary">{t("to")}</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={dateCls} /></label>
          </div>
          {from && to && from > to && <p role="alert" className="t-footnote text-destructive">{t("badRange")}</p>}
          <p className="t-footnote text-ink-secondary">{t("exportNote")}</p>
          <Button icon="export" disabled={invalid} onClick={run}>{t("exportCsv")}</Button>
        </div>
      )}
    </Sheet>
  );
}
