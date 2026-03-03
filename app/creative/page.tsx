"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { NowPlaying } from "@/components/now-playing"
import { ArrowRight } from "lucide-react"
import { thoughts, formatMonthYear } from "@/lib/creative-data"

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
  ["experimnts", { correct: "experiments", roast: "most experimnts happen... missing half the letters as usual" }],
  ["cooperats", { correct: "cooperates", roast: "my brain cooperats... ya even my brain spells wrong at 3 am" }],
  ["tweakin", { correct: "tweaking", roast: "keep tweakin setups... fingers gave up on the g again" }],
  ["hesitent", { correct: "hesitant", roast: "jus less hesitent... i even spell hesitant wrong while talking about being less hesitant lol" }],
])

const typoPattern = new RegExp(`\\b(${Array.from(intentionalTypos.keys()).join("|")})\\b`, "gi")

function IntentionalTypo({ wrong, correct, roast }: { wrong: string; correct: string; roast: string }) {
  return (
    <span className="relative inline-block group/typo cursor-help">
      <span className="underline decoration-wavy decoration-pink-300/90 underline-offset-2">{wrong}</span>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden w-max max-w-[240px] -translate-x-1/2 rounded-sm border border-pink-200/70 bg-pink-100 px-2 py-1 text-[11px] leading-snug text-[#4a2f39] shadow-[0_8px_20px_rgba(236,72,153,0.18)] group-hover/typo:block">
        <strong>{correct}</strong>
        {" — "}
        {roast}
      </span>
    </span>
  )
}

function renderWithTypos(text: string): ReactNode {
  return text.split(typoPattern).map((part, index) => {
    const typoMeta = intentionalTypos.get(part.toLowerCase())
    if (!typoMeta) return part
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
type Section = "sidequests" | "photos" | "sketches"

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
    key: "sidequests",
    label: "Visual Detors",
    href: "/creative/visual-detours",
    images: [
      "/creative/pictures/sidequest/1.jpeg",
      "/creative/pictures/sidequest/2.jpg",
    ],
    heading: "when im not starin at screens im probly doing something questionble.",
    subtitle: "(side quests r secretly the main quest)",
    description: [
      "i live for side quests the stranger they r the better the story later.",
      "most experimnts happen between 2 am n 5 am when the internet is quiet n my brain cooperats.",
      "i still run linux daily n keep tweakin setups i shoudl probly leave alone.",
      "some ideas fail instantly n some turn into projects both r useful n kinda fun.",
    ],
    byTheWay: "i used to be the quiet kid in evry room now i talk more build more n ship faster same person jus less hesitent.",
  },
  {
    key: "photos",
    label: "Clicks",
    href: "/creative/clicks",
    images: [
      "/creative/pictures/clicks/1.jpg",
      "/creative/pictures/clicks/3.jpg",
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
    label: "Doodling",
    href: "/creative/doodling",
    images: [
      "/creative/pictures/sketch/somchandra17-20220711_143837-3108937688.webp",
      "/creative/pictures/sketch/somchandra17-20230924_221828-1887787865.jpg",
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

export default function CreativePage() {
  const [activeSection, setActiveSection] = useState<Section>("sidequests")
  const [hasClicked, setHasClicked] = useState(false)

  const active = sections.find((s) => s.key === activeSection) ?? sections[0]

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
      <PageHeader title="the unhinged side" subtitle="visual detors / clicks / doodling / late-night scribbles" />

      <PageTransition>
        <div className="relative min-h-screen">

          {/* Spelling disclaimer */}
          <div className="mx-auto max-w-5xl px-6 pt-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-mono text-[0.65rem] text-[#1a1a1a] italic text-right bg-pink-200/80 px-3 py-1.5 rounded-sm inline-block float-right"
            >
              {"* some typos are intentional. hover the squiggles for the fix + a tiny roast."}
            </motion.p>
            <div className="clear-both" />
          </div>

          <NowPlaying />

          {/* -- Split-screen: Nav + Bio -- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 py-10">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-6">the other half</p>

              <div className="flex flex-col lg:flex-row lg:gap-10 min-h-[420px]">
                {/* Left side: nav items with image reveal */}
                <div className="relative flex flex-col justify-center gap-0 lg:w-[45%] shrink-0">
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
                          className="w-20 h-20 md:w-24 md:h-24 overflow-hidden border border-[#333] shadow-2xl"
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
                            animate={{ color: isActive ? "#e8e8e8" : "#444" }}
                            transition={{ duration: 0.3 }}
                          >
                            {section.label}
                          </motion.h2>
                          <motion.div
                            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="h-5 w-5 text-[#f0c6cf]" />
                          </motion.div>
                        </div>

                        {/* Active indicator line */}
                        <motion.div
                          className="absolute bottom-0 left-0 h-px bg-[#f0c6cf]"
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono text-[0.6rem] text-[#555] mt-2 pl-2"
                      >
                        {"click again to view the full gallery ->"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right side: bio content -- fixed height to prevent padding shifts */}
                <div className="flex-1 flex flex-col justify-center lg:border-l lg:border-[#222] lg:pl-10 mt-6 lg:mt-0 min-h-[380px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.key}
                      initial={{ opacity: 0, filter: "blur(6px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(6px)" }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg md:text-xl font-bold text-[#e8e8e8] tracking-tight leading-snug">
                        {renderWithTypos(active.heading)}
                      </h3>
                      <p className="text-sm text-[#666] italic">
                        {renderWithTypos(active.subtitle)}
                      </p>

                      <div className="space-y-3 text-sm text-[#ccc] leading-relaxed">
                        {active.description.map((para, i) => (
                          <p key={i}>{renderWithTypos(para)}</p>
                        ))}
                      </div>

                      <div className="border-l-2 border-[#555] pl-4 py-2">
                        <p className="text-xs font-mono tracking-wider text-[#999] uppercase mb-1">by the way</p>
                        <p className="text-sm text-[#aaa]">{renderWithTypos(active.byTheWay)}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </section>

          {/* -- Thoughts -- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 py-14">
            <motion.div {...fadeUp}>
              <div className="border-t border-[#333] pt-10">
                <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">thoughts</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                  {renderWithTypos("things i wrote at questionble hours.")}
                </h2>
                <p className="text-sm text-[#666] mb-8 italic">
                  {renderWithTypos("(3 am brain is a diffrent person)")}
                </p>
              </div>
            </motion.div>

            <div className="space-y-5">
              {thoughts.map((t, i) => (
                <motion.article
                  key={t.title}
                  className="paper-card p-5 md:p-7 hover-bounce"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#e8e8e8]">{renderWithTypos(t.title)}</h3>
                    <span className="font-mono text-xs text-[#999]">{t.date}</span>
                  </div>
                  <p className="text-sm text-[#ccc] leading-relaxed">{renderWithTypos(t.body)}</p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[#333]">
            <div className="mx-auto max-w-5xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#666]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#555]">the unhinged side</p>
            </div>
            <div className="mx-auto max-w-5xl px-6 pb-7">
              <p className="font-mono text-[0.65rem] text-[#1a1a1a] italic text-right bg-pink-200/80 px-3 py-1.5 rounded-sm inline-block float-right">
                {'* those roast was from Grok i know it sucks lol ai "'}
              </p>
              <div className="clear-both" />
            </div>
          </footer>
        </div>
      </PageTransition>
    </>
  )
}
