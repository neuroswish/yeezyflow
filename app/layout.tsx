import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yeezyflow.vercel.app"),
  title: "yeezyflow",
  description: "A curated, interactive index of 55 Kanye West tracks spanning 2004 to 2026.",
  applicationName: "yeezyflow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "yeezyflow",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-source.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

const themeScript = `
  try {
    var saved = localStorage.getItem("yeezyflow-theme");
    document.documentElement.dataset.theme = saved === "light" || saved === "dark"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
