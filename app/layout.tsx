import type { Metadata } from "next";
import "./globals.css";

const description = "YeezyFlow: Explore Ye's Discography";
const iconVersion = "1aedc036c539a92c";

export const metadata: Metadata = {
  metadataBase: new URL("https://yeezyflow.vercel.app"),
  title: "yeezyflow",
  description,
  applicationName: "yeezyflow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "yeezyflow",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: `/favicon.ico?${iconVersion}`, sizes: "64x64", type: "image/x-icon" },
      { url: `/icon-source.png?${iconVersion}`, sizes: "512x512", type: "image/png" },
    ],
    apple: { url: `/apple-icon.png?${iconVersion}`, sizes: "180x180", type: "image/png" },
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
