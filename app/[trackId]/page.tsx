import type { Metadata } from "next";
import { notFound } from "next/navigation";
import tracksJson from "../data/tracks.json";
import { FlowExperience } from "../flow-experience";

type TrackMeta = { id: string; title: string; note: string };
const tracks = tracksJson as TrackMeta[];
const description = "A curated, interactive index of 55 Kanye West tracks spanning 2004 to 2026.";

function socialImage(trackId: string) {
  return {
    url: `/${trackId}/opengraph-image?30c237afccd2e788`,
    type: "image/png",
    width: 2400,
    height: 1350,
    alt: "yeezyflow",
  };
}

export function generateStaticParams() {
  return tracks.map((track) => ({ trackId: track.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ trackId: string }> }): Promise<Metadata> {
  const { trackId } = await params;
  const track = tracks.find((candidate) => candidate.id === trackId);
  if (!track) {
    const image = {
      url: "/opengraph-image?5bd683d04aac139f",
      type: "image/png" as const,
      width: 2400,
      height: 1350,
      alt: "yeezyflow",
    };
    return {
      title: "Not found · yeezyflow",
      description,
      robots: { index: false, follow: false },
      openGraph: {
        title: "yeezyflow",
        description,
        url: "/",
        siteName: "yeezyflow",
        type: "website",
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title: "yeezyflow",
        description,
        images: [image],
      },
    };
  }
  const title = `${track.title} · yeezyflow`;
  const image = socialImage(track.id);
  return {
    title,
    description: track.note,
    openGraph: {
      title,
      description: track.note,
      url: `/${track.id}`,
      siteName: "yeezyflow",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: track.note,
      images: [image],
    },
  };
}

export default async function TrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  if (!tracks.some((track) => track.id === trackId)) notFound();
  return <FlowExperience initialTrackId={trackId} />;
}
