import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "the unhinged side",
  description:
    "Som Chandra's creative corner — phone photography, graphite doodles, and late-night scribbles. The fun half of a cybersecurity nerd.",
  openGraph: {
    title: "som — the unhinged side",
    description:
      "Phone photography, graphite doodles, and late-night scribbles. The fun half.",
    url: "/creative",
  },
  alternates: { canonical: "/creative" },
}

export default function CreativeLayout({ children }: { children: ReactNode }) {
  return <div data-world="creative">{children}</div>
}
