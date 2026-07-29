import type { Metadata } from "next";
import tracksJson from "./data/tracks.json";
import { FlowExperience } from "./flow-experience";

type TrackIdentifier = { id: string };
const tracks = tracksJson as TrackIdentifier[];
const description = "YeezyFlow: Explore Ye's Discography";
const rootImage = "/opengraph-image?d88828cf234adaa8";
const rootImageAlt = "Kanye West with his arms raised in a crowd";

export const metadata: Metadata = {
  title: "yeezyflow",
  description,
  openGraph: {
    title: "yeezyflow",
    description,
    url: "/",
    siteName: "yeezyflow",
    type: "website",
    images: [{ url: rootImage, type: "image/png", width: 1200, height: 630, alt: rootImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "yeezyflow",
    description,
    images: [{ url: rootImage, type: "image/png", width: 1200, height: 630, alt: rootImageAlt }],
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
