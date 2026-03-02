"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { Camera, PenTool, BookOpen, X, Compass } from "lucide-react"

type Tab = "photos" | "sketches" | "sidequests"

// Gallery item data for all creative tabs
interface PhotoItem {
  id: number
  title: string
  desc: string
  location?: string
  date?: string
  src?: string
}

interface GallerySection {
  heading: string
  items: PhotoItem[]
}

const fileNamesByFolder = {
  clicks: [
    "somchandra17-20230113_110905-1140111110.jpg",
    "somchandra17-20230121_043011-4162564923.jpg",
    "somchandra17-20230121_122921-4001274092.webp",
    "somchandra17-20230122_002019-1849427257.jpg",
    "somchandra17-20230122_170855-2310111991.jpg",
    "somchandra17-20230122_170855-2310111992.jpg",
    "somchandra17-20230122_170855-2310111993.jpg",
    "somchandra17-20230129_201707-3909732442.jpg",
    "somchandra17-20230129_201707-3909732443.jpg",
    "somchandra17-20230713_062021-1942073438.jpg",
    "somchandra17-20231010_113819-907259677.jpg",
    "somchandra17-20231014_183523-104227912.jpg",
    "somchandra17-20231014_183523-104227914.jpg",
    "somchandra17-20231108_025058-3567566177.webp",
    "somchandra17-20250826_070017-672230852.webp",
    "somchandra17-20260114_051140-1222039426.webp",
    "somchandra17-20260126_065720-3096167035.webp",
    "somchandra17-20260126_065720-3096167036.webp",
    "somchandra17-20260126_065720-792613016.webp",
    "somchandra17-20260126_065720-792613019.webp",
    "somchandra17-20260209_020645-3220369136.webp",
    "somchandra17-20260223_185930-813132418.webp",
    "somchandra17-20260223_190621-813132420.webp",
    "somchandra17-20260223_190641-813132421.webp",
    "somchandra17-20260223_190648-813132422.webp",
    "somchandra17__2023-01-21T065921.000Z.webp",
  ],
  sketch: [
    "somchandra17-20220711_143837-3108937688.webp",
    "somchandra17-20220714_035534-3108937689.webp",
    "somchandra17-20220721_013323-3108937690.webp",
    "somchandra17-20220807_040233-3108937691.webp",
    "somchandra17-20220807_040355-3108937692.webp",
    "somchandra17-20220807_040910-3108937693.webp",
    "somchandra17-20220807_040943-3108937694.webp",
    "somchandra17-20230806_030929-1887787864.webp",
    "somchandra17-20230924_221828-1887787865.jpg",
    "somchandra17-20230929_230349-1887787866.jpg",
    "somchandra17-20231125_010718-1887787867.webp",
  ],
  sidequest: [
    "somchandra17-20230729_183650-1664266765.webp",
    "somchandra17-20240701_154239-1664266771.webp",
    "somchandra17-20250701_123739-1664266801.webp",
    "somchandra17-20250826_070017-672230848.webp",
    "somchandra17-20250826_070017-672230851.webp",
    "somchandra17-20250826_070017-672230854.webp",
    "somchandra17-20250905_203302-1664266827.webp",
    "somchandra17-20250913_045156-1664266829.webp",
  ],
} as const

const folderLocation: Record<keyof typeof fileNamesByFolder, string> = {
  clicks: "clicks",
  sketch: "sketch",
  sidequest: "sidequest",
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getDateFromFileName(fileName: string): string {
  const compactMatch = fileName.match(/(\d{4})(\d{2})(\d{2})_/)
  if (compactMatch) {
    const year = Number.parseInt(compactMatch[1], 10)
    const month = Number.parseInt(compactMatch[2], 10)
    const day = Number.parseInt(compactMatch[3], 10)
    if (month >= 1 && month <= 12) {
      return `${monthNames[month - 1]} ${day}, ${year}`
    }
  }

  const isoMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})T/)
  if (isoMatch) {
    const year = Number.parseInt(isoMatch[1], 10)
    const month = Number.parseInt(isoMatch[2], 10)
    const day = Number.parseInt(isoMatch[3], 10)
    if (month >= 1 && month <= 12) {
      return `${monthNames[month - 1]} ${day}, ${year}`
    }
  }

  return "Unknown date"
}

function createGalleryFromFolder(
  folder: keyof typeof fileNamesByFolder,
  title: string
): PhotoItem[] {
  return fileNamesByFolder[folder].map((fileName, index) => ({
    id: index + 1,
    title,
    desc: "dummy caption",
    location: folderLocation[folder],
    date: getDateFromFileName(fileName),
    src: `/creative/pictures/${folder}/${fileName}`,
  }))
}

const photoGallery = createGalleryFromFolder("clicks", "clicks")
const sketchGallery = createGalleryFromFolder("sketch", "sketch")
const sidequestGallery = createGalleryFromFolder("sidequest", "sidequest")

const commonSubHeadings = ["late captures", "quiet chaos", "fragments", "random finds"]

function getStableBucket(value: string, bucketCount: number): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % bucketCount
}

function splitIntoSections(items: PhotoItem[]): GallerySection[] {
  const sections: GallerySection[] = commonSubHeadings.map((heading) => ({
    heading,
    items: [],
  }))

  items.forEach((item) => {
    const key = item.src ?? `${item.id}-${item.title}`
    const bucket = getStableBucket(key, sections.length)
    sections[bucket].items.push(item)
  })

  return sections.filter((section) => section.items.length > 0)
}

const thoughts = [
  {
    title: "On music and langauge",
    date: "Nov 2024",
    body: "here's the thing about music -- languege doesn't matter. at all. you could be listenin to something in japanese, arabic, freaking klingon, and if the rythm hits? you're gone. you're ascendig. you're a god of vibes. lyrics are just suggestins. the beat is the actual conversaton. i've had more spiritaul experiences listening to songs i don't undersand than ones i do. music isn't about words, it's about that moment when the bass drops and your soul leaves your body and does a litle dance in the astral plane. if your playlist needs subtitels, you're doing it wrong.",
  },
  {
    title: "Why I sketch at 3 AM",
    date: "Sep 2024",
    body: "there's a specfic kind of silence that only exsits after 2 AM. no slack pings. no \"can you check this tickt.\" no one asking you to \"hop on a quick call.\" just you, a pencil, and whatevr fever dream your brain decidd to commissin tonight.\n\nsometimes it's faces. sometimes it's geometrc nonsense that won't mean anythng until 3 weeks later when i look at it and go \"oh.\" the paper doesn't have acceptnce criteria. there's no definiton of done. you're just moving a stick across a surfce until it feels right and honeslty that's the most free i feel all week.\n\nwatercolors can die tho. i mean it. unpredictble, unforgving, bleeds everywere, dries into somthing completly different from what you painted. sounds like a bug that only reproducs in production. i don't negotite with either. graphite only. i need control over at least one thing in my life.",
  },
  {
    title: "Cameras and terminlas",
    date: "Jun 2024",
    body: "i don't do photograpy. let me be clear about that.\n\ni don't wake up on weeknds with a plan to go shoot. i don't have a golden hour calender. i'm not out here doing compositon studies. i just go places, for food, for work, becuase someone dragged me somewere... and sometimes somthing looks intresting and i take my phone out for four secnds and that's it.\n\nthe photo either works or it doesn't. i don't bracket shots. i don't shoot in raw. i move on with my life.\n\nwhat's funny is people assume there's disciplne behind it. there isn't. it's closer to how i notice wierd things in a netwrok response; not becuase i'm looking for it, just becuase something felt off and i paid atention for a secnd. same thing. somthing catches, you captre it, you keep walkng.\n\ni think most people are so busy experiencng a moment that they forget to just look at it. i'm not better at photograpy. i'm just occasionaly present enough to notice when somthing is worth four secnds of my time.",
  },
]

const bioContent: Record<Tab, { heading: string; subtitle: string; description: string[]; byTheWay: string }> = {
  photos: {
    heading: "when i'm not hacking, i'm probaly holding my phone wrong.",
    subtitle: "(no i don't own a camera, its all on my phone lol)",
    description: [
      "no camera. never ownd one. probaly never will. this is all shot on the thing i use to doom scroll at 2am and argue with strangers on the internt. ₹80,000 mirrorles camera stays on the wishlist next to \"fix sleep scheduel\" and \"drink more water.\"",
      "i don't go out to shoot. i just go places, for food, becuase someone texted me, becuase i was bored, becuase the city exsits... and sometimes somthing looks intresting and i take my phone out for four secnds. that's the whole procss. there's no plan. there's no golden hour alrm.",
      "what i end up capturng is just whatevr caught my eye long enough to make me stop walkng. wierd light on a wall. a moment happning in the backgrond that nobdoy else noticed. the evryday stuff that's been sitting there the whole time waitng for somone to give it four secnds of atention.",
      "there's this split secnd right before you tap the shuttr where evrything just *locks in* and you know. that feelling is why my phone never dies peacfuly of old age.",
      "none of this is gallrey-ready. think of it as visual notes from somone who stares at terminlas all day and occasionaly needs proof that the world outsde exists.",
    ],
    byTheWay: "also i have a problm and it's called travl. cramped busses. overngiht trains where you don't know your seat neighbr but somehow end up sharng their food by hour three. hiking solo with one backpak and the audacty to think that's enough. road trips where somone's aux cord privleges get revoked forty minuts in. new citeis with people you actualy want to be stuck in an airport with. i'll go anywere. alone, with freinds, with one person i actualy like... doesn't mattr. the plan can fall apart completley. i will still have a better time than i would siting still. famly trips tho? diffrent conversaton entireley. too much group poling on where to eat. too many compromsis. somone always wants to leave early. somone else always wants to stay too long. the itineary is eleven pages and we still spend four hours deciding lnuch. i love my famly. i would not travl with them again.",
  },
  sketches: {
    heading: "when i'm not hacking, i'm probaly covered in graphite dust.",
    subtitle: "(and staring at a blank sketchbok like it owes me money)",
    description: [
      "sketchng happens late at night, usally faces and anatomey studies in graphite or ink. there's somthing meditative about the scrach of pencil on paper, no undo buton, no delete key. just commitent.",
      "i'm obsesed with pencils -- mechancial, graphite, charcol, anything with a sharp piont. they're honest tools. no distracstions, no fancy effetcs. just you and the paper. watercolors can burn tho. i tried once. never agian.",
      "sometimes i just doodle nonsense and call it art. sometimes those nonsense doodels turn into somthing real. none of this is polishd, and i prefr it that way.",
    ],
    byTheWay: "the best sketchs happen when the world is asleep. 3 AM brain is a diffrnt person -- uncensored, experimetal, messy. traveling with a sketchbok is freedom. pulling out a pencil in a train, a cafe, a random street cornr and just... creating. that's when the magic hapens.",
  },
  sidequests: {
    heading: "when i'm not hacking, i'm probaly doing somethin questionable.",
    subtitle: "(side quests are the main quest, fite me)",
    description: [
      "i live for side quests. the wierder the better. set up an entire workstatoin at ikea? done. tried to learn guitar by just vibeing? ongoing. mixed food combinatons that should be ilegal? daily.",
      "i spend most of my time between 2 AM and 5 AM. that's when the real stuff happns. the rest of the day is just waitng for the world to shut up so i can actualy think.",
      "i use arch btw. with hyprland. my entire setup is basicaly a flex. if you use a macbook i will not say anythng but i will think many things.",
    ],
    byTheWay: "i was the shyest kid in every room i walked into. now i'm the coolest person in the room (self-certified, no refunds). the charcter developmnt arc is real and i'm livng proof. also i hate apple. like really realy hate apple. that's not a personalilty trait, that's a lifestyle choce.",
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

// Photo card component with proper aspect ratio
function PhotoCard({ 
  item, 
  index, 
  activeTab, 
  onClick,
}: { 
  item: PhotoItem
  index: number
  activeTab: Tab
  onClick: () => void
}) {
  return (
    <motion.div
      className="break-inside-avoid mb-4 paper-card overflow-hidden cursor-pointer group hover-bounce"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      onClick={onClick}
    >
      <div className="w-full bg-[#1a1a1a] relative overflow-hidden">
        {item.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.title}
            className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#252525]">
            {activeTab === "photos" ? (
              <Camera className="h-8 w-8 text-[#444] group-hover:text-[#666] transition-colors" />
            ) : (
              <PenTool className="h-8 w-8 text-[#444] group-hover:text-[#666] transition-colors" />
            )}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {item.src ? (
              <a
                href={item.src}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto text-sm font-bold text-[#e8e8e8] underline-offset-2 hover:underline"
              >
                {item.title}
              </a>
            ) : (
              <p className="text-sm font-bold text-[#e8e8e8]">{item.title}</p>
            )}
            <p className="text-xs text-[#cfcfcf] mt-1 leading-relaxed">{item.desc}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-[#b8b8b8]">
              <span className="font-mono">{item.location ?? "Unknown location"}</span>
              <span className="font-mono">{item.date ?? "Unknown date"}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<Tab>("photos")
  const [lightboxItem, setLightboxItem] = useState<PhotoItem | null>(null)
  const [showPhone, setShowPhone] = useState(false)

  useEffect(() => {
    if (!lightboxItem) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxItem(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxItem])

  const gallery =
    activeTab === "photos"
      ? photoGallery
      : activeTab === "sketches"
        ? sketchGallery
        : sidequestGallery
  const groupedGallery = splitIntoSections(gallery)

  return (
    <>
      <PageHeader title="the unhinged side" subtitle="photos / sketches / side quests / late-night scribbles" />

      <PageTransition>
        <div className="relative min-h-screen">

          {/* Spelling disclaimer */}
          <div className="mx-auto max-w-4xl px-6 pt-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-mono text-[0.65rem] text-[#1a1a1a] italic text-right bg-pink-200/80 px-3 py-1.5 rounded-sm inline-block float-right"
            >
              {"* yes, the spelling mistakes are intentional. mostly. okay fine, some aren't. bear with me."}
            </motion.p>
            <div className="clear-both" />
          </div>

          {/* -- Bio -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-8 pb-10">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">the other half</p>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                    {bioContent[activeTab].heading}
                  </h2>
                  <p className="text-sm text-[#666] mb-5 italic">
                    {activeTab === "photos" ? (
                      <span>
                        {"(no i don't own a camera, its all on my "}
                        <span
                          className="relative cursor-pointer border-b border-dashed border-[#555] hover:text-[#e8e8e8] transition-colors"
                          onMouseEnter={() => setShowPhone(true)}
                          onMouseLeave={() => setShowPhone(false)}
                        >
                          phone
                          <AnimatePresence>
                            {showPhone && (
                              <motion.span
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute left-1/2 -translate-x-1/2 -top-8 bg-[#1a1a1a] border border-[#555] px-2 py-1 text-xs text-[#e8e8e8] whitespace-nowrap font-mono z-20"
                              >
                                vivo x300
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        {" lol)"}
                      </span>
                    ) : (
                      bioContent[activeTab].subtitle
                    )}
                  </p>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`bio-${activeTab}`}
                  className="max-w-2xl space-y-4 text-sm md:text-base text-[#ccc] leading-relaxed margin-line"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                >
                  {bioContent[activeTab].description.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                    >
                      {para}
                    </motion.p>
                  ))}

                  <motion.div
                    className="border-l-2 border-[#555] pl-4 py-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <p className="text-xs font-mono tracking-wider text-[#999] uppercase mb-2">by the way</p>
                    <p className="text-sm text-[#aaa]">
                      {bioContent[activeTab].byTheWay}
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Gallery / Side Quests -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-5">gallery</p>

              <div className="flex flex-wrap gap-1 mb-8">
                {([
                  { key: "photos" as Tab, label: "Photography", icon: Camera },
                  { key: "sketches" as Tab, label: "Sketches", icon: PenTool },
                  { key: "sidequests" as Tab, label: "Side Quests", icon: Compass },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all border
                      ${activeTab === tab.key
                        ? "bg-[#e8e8e8] text-[#0a0a0a] border-[#e8e8e8]"
                        : "bg-transparent text-[#999] border-[#333] hover:text-[#e8e8e8] hover:border-[#666]"
                      }
                    `}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {groupedGallery && (
                <motion.div
                  key={activeTab}
                  className="space-y-10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {groupedGallery.map((section, sectionIndex) => (
                    <div key={`${activeTab}-${section.heading}`}>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="h-px w-10 bg-[#3f3f3f]" />
                        <p className="inline-flex items-center border border-[#383838] bg-[#0d0d0d]/70 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[#a8a8a8]">
                          {section.heading}
                        </p>
                      </div>
                      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                        {section.items.map((item, i) => (
                          <PhotoCard
                            key={`${activeTab}-${section.heading}-${item.id}`}
                            item={item}
                            index={sectionIndex * 100 + i}
                            activeTab={activeTab}
                            onClick={() => setLightboxItem(item)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Thoughts -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-[#999]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#999]">thoughts</p>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                things i wrote at questionble hours.
              </h2>
              <p className="text-sm text-[#666] mb-8 italic">{"(3 AM brain is a diffrnt person)"}</p>
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
                    <h3 className="text-lg font-bold text-[#e8e8e8]">{t.title}</h3>
                    <span className="font-mono text-xs text-[#999]">{t.date}</span>
                  </div>
                  <p className="text-sm text-[#ccc] leading-relaxed">{t.body}</p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[#333]">
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#666]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#555]">the unhinged side</p>
            </div>
          </footer>
        </div>
      </PageTransition>

      {/* -- Lightbox -- */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            className="fixed inset-0 z-[300] bg-[#000]/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 rounded-sm border border-[#3a3a3a] bg-[#111]/80 p-2 hover:bg-[#1a1a1a] transition-colors"
            >
              <X className="h-5 w-5 text-[#d5d5d5]" />
            </button>

            <motion.div
              className="absolute inset-0 flex items-center justify-center p-3 md:p-6"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {lightboxItem.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightboxItem.src}
                  alt={lightboxItem.title}
                  className="block max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-7.5rem)] w-auto h-auto object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="text-center" onClick={(e) => e.stopPropagation()}>
                  <Camera className="h-12 w-12 text-[#333] mx-auto mb-2" />
                  <p className="font-mono text-xs text-[#666]">image placeholder</p>
                </div>
              )}
            </motion.div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000]/85 to-transparent px-4 py-5 md:px-6">
              <h3 className="text-lg font-bold text-[#e8e8e8]">{lightboxItem.title}</h3>
              <p className="text-sm text-[#bdbdbd] mt-1">{lightboxItem.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
