"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { Camera, PenTool, BookOpen, X, Compass, Disc3 } from "lucide-react"
import galleryRaw from "@/data/gallery.json"

type Tab = "photos" | "sketches" | "sidequests" | "thoughts"
type SortField = "date" | "location"
type SortDirection = "asc" | "desc"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getRelativePlayedText(playedAt?: string): string | null {
  if (!playedAt) return null
  const playedDate = new Date(playedAt)
  if (Number.isNaN(playedDate.getTime())) return null

  const diffSeconds = Math.round((playedDate.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute")

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour")

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, "day")
}

type NowPlayingData = {
  isPlaying: boolean
  isCurrentlyPlaying?: boolean
  mode?: "now_playing" | "last_played"
  playedAt?: string
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string
  songUrl?: string
}

// Gallery item data for all creative tabs
interface PhotoItem {
  id: number
  kind: ImageEntryType
  title: string
  desc?: string
  location?: string
  date?: string
  src?: string
}

interface GallerySection {
  heading: string
  items: PhotoItem[]
}

type ImageEntryType = "photography" | "doodling" | "visual-detours"

type GalleryJsonEntry =
  | {
      id: number
      type: ImageEntryType
      image?: string
      photos?: string[]
      location?: string
      date?: string
      caption?: string
    }
  | {
      id: number
      type: "thoughts"
      title: string
      date: string
      text: string
    }

const galleryData = [...(galleryRaw as GalleryJsonEntry[])].sort((a, b) => a.id - b.id)

const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const monthLookup = new Map<string, number>([
  ["jan", 0],
  ["january", 0],
  ["feb", 1],
  ["february", 1],
  ["mar", 2],
  ["march", 2],
  ["apr", 3],
  ["april", 3],
  ["may", 4],
  ["jun", 5],
  ["june", 5],
  ["jul", 6],
  ["july", 6],
  ["aug", 7],
  ["august", 7],
  ["sep", 8],
  ["sept", 8],
  ["september", 8],
  ["oct", 9],
  ["october", 9],
  ["nov", 10],
  ["november", 10],
  ["dec", 11],
  ["december", 11],
])

function normalizeMonthYear(value?: string): string | undefined {
  if (!value) return undefined

  const match = value.trim().match(/^([a-zA-Z]+)\s+(\d{4})$/)
  if (!match) return undefined

  const month = monthLookup.get(match[1].toLowerCase())
  if (month === undefined) return undefined

  const year = Number.parseInt(match[2], 10)
  if (Number.isNaN(year)) return undefined

  return `${monthNamesShort[month]} ${year}`
}

function monthYearSortValue(value?: string): number {
  const normalized = normalizeMonthYear(value)
  if (!normalized) return Number.NEGATIVE_INFINITY

  const [monthName, year] = normalized.split(" ")
  const month = monthNamesShort.indexOf(monthName)
  const yearNumber = Number.parseInt(year, 10)
  if (month < 0 || Number.isNaN(yearNumber)) return Number.NEGATIVE_INFINITY

  return yearNumber * 12 + month
}

function formatMonthYear(value?: string): string {
  return normalizeMonthYear(value) ?? "Unknown date"
}

function toPhotoItem(entry: Extract<GalleryJsonEntry, { type: ImageEntryType }>, title: string): PhotoItem {
  const isDoodling = entry.type === "doodling"
  return {
    id: entry.id,
    kind: entry.type,
    title,
    desc: isDoodling ? undefined : entry.caption ?? "demo caption",
    location: isDoodling ? undefined : entry.location ?? "demo location",
    date: isDoodling ? undefined : normalizeMonthYear(entry.date) ?? "Jan 2024",
    src: entry.image ?? entry.photos?.[0],
  }
}

const photoGallery = galleryData
  .filter((entry): entry is Extract<GalleryJsonEntry, { type: "photography" }> => entry.type === "photography")
  .map((entry) => toPhotoItem(entry, "photography"))

const sketchGallery = galleryData
  .filter((entry): entry is Extract<GalleryJsonEntry, { type: "doodling" }> => entry.type === "doodling")
  .map((entry) => toPhotoItem(entry, "doodling"))

const sidequestGallery = galleryData
  .filter(
    (entry): entry is Extract<GalleryJsonEntry, { type: "visual-detours" }> => entry.type === "visual-detours"
  )
  .map((entry) => toPhotoItem(entry, "visual detours"))

const imageGalleryByTab: Record<Exclude<Tab, "thoughts">, PhotoItem[]> = {
  photos: photoGallery,
  sketches: sketchGallery,
  sidequests: sidequestGallery,
}

const INITIAL_RENDER_COUNT = 42
const RENDER_STEP = 30

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

function isImageTab(tab: Tab): tab is Exclude<Tab, "thoughts"> {
  return tab !== "thoughts"
}

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

const thoughts = galleryData
  .filter((entry): entry is Extract<GalleryJsonEntry, { type: "thoughts" }> => entry.type === "thoughts")
  .map((entry) => ({
    title: entry.title,
    date: formatMonthYear(entry.date),
    body: entry.text,
  }))

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
  thoughts: {
    heading: "things i wrote at questionble hours.",
    subtitle: "(3 am brain is a diffrent person)",
    description: [
      "these are raw brain dumps mostly from late nights where sleep got replaced by overthinkin and tea.",
      "no polished tone no clean structure jus thoughts as they landed in the moment.",
    ],
    byTheWay: "if this feels chaotic thats because it is and i kinda like it that way.",
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
  isTouchDevice,
  onClick,
}: {
  item: PhotoItem
  index: number
  activeTab: Tab
  isTouchDevice: boolean
  onClick: () => void
}) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isMidViewport, setIsMidViewport] = useState(false)
  const isDoodling = activeTab === "sketches" || item.kind === "doodling"

  useEffect(() => {
    if (!isTouchDevice) {
      setIsMidViewport(false)
      return
    }

    const node = cardRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMidViewport(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: "-38% 0px -38% 0px",
        threshold: 0,
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isTouchDevice])

  const overlayVisibilityClass = isDoodling
    ? "opacity-0"
    : isTouchDevice
      ? isMidViewport
        ? "opacity-100"
        : "opacity-0"
      : "opacity-0 group-hover:opacity-100"

  return (
    <div
      ref={cardRef}
      className="break-inside-avoid mb-4 paper-card overflow-hidden cursor-pointer group hover-bounce animate-in fade-in slide-in-from-bottom-2 duration-300 [content-visibility:auto] [contain-intrinsic-size:340px_240px]"
      style={{ animationDelay: `${Math.min(index, 8) * 24}ms` }}
      onClick={onClick}
    >
      <div className="w-full bg-[#1a1a1a] relative overflow-hidden">
        {item.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.title}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index < 6 ? "high" : "auto"}
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
        <div className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${overlayVisibilityClass}`}>
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
            {item.desc && <p className="text-xs text-[#cfcfcf] mt-1 leading-relaxed">{item.desc}</p>}
            <div className="flex items-center justify-between mt-2 text-xs text-[#b8b8b8]">
              <span className="font-mono">{item.location ?? "Unknown location"}</span>
              <span className="font-mono">{formatMonthYear(item.date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<Tab>("photos")
  const [lightboxItem, setLightboxItem] = useState<PhotoItem | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const isNowPlaying = nowPlaying?.mode === "now_playing"
  const relativePlayed = getRelativePlayedText(nowPlaying?.playedAt)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [visibleCountByTab, setVisibleCountByTab] = useState<Record<Exclude<Tab, "thoughts">, number>>({
    photos: INITIAL_RENDER_COUNT,
    sketches: INITIAL_RENDER_COUNT,
    sidequests: INITIAL_RENDER_COUNT,
  })
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (typeof window === "undefined") return

    const touchQuery = window.matchMedia("(hover: none), (pointer: coarse)")
    const updateTouchMode = () => setIsTouchDevice(touchQuery.matches)
    updateTouchMode()

    if (typeof touchQuery.addEventListener === "function") {
      touchQuery.addEventListener("change", updateTouchMode)
      return () => touchQuery.removeEventListener("change", updateTouchMode)
    }

    touchQuery.addListener(updateTouchMode)
    return () => touchQuery.removeListener(updateTouchMode)
  }, [])

  const sortedImageItems = useMemo(() => {
    if (!isImageTab(activeTab)) return []
    if (activeTab === "sketches") return imageGalleryByTab[activeTab]

    const sorted = [...imageGalleryByTab[activeTab]]
    sorted.sort((a, b) => {
      if (sortField === "location") {
        const locationA = (a.location ?? "").toLowerCase()
        const locationB = (b.location ?? "").toLowerCase()
        const compared = locationA.localeCompare(locationB)
        return sortDirection === "asc" ? compared : -compared
      }

      const dateA = monthYearSortValue(a.date)
      const dateB = monthYearSortValue(b.date)
      const compared = dateA - dateB
      return sortDirection === "asc" ? compared : -compared
    })

    return sorted
  }, [activeTab, sortDirection, sortField])

  const activeImageItems = useMemo(() => {
    if (!isImageTab(activeTab)) return []
    return sortedImageItems.slice(0, visibleCountByTab[activeTab])
  }, [activeTab, sortedImageItems, visibleCountByTab])

  const groupedGallery = useMemo(
    () => (isImageTab(activeTab) ? splitIntoSections(activeImageItems) : []),
    [activeTab, activeImageItems]
  )

  const hasMoreItems = isImageTab(activeTab)
    ? visibleCountByTab[activeTab] < sortedImageItems.length
    : false

  useEffect(() => {
    if (!isImageTab(activeTab) || !hasMoreItems) return
    const node = loadMoreTriggerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisibleCountByTab((current) => {
          const currentCount = current[activeTab]
          const maxCount = sortedImageItems.length
          if (currentCount >= maxCount) return current
          return {
            ...current,
            [activeTab]: Math.min(currentCount + RENDER_STEP, maxCount),
          }
        })
      },
      { root: null, rootMargin: "900px 0px", threshold: 0 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [activeTab, hasMoreItems, sortedImageItems.length])

  return (
    <>
      <PageHeader title="the unhinged side" subtitle="photos / doodling / visual detours / late-night scribbles" />

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

          {nowPlaying?.isPlaying && (
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-6 pb-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="border-t border-[#333] pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Disc3
                      className={`h-4 w-4 ${isNowPlaying ? "animate-spin text-[#1DB954]" : "text-[#767676]"}`}
                      style={{ animationDuration: "3s" }}
                    />
                    <p className={`font-mono text-xs tracking-widest uppercase ${isNowPlaying ? "text-[#1DB954]" : "text-[#8a8a8a]"}`}>
                      {isNowPlaying ? "now playing" : "last played song"}
                    </p>
                    {!isNowPlaying && (
                      <span className="border border-[#3a3a3a] bg-[#141414] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8b8b8b]">
                        afk
                      </span>
                    )}
                    {!isNowPlaying && relativePlayed && (
                      <span className="font-mono text-[10px] text-[#6f6f6f]">({relativePlayed})</span>
                    )}
                  </div>
                  <a
                    href={nowPlaying.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-card p-5 flex items-center gap-5 hover-bounce group"
                  >
                    {nowPlaying.albumImageUrl && (
                      <img
                        src={nowPlaying.albumImageUrl}
                        alt={nowPlaying.album}
                        className="w-16 h-16 object-cover border border-[#333] shrink-0"
                        crossOrigin="anonymous"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#e8e8e8] truncate group-hover:underline">{nowPlaying.title}</p>
                      <p className="text-sm text-[#aaa] truncate">{nowPlaying.artist}</p>
                      <p className="text-xs text-[#666] truncate mt-0.5">{nowPlaying.album}</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </section>
          )}

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
                  { key: "sketches" as Tab, label: "Doodling", icon: PenTool },
                  { key: "sidequests" as Tab, label: "Visual Detours", icon: Compass },
                  { key: "thoughts" as Tab, label: "Thoughts", icon: BookOpen },
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

              {isImageTab(activeTab) && activeTab !== "sketches" && (
                <div className="mb-8 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#666]">sort</span>
                  {([
                    { key: "date" as SortField, label: "date" },
                    { key: "location" as SortField, label: "location" },
                  ]).map((field) => (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() => setSortField(field.key)}
                      className={`
                        border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors
                        ${sortField === field.key
                          ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#0a0a0a]"
                          : "border-[#333] bg-transparent text-[#8c8c8c] hover:border-[#666] hover:text-[#e8e8e8]"
                        }
                      `}
                    >
                      {field.label}
                    </button>
                  ))}
                  {([
                    { key: "asc" as SortDirection, label: "asc" },
                    { key: "desc" as SortDirection, label: "desc" },
                  ]).map((direction) => (
                    <button
                      key={direction.key}
                      type="button"
                      onClick={() => setSortDirection(direction.key)}
                      className={`
                        border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors
                        ${sortDirection === direction.key
                          ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#0a0a0a]"
                          : "border-[#333] bg-transparent text-[#8c8c8c] hover:border-[#666] hover:text-[#e8e8e8]"
                        }
                      `}
                    >
                      {direction.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {isImageTab(activeTab) ? (
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
                            isTouchDevice={isTouchDevice}
                            onClick={() => setLightboxItem(item)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {hasMoreItems && (
                    <div className="pt-3">
                      <div ref={loadMoreTriggerRef} className="h-2 w-full" />
                      <button
                        type="button"
                        onClick={() => {
                          if (!isImageTab(activeTab)) return
                          setVisibleCountByTab((current) => ({
                            ...current,
                            [activeTab]: Math.min(
                              current[activeTab] + RENDER_STEP,
                              sortedImageItems.length
                            ),
                          }))
                        }}
                        className="mt-3 border border-[#333] bg-transparent px-3 py-2 font-mono text-xs text-[#9a9a9a] transition-colors hover:border-[#666] hover:text-[#e8e8e8]"
                      >
                        load more frames
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="thoughts"
                  className="space-y-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
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

            {lightboxItem.kind !== "doodling" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000]/85 to-transparent px-4 py-5 md:px-6">
                <h3 className="text-lg font-bold text-[#e8e8e8]">{lightboxItem.title}</h3>
                {lightboxItem.desc && <p className="text-sm text-[#bdbdbd] mt-1">{lightboxItem.desc}</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
