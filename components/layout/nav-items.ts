import type { IconName } from "@/components/ui/Icon";

export type NavItem = {
  /** Alamat tanpa awalan bahasa. */
  href: "/today" | "/inbox" | "/tasks" | "/finance" | "/notes" | "/recap" | "/settings";
  icon: IconName;
  /** Kunci di messages `nav.*`. */
  label: "today" | "inbox" | "tasks" | "finance" | "notes" | "recap" | "settings";
};

/** Lima tab utama (tab bar mobile) — urutan mengikuti Figma. */
export const TAB_ITEMS: NavItem[] = [
  { href: "/today", icon: "nav-today", label: "today" },
  { href: "/tasks", icon: "nav-tasks", label: "tasks" },
  { href: "/finance", icon: "nav-finance", label: "finance" },
  { href: "/notes", icon: "nav-notes", label: "notes" },
  { href: "/recap", icon: "nav-recap", label: "recap" },
];

/** Menu sidebar desktop — Inbox ikut tampil di sini. */
export const SIDEBAR_ITEMS: NavItem[] = [
  { href: "/today", icon: "nav-today", label: "today" },
  { href: "/inbox", icon: "nav-inbox", label: "inbox" },
  { href: "/tasks", icon: "nav-tasks", label: "tasks" },
  { href: "/finance", icon: "nav-finance", label: "finance" },
  { href: "/notes", icon: "nav-notes", label: "notes" },
  { href: "/recap", icon: "nav-recap", label: "recap" },
];

export const SETTINGS_ITEM: NavItem = { href: "/settings", icon: "nav-settings", label: "settings" };

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
