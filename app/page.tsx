import type { Metadata } from "next";
import tracksJson from "./data/tracks.json";
import { FlowExperience } from "./flow-experience";

type TrackIdentifier = { id: string };
const tracks = tracksJson as TrackIdentifier[];
const description = "A curated, interactive index of 55 Kanye West tracks spanning 2004 to 2026.";
const rootImage = "/opengraph-image?5bd683d04aac139f";

export const metadata: Metadata = {
  title: "yeezyflow",
  description,
  openGraph: {
    title: "yeezyflow",
    description,
    url: "/",
    siteName: "yeezyflow",
    type: "website",
    images: [{ url: rootImage, type: "image/png", width: 2400, height: 1350, alt: "yeezyflow" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "yeezyflow",
    description,
    images: [{ url: rootImage, type: "image/png", width: 2400, height: 1350, alt: "yeezyflow" }],
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const requestedTrack = tracks.find((track) => Object.prototype.hasOwnProperty.call(values, track.id));
  return <FlowExperience initialTrackId={requestedTrack?.id} />;
}
