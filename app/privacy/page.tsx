import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"

const privacyNotes = [
  "This site does not ask for account signups, comments, or uploads.",
  "Spotify cards pull listening data from my own Spotify connection. That data is public on the page, but it is not collected from visitors.",
  "Vercel Analytics and Speed Insights may collect standard anonymous usage metrics so I can see whether the site is working.",
  "If you email me, that message obviously lands in my inbox. I keep it only as long as needed to reply or keep context.",
]

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="privacy" subtitle="short version, not lawyer poetry" breadcrumb="som / privacy" />
      <PageTransition>
        <main id="main-content" className="relative min-h-screen">
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-12">
            <div className="note-frame max-w-3xl px-6 py-6 md:px-8 md:py-8">
              <p className="eyebrow mb-3">what happens here</p>
              <h1 className="section-title text-2xl font-semibold text-[#eef1f5] md:text-3xl">
                very little, honestly.
              </h1>
              <p className="section-lede mt-4 text-sm">
                This is a portfolio, not a growth machine. I keep data handling minimal and boring on purpose.
              </p>

              <div className="mt-8 space-y-3">
                {privacyNotes.map((note) => (
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
