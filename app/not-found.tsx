import Link from "next/link"
import { PageHeader } from "@/components/page-header"

const places = [
  { href: "/", label: "/", note: "the threshold. start over, pick a side." },
  { href: "/nerdy", label: "/nerdy", note: "resume, hacking stuff, certs. the hireable one." },
  { href: "/creative", label: "/creative", note: "photos, sketches, worse opinions." },
  { href: "/rebots.txt", label: "/rebots.txt", note: "you were never supposed to find this one anyway." },
]

export default function NotFound() {
  return (
    <div data-world="nerdy" className="min-h-screen">
      <PageHeader title="404" subtitle="wrong turn, right vibe" breadcrumb="som / lost" />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="paper-card relative p-7 md:p-9">
          <div className="tape-top" />

          <pre className="m-0 whitespace-pre-wrap font-mono text-sm leading-7 text-ink-200">
            <span className="text-world">$</span> cd {"<wherever you were going>"}
            {"\n"}
            <span className="text-ink-400">err 404: that corner doesn&apos;t exist. never did. or i deleted it at 3 am. hard to say.</span>
            {"\n\n"}
            <span className="text-world">$</span> ls /places-that-do-exist
          </pre>

          <ul className="mt-4 flex flex-col gap-2 font-mono text-sm">
            {places.map((p) => (
              <li key={p.href} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <Link
                  href={p.href}
                  className="draw-underline w-fit text-world hover:text-ink-100 transition-colors"
                >
                  {p.label}
                </Link>
                <span className="text-ink-400">{p.note}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-mono text-xs text-ink-400">
            <span className="caret" aria-hidden />
          </p>
        </div>

        <p className="mt-6 font-mono text-xs text-ink-400">
          fun fact: you are the 404th visitor to get lost here. probably. i don&apos;t track you, so let&apos;s both pretend.
        </p>
      </main>
    </div>
  )
}
