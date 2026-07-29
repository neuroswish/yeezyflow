import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found · yeezyflow",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main style={{ padding: 48, fontFamily: "system-ui, sans-serif" }}>
      <p style={{ margin: 0, fontSize: 14, opacity: 0.5 }}>yeezyflow</p>
      <h1 style={{ margin: "8px 0 0", fontSize: 24, letterSpacing: "-0.03em" }}>Track not found</h1>
      <p style={{ marginTop: 12 }}>
        <Link href="/" style={{ color: "inherit" }}>Back to the index</Link>
      </p>
    </main>
  );
}
