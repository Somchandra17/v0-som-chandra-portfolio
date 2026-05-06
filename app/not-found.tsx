import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <main id="main-content" className="relative min-h-[100dvh]">
      <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-5xl items-center px-6 py-12">
        <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="note-frame px-5 py-5 md:px-6">
            <p className="eyebrow mb-3">404</p>
            <h1 className="section-title text-3xl font-semibold text-[#eef1f5] md:text-5xl">
              this page wandered off.
            </h1>
            <p className="section-lede mt-4 text-sm">
              Either the URL is wrong, or I moved something and forgot to leave a trail behind.
            </p>
          </div>

          <div className="paper-card flex flex-col justify-between p-6 md:p-8">
            <div>
              <p className="eyebrow mb-3">good exits</p>
              <div className="space-y-3 text-sm text-[#cfd4dc]">
                <p>Go back home if you want the main fork in the road.</p>
                <p>Head to the nerdy side for resume and security work, or the unhinged side for photos and sketches.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 border border-[#2f3540] px-4 py-2 text-sm text-[#d7dbe2] transition-colors hover:border-[#4b5361] hover:text-[#ffffff]"
              >
                <ArrowLeft className="h-4 w-4" />
                back home
              </Link>
              <Link
                href="/nerdy"
                className="inline-flex items-center gap-2 border border-[#2f3540] px-4 py-2 text-sm text-[#d7dbe2] transition-colors hover:border-[#4b5361] hover:text-[#ffffff]"
              >
                nerdy side
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/creative"
                className="inline-flex items-center gap-2 border border-[#2f3540] px-4 py-2 text-sm text-[#d7dbe2] transition-colors hover:border-[#4b5361] hover:text-[#ffffff]"
              >
                unhinged side
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
