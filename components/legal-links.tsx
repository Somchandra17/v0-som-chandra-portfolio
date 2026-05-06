import Link from "next/link"

export function LegalLinks() {
  return (
    <nav className="flex flex-wrap items-center gap-3 text-[0.72rem] text-[#707784]">
      <Link href="/privacy" className="transition-colors hover:text-[#e8e8e8]">
        privacy
      </Link>
      <Link href="/terms" className="transition-colors hover:text-[#e8e8e8]">
        terms
      </Link>
    </nav>
  )
}
