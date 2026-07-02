import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "doodling",
  description:
    "Som Chandra's sketchbook — graphite doodles, rough anatomy studies, and the pages honest enough to survive the erase pass.",
  openGraph: {
    title: "som — doodling",
    description: "Graphite dust and late nights: sketches from the 3 AM brain.",
    url: "/creative/doodling",
  },
  alternates: { canonical: "/creative/doodling" },
}

export default function DoodlingLayout({ children }: { children: ReactNode }) {
  return children
}
