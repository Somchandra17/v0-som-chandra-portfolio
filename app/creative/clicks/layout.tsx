import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "clicks",
  description:
    "Som Chandra's photo archive — 80+ frames shot on a phone between normal life stuff and random detours. No fancy gear, jus vibes.",
  openGraph: {
    title: "som — clicks",
    description: "Phone photography: kept moments from trains, streets, and random detours.",
    url: "/creative/clicks",
  },
  alternates: { canonical: "/creative/clicks" },
}

export default function ClicksLayout({ children }: { children: ReactNode }) {
  return children
}
