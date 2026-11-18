import type { ReactNode } from "react";

/** Template dibuat ulang tiap pindah halaman, jadi isi halaman masuk dengan fade + geser halus. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="motion-page">{children}</div>;
}
