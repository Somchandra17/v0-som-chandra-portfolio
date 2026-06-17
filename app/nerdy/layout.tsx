import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  description:
    "Som Chandra — Cyber Security Engineer. Web/API/Android/iOS VAPT, AppSec automation, bug bounty Hall of Fames, and tools built at 2 AM. Resume, projects, and certs.",
  openGraph: {
    title: "som — the nerdy side",
    description:
      "Cyber Security Engineer. VAPT, AppSec automation, bug bounty Hall of Fames, and 2 AM tools.",
    url: "/nerdy",
  },
  alternates: { canonical: "/nerdy" },
}

export default function NerdyLayout({ children }: { children: ReactNode }) {
  return <div data-world="nerdy">{children}</div>
}
