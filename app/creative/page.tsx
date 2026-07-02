"use client"

import { useState, useMemo, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { NowPlaying } from "@/components/now-playing"
import { SectionHeader } from "@/components/section-header"
import { SectionReveal } from "@/components/motion/section-reveal"
import { DevelopIn } from "@/components/motion/develop-in"
import { ArrowRight } from "lucide-react"
import { INK } from "@/lib/tokens"
import { thoughts, formatMonthYear } from "@/lib/creative-data"
import { measureText, fonts, usePretextReady } from "@/lib/pretext"

// ── Intentional typos system ───────────────────────────────────────
const intentionalTypos = new Map<string, { correct: string; roast: string }>([
  ["becus", { correct: "because", roast: "bruh u typed becus again like always lol" }],
  ["shoudl", { correct: "should", roast: "fingers too lazy to hit d huh" }],
  ["hones", { correct: "honest", roast: "ya i cant even spell honest properly lmao" }],
  ["totaly", { correct: "totally", roast: "u missed the l again u legend" }],
  ["perfec", { correct: "perfect", roast: "museum perfec? more like museum fail lol" }],
  ["journalin", { correct: "journaling", roast: "visual journalin from a guy who forgets how to spell journaling" }],
  ["definately", { correct: "definitely", roast: "definately the word u murder every time" }],
  ["questionble", { correct: "questionable", roast: "bruh u typed questionble again like u cant even question ur own spelling lmao" }],
  ["befor", { correct: "before", roast: "music works befor language... ya u missed the e king" }],
  ["xactly", { correct: "exactly", roast: "xactly where it is trying to go... u got the x but forgot the e lol" }],
  ["alwys", { correct: "always", roast: "not alwys first... bro u missed the a" }],
  ["sumtimes", { correct: "sometimes", roast: "sumtimes the voice is jus another instrumnt" }],
  ["instrumnt", { correct: "instrument", roast: "voice is jus another instrumnt... missing 2 letters my guy" }],
  ["intrestin", { correct: "interesting", roast: "this sounds intrestin to me every single time i fail spelling" }],
  ["evry", { correct: "every", roast: "evry single time... u missed the e again" }],
  ["occaisionaly", { correct: "occasionally", roast: "i still replay tracks occaisionaly... triple kill on this word" }],
  ["finaly", { correct: "finally", roast: "my brain finaly stops switching tabs" }],
  ["seprate", { correct: "separate", roast: "keep rough studies on seprate pages" }],
  ["tommorow", { correct: "tomorrow", roast: "tiny notes to tommorow me" }],
  ["acheive", { correct: "achieve", roast: "i can actualy acheive flow here" }],
  ["calender", { correct: "calendar", roast: "strict photo calender" }],
  ["anomolies", { correct: "anomalies", roast: "tiny anomolies from security work" }],
  ["wierd", { correct: "weird", roast: "its a wierd crossover... or wait weired? idk i confuse both lol" }],
  ["weired", { correct: "weird", roast: "its a wierd crossover... or wait weired? idk i confuse both lol" }],
  ["usefull", { correct: "useful", roast: "truely usefull... double l king" }],
  ["freinds", { correct: "friends", roast: "my freinds think i overthink" }],
  ["thier", { correct: "their", roast: "yeah thier probly right" }],
  ["probly", { correct: "probably", roast: "thier probly right... u missed the a" }],
  ["becums", { correct: "becomes", roast: "sumtimes that becums the shot" }],
  ["starin", { correct: "staring", roast: "bruh u typed starin twice like u cant even look at the word properly lol" }],
  ["sketchin", { correct: "sketching", roast: "sketchin is where i slow down... ya fingers gave up again king" }],
  ["hoppin", { correct: "hopping", roast: "stop tab hoppin in my head... missing the g cus im lazy af" }],
  ["jus", { correct: "just", roast: "sometimes jus shapes... classic me missing the t" }],
  ["usualy", { correct: "usually", roast: "i usualy recieve... missed the l like always" }],
  ["recieve", { correct: "receive", roast: "i usualy recieve one useful idea... ya i murder this word every single time" }],
  ["becuase", { correct: "because", roast: "i keep the messy pages too becuase... cus spelling because is too hard for me" }],
  ["lil", { correct: "little", roast: "a lil chaotic... i even shorten little wrong lol" }],
])

const typoPattern = new RegExp(`\\b(${Array.from(intentionalTypos.keys()).join("|")})\\b`, "gi")

function IntentionalTypo({ wrong, correct, roast }: { wrong: string; correct: string; roast: string }) {
  return (
    <span className="relative inline-block group/typo cursor-help">
      <span className="underline decoration-wavy decoration-pink-300/90 underline-offset-2">{wrong}</span>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden w-max max-w-[240px] -translate-x-1/2 rounded-sm border border-pink-200/70 bg-pink-100 px-2 py-1 text-[11px] leading-snug text-roast-ink shadow-[0_8px_20px_rgba(236,72,153,0.18)] group-hover/typo:block">
        <strong>{correct}</strong>
        {" — "}
        {roast}
      </span>
    </span>
  )
}

function renderWithTypos(text: string, maxWavy = Infinity): ReactNode {
  let wavyShown = 0
  return text.split(typoPattern).map((part, index) => {
    const typoMeta = intentionalTypos.get(part.toLowerCase())
    if (!typoMeta) return part
    wavyShown += 1
    // Restraint by default: only the first squiggle(s) per block show; the toggle reveals all.
    if (wavyShown > maxWavy) return part
    return (
      <IntentionalTypo
        key={`${part}-${index}`}
        wrong={part}
        correct={typoMeta.correct}
        roast={typoMeta.roast}
      />
    )
  })
}

// ── Section data ───────────────────────────────────────────────────
type Section = "photos" | "sketches"

const sections: {
  key: Section
  label: string
  href: string
  images: string[]
  heading: string
  subtitle: string
  description: string[]
  byTheWay: string
}[] = [
  {
    key: "photos",
    label: "clicks",
    href: "/creative/clicks",
    images: [
      "/gallery/clicks/1-480.webp",
      "/gallery/clicks/3-480.webp",
    ],
    heading: "when im not starin at screens im probly holdin my phone wrong.",
    subtitle: "(no i dont own a camera its all on my phone lol ya im that broke n lazy)",
    description: [
      "i dont reely do planned photo walks most frames happen between normal life stuff n random detours.",
      "i take the shot becus something catches for one second light reflections faces tiny moments then it is gone.",
      "i dont over process much i shoudl probably do more edits but raw vibes feel more honest to me.",
      "none of this is museum perfec it is more like visual journalin from someone who stares at terminals all day.",
    ],
    byTheWay: "travel is still my reset button trains buses tea stalls airport delays all of it. i can improvise around bad plans but i definately cannot survive rigid group itineraries for long half the good stories happen when plans break.",
  },
  {
    key: "sketches",
    label: "doodling",
    href: "/creative/doodling",
    images: [
      "/gallery/sketch/1-480.webp",
      "/gallery/sketch/2-480.webp",
    ],
    heading: "when im not starin at screens im usually covered in graphite dust.",
    subtitle: "(and starin at a blank sketchbook like it owes me money lol)",
    description: [
      "sketchin is where i slow down n stop tab hoppin in my head.",
      "mostly faces hands n rough anatomy in graphite sometimes jus shapes till the page feels right.",
      "some nights r ten minute warmups n some go for hours if i stay with it i usualy recieve one useful idea.",
      "i keep the messy pages too becuase those teach me more than polished ones.",
    ],
    byTheWay: "best sketch sessions happen late when the world goes quiet 3 am brain is fast honest n a lil chaotic in a useful way.",
  },
]


export default function CreativePage() {
  const [activeSection, setActiveSection] = useState<Section>("photos")
  const [hasClicked, setHasClicked] = useState(false)
  const [showAllFixes, setShowAllFixes] = useState(false)
  const maxWavy = showAllFixes ? Infinity : 1
  const pretextReady = usePretextReady()

  const active = sections.find((s) => s.key === activeSection) ?? sections[0]

  // Pre-measure all bio section heights with pretext for stable container sizing.
  // Approximate until fonts are ready so SSR markup matches the first client render.
  const bioMeasurements = useMemo(() => {
    const BIO_WIDTH = 400
    const LINE_HEIGHT = 22

    return sections.map((section) => {
      try {
        const headingHeight = measureText(section.heading, fonts.bold(20), BIO_WIDTH, 28, pretextReady).height
        const subtitleHeight = measureText(section.subtitle, fonts.body(14), BIO_WIDTH, 20, pretextReady).height
        const descHeight = section.description.reduce((acc, para) => {
          return acc + measureText(para, fonts.body(14), BIO_WIDTH, LINE_HEIGHT, pretextReady).height + 12
        }, 0)
        const byTheWayHeight = measureText(section.byTheWay, fonts.body(14), BIO_WIDTH - 16, LINE_HEIGHT, pretextReady).height

        return {
          key: section.key,
          totalHeight: headingHeight + subtitleHeight + descHeight + byTheWayHeight + 80, // padding
        }
      } catch {
        return { key: section.key, totalHeight: 380 }
      }
    })
  }, [pretextReady])

  // Use maximum height across all sections for stable container
  const maxBioHeight = useMemo(() => {
    return Math.max(...bioMeasurements.map((m) => m.totalHeight), 380)
  }, [bioMeasurements])

  const handleHover = (key: Section) => {
    if (!hasClicked) {
      setActiveSection(key)
    }
  }

  const handleClick = (key: Section) => {
    setHasClicked(true)
    setActiveSection(key)
  }

  return (
    <>
      <PageHeader title="the unhinged side" subtitle="clicks / doodling / late-night scribbles" breadcrumb="som / creative" />

      <PageTransition>
        <main id="main-content" className="relative min-h-screen">

          {/* Spelling disclaimer */}
          <div className="mx-auto max-w-5xl px-6 pt-6">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              onClick={() => setShowAllFixes((v) => !v)}
              aria-pressed={showAllFixes}
              className="font-mono text-[0.65rem] text-ink-700 italic text-right bg-pink-200/80 px-3 py-1.5 rounded-sm inline-block float-right cursor-pointer transition-colors hover:bg-pink-200"
            >
              {showAllFixes
                ? "* ok that's all of them. hover any squiggle for the roast. [hide most]"
                : "* some typos are intentional. hover a squiggle for the fix + a tiny roast. [show all]"}
            </motion.button>
            <div className="clear-both" />
          </div>

          <NowPlaying />

          {/* -- Split-screen: Nav + Bio -- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 py-10">
            <SectionReveal>
              <p className="font-mono text-xs tracking-widest uppercase text-ink-300 mb-6">the other half</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
                {/* Left side: nav items with image reveal */}
                <div className="relative flex flex-col justify-center gap-0">
                  {/* Floating image reveal -- shared, positioned relative to nav container */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      className="pointer-events-none absolute -top-4 right-0 flex gap-3 z-20"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      {active.images.map((src, i) => (
                        <motion.div
                          key={i}
                          className="w-20 h-20 md:w-24 md:h-24 overflow-hidden border border-ink-600 shadow-2xl"
                          initial={{ opacity: 0, rotate: 0 }}
                          animate={{
                            opacity: 0.9,
                            rotate: i === 0 ? -6 : 5,
                          }}
                          transition={{ duration: 0.3, delay: i * 0.08 }}
                          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`${active.label} preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  {sections.map((section) => {
                    const isActive = activeSection === section.key
                    return (
                      <Link
                        key={section.key}
                        href={section.href}
                        onMouseEnter={() => handleHover(section.key)}
                        onClick={(e) => {
                          if (!hasClicked || activeSection !== section.key) {
                            e.preventDefault()
                            handleClick(section.key)
                          }
                        }}
                        className="group relative block"
                      >
                        <div className="flex items-center gap-4 py-5 px-2">
                          <motion.h2
                            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
                            animate={{ color: isActive ? INK[100] : INK[500] }}
                            transition={{ duration: 0.3 }}
                          >
                            {section.label}
                          </motion.h2>
                          <motion.div
                            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="h-5 w-5 text-accent-creative" />
                          </motion.div>
                        </div>

                        {/* Active indicator line */}
                        <motion.div
                          className="absolute bottom-0 left-0 h-px bg-accent-creative"
                          animate={{ width: isActive ? "100%" : "0%" }}
                          transition={{ duration: 0.4 }}
                        />
                      </Link>
                    )
                  })}

                  {/* Click hint */}
                  <AnimatePresence>
                    {hasClicked && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-mono text-[0.65rem] text-accent-creative mt-3 pl-2"
                      >
                        {"click again to view the full gallery ->"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right side: bio content -- grid column locks width */}
                <div 
                  className="flex flex-col justify-center lg:border-l lg:border-ink-700 lg:pl-10 mt-6 lg:mt-0 overflow-hidden"
                  style={{ minHeight: `${maxBioHeight}px` }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.key}
                      initial={{ opacity: 0, filter: "blur(6px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(6px)" }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg md:text-xl font-bold text-ink-100 tracking-tight leading-snug">
                        {renderWithTypos(active.heading, maxWavy)}
                      </h3>
                      <p className="text-sm text-ink-400 italic">
                        {renderWithTypos(active.subtitle, maxWavy)}
                      </p>

                      <div className="space-y-3 text-sm text-ink-200 leading-relaxed">
                        {active.description.map((para, i) => (
                          <p key={i}>{renderWithTypos(para, maxWavy)}</p>
                        ))}
                      </div>

                      <div className="border-l-2 border-ink-500 pl-4 py-2">
                        <p className="text-xs font-mono tracking-wider text-ink-300 uppercase mb-1">by the way</p>
                        <p className="text-sm text-ink-200">{renderWithTypos(active.byTheWay, maxWavy)}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* -- Thoughts -- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 py-14">
            <SectionReveal>
              <div className="border-t border-ink-600 pt-10">
                <SectionHeader
                  kicker="thoughts"
                  title={renderWithTypos("things i wrote at questionble hours.", maxWavy)}
                  aside={renderWithTypos("(3 am brain is a diffrent person)", maxWavy)}
                />
              </div>
            </SectionReveal>

            <div className="space-y-5">
              {thoughts.map((t, i) => (
                <DevelopIn key={t.title} index={i} rotate={i % 2 === 0 ? -1 : 0.8}>
                  <article className="paper-card p-5 md:p-7 hover-bounce">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-ink-100">{renderWithTypos(t.title, maxWavy)}</h3>
                      <span className="font-mono text-xs text-ink-300">{t.date}</span>
                    </div>
                    <p className="text-sm text-ink-200 leading-relaxed">
                      {renderWithTypos(t.body, maxWavy)}
                    </p>
                  </article>
                </DevelopIn>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-ink-600">
            <div className="mx-auto max-w-5xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-ink-400">som chandra -- {new Date().getFullYear()}</p>
              <p className="font-mono text-xs text-ink-400">the unhinged side</p>
            </div>
            <div className="mx-auto max-w-5xl px-6 pb-7">
              <p className="font-mono text-[0.65rem] text-ink-700 italic text-right bg-pink-200/80 px-3 py-1.5 rounded-sm inline-block float-right">
                {'* those roast was from Grok i know it sucks lol ai "'}
              </p>
              <div className="clear-both" />
            </div>
          </footer>
        </main>
      </PageTransition>
    </>
  )
}
