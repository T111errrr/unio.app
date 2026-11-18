import type { Metadata, Viewport } from "next";
import messages from "@/messages/id.json";
import { BROWSER_THEME_COLOR, DEFAULT_THEME, themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: messages.app.name,
  description: messages.app.tagline,
  applicationName: messages.app.name,
  appleWebApp: {
    capable: true,
    title: messages.app.name,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  // Next.js hanya menulis "mobile-web-app-capable"; tag Apple ini untuk iOS versi lama.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BROWSER_THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: BROWSER_THEME_COLOR.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
