import type { ReactNode } from "react"
import { TypeIn } from "@/components/motion/type-in"

interface SectionHeaderProps {
  /** Mono kicker label, e.g. "about". A per-world glyph ($ / ~) is prefixed via CSS. */
  kicker: string
  /** Section title — accepts ReactNode so callers can pass typo-highlighted text. */
  title: ReactNode
  /** Optional italic aside under the title. */
  aside?: ReactNode
  /** Nerdy world: the title types in with a caret (string titles only). */
  typeIn?: boolean
  className?: string
}

/**
 * Shared section heading. The kicker color and prefix glyph are driven by the
 * nearest [data-world] ancestor (green "$" in the nerdy world, pink "~" in the
 * creative world), so the two worlds read differently without per-page code.
 */
export function SectionHeader({ kicker, title, aside, typeIn, className }: SectionHeaderProps) {
  return (
    <div className={className}>
      <p className="section-kicker font-mono text-xs tracking-[0.2em] uppercase text-world mb-3">
        {kicker}
      </p>
      <h2 className="text-[length:var(--text-h1)] font-bold tracking-[-0.02em] text-ink-100 leading-[1.05] mb-2">
        {typeIn && typeof title === "string" ? <TypeIn text={title} /> : title}
      </h2>
      {aside && <p className="text-sm text-ink-400 italic">{aside}</p>}
    </div>
  )
}
