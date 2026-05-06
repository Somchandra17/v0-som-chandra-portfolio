import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"

const termsNotes = [
  "Use the site, read the pages, click around, enjoy the weird bits.",
  "Do not scrape or republish the artwork, photos, or writing as your own.",
  "Project links, writeups, and resume details are provided as-is. They can change over time.",
  "Nothing here is legal, security, or employment advice. It is a portfolio.",
  "If something is inaccurate or you need something removed, email me and I will deal with it directly.",
]

export default function TermsPage() {
  return (
    <>
      <PageHeader title="terms" subtitle="lightweight and human-readable" breadcrumb="som / terms" />
      <PageTransition>
        <main id="main-content" className="relative min-h-screen">
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-12">
            <div className="note-frame max-w-3xl px-6 py-6 md:px-8 md:py-8">
              <p className="eyebrow mb-3">ground rules</p>
              <h1 className="section-title text-2xl font-semibold text-[#eef1f5] md:text-3xl">
                nothing dramatic here either.
              </h1>
              <p className="section-lede mt-4 text-sm">
                This page exists so the footer is not lying to you. The rules are basic and mostly common sense.
              </p>

              <div className="mt-8 space-y-3">
                {termsNotes.map((note) => (
                  <div key={note} className="border-t border-[#232830] pt-3 first:border-t-0 first:pt-0">
                    <p className="text-sm leading-relaxed text-[#cfd4dc]">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </PageTransition>
    </>
  )
}
