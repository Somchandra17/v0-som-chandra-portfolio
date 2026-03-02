"use client"

import { useEffect, useState, type ReactNode } from "react"
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

const intentionalTypos = new Map<string, { correct: string; roast: string }>([
  ["becus", { correct: "because", roast: "bruh u typed becus again like always lol" }],
  ["shoudl", { correct: "should", roast: "fingers too lazy to hit d huh" }],
  ["hones", { correct: "honest", roast: "ya i cant even spell honest properly lmao" }],
  ["totaly", { correct: "totally", roast: "u missed the l again u legend" }],
  ["perfec", { correct: "perfect", roast: "museum perfec? more like museum fail lol" }],
  ["journalin", { correct: "journaling", roast: "visual journalin from a guy who forgets how to spell journaling" }],
  ["definately", { correct: "definitely", roast: "definately the word u murder every time" }],
  ["questionble", { correct: "questionble", roast: "bruh u typed questionble again like u cant even question ur own spelling lmao" }],
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
  ["r", { correct: "are", roast: "side quests r secretly... i cant even spell are right anymore" }],
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

function IntentionalTypo({
  wrong,
  correct,
  roast,
}: {
  wrong: string
  correct: string
  roast: string
}) {
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

const thoughts = [
  {
    title: "on music n language",
    date: "nov 2024",
    body: "music works befor language does for me. i can play a track in a language i dont understand n still feel xactly where it is trying to go becus rhythm lands first. lyrics matter but not alwys first sumtimes the voice is jus another instrumnt n thats enuf. this sounds intrestin to me evry single time i test it on new songs. i still end up replayin tracks occaisionaly for weeks jus to sit in that vibe.",
  },
  {
    title: "why i sketch at 3 am",
    date: "sep 2024",
    body: "after 2 am evrythin gets quiet n my brain finaly stops switching tabs. no pings no meetings no random can-u-check-this message jus graphite n watever shows up. i keep rough studies on seprate pages n im alwys writtin tiny notes to tommorow me. the playlist is usualy questionble but somehow it helps. this is the most honest part of my week n i can actualy acheive flow here.",
  },
  {
    title: "cameras n terminals",
    date: "jun 2024",
    body: "i dont go out with a strict photo calender or any big plan. im jus movin thru normal life n if a frame shows up i grab it n keep commin. security work made me notice tiny anomolies n that same instinct shows up in photos its a wierd crossover but truely useful. my freinds think i overthink lil details n yeah thier probly right. i jus look one sec longer than most ppl n sumtimes that becums the shot. strangers still like me tho even if im dumb af n weired n confuse weired with wiredd all the time idk why lol",
  },
]

const bioContent: Record<Tab, { heading: string; subtitle: string; description: string[]; byTheWay: string }> = {
  photos: {
    heading: "when im not starin at screens im probly holdin my phone wrong.",
    subtitle: "(no i dont own a camera its all on my phone lol ya im that broke n lazy)",
    description: [
      "i dont reely do planned photo walks most frames happen between normal life stuff n random detours.",
      "i take the shot becus something catches for one second light reflections faces tiny moments then it is gone.",
      "i dont over process much i shoudl probably do more edits but raw vibes feel more honest to me.",
      "i keep folders by mood more than place n yeah it sounds totaly chaotic but it helps me find shots faster.",
      "none of this is museum perfec it is more like visual journalin from someone who stares at terminals all day.",
    ],
    byTheWay: "travel is still my reset button trains buses tea stalls airport delays all of it. i can improvise around bad plans but i definately cannot survive rigid group itineraries for long half the good stories happen when plans break.",
  },
  sketches: {
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
  sidequests: {
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
              {"* some typos are intentional. hover the squiggles for the fix + a tiny roast."}
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
                    {renderWithTypos(bioContent[activeTab].heading)}
                  </h2>
                  <p className="text-sm text-[#666] mb-5 italic">
                    {renderWithTypos(bioContent[activeTab].subtitle)}
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
                      {renderWithTypos(para)}
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
                      {renderWithTypos(bioContent[activeTab].byTheWay)}
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
                {renderWithTypos("things i wrote at questionble hours.")}
              </h2>
              <p className="text-sm text-[#666] mb-8 italic">{renderWithTypos("(3 am brain is a diffrent person)")}</p>
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
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#666]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#555]">the unhinged side</p>
            </div>
            <div className="mx-auto max-w-4xl px-6 pb-7">
              <p className="font-mono text-[0.65rem] text-[#1a1a1a] italic text-right bg-pink-200/80 px-3 py-1.5 rounded-sm inline-block float-right">
                {'* those roast was from Grok i know it sucks lol ai "'}
              </p>
              <div className="clear-both" />
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
