"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { CaptureSheet } from "@/components/capture/CaptureSheet";
import { SidebarBody } from "./SidebarBody";
import { TabBar } from "./TabBar";

/**
 * Kerangka aplikasi:
 * - < 768 px  : tab bar melayang + tombol tangkap
 * - 768–1279  : Sidebar Rail 72 px + drawer (sidebar penuh menggeser dari kiri)
 * - ≥ 1280    : Sidebar penuh 248 px
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  // Ctrl+N (atau Cmd+N) membuka Catat cepat.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setCaptureOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Tutup drawer saat pindah halaman.
  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="min-h-dvh bg-background text-ink md:flex">
      <aside className="sticky top-0 hidden h-dvh w-18 shrink-0 border-r border-divider md:block xl:hidden">
        <SidebarBody variant="rail" onToggle={() => setDrawerOpen(true)} onCapture={() => setCaptureOpen(true)} />
      </aside>
      <aside className="sticky top-0 hidden h-dvh w-62 shrink-0 border-r border-divider xl:block">
        <SidebarBody variant="full" onCapture={() => setCaptureOpen(true)} />
      </aside>

      <main className="min-w-0 flex-1 pb-28 md:pb-0">{children}</main>

      <TabBar onCapture={() => setCaptureOpen(true)} />
      <CaptureSheet open={captureOpen} onClose={() => setCaptureOpen(false)} />

      {/* Drawer sidebar (hanya relevan di 768–1279 px). Esc dan klik di luar menutup. */}
      <dialog
        ref={drawerRef}
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setDrawerOpen(false);
        }}
        className="motion-drawer fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-62 max-w-none overflow-hidden bg-surface p-0 text-ink shadow-(--shadow-large) xl:hidden"
      >
        <SidebarBody variant="full" onToggle={() => setDrawerOpen(false)} onNavigate={() => setDrawerOpen(false)} onCapture={() => { setDrawerOpen(false); setCaptureOpen(true); }} />
      </dialog>
    </div>
  );
}
