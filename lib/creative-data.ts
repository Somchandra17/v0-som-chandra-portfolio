import galleryRaw from "@/data/gallery.json"

// ── Types ──────────────────────────────────────────────────────────
export type Tab = "photos" | "sketches" | "sidequests"
export type SortField = "date" | "location"
export type SortDirection = "asc" | "desc"
export type ImageEntryType = "photography" | "doodling" | "visual-detours"

export interface PhotoItem {
  id: number
  stableKey: string
  kind: ImageEntryType
  title: string
  desc?: string
  story?: string
  location?: string
  date?: string
  src?: string
  photos?: string[]
}

export interface GallerySection {
  heading: string
  items: PhotoItem[]
}

export type NowPlayingData = {
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

export type Track = {
  title: string
  artist: string
  album: string
  albumImageUrl?: string
  songUrl?: string
}

export type RecentTrack = Track & { playedAt: string }

export type Artist = {
  name: string
  genres: string[]
  imageUrl?: string
  url?: string
}

type GalleryImageJsonEntry = {
  id: number
  image?: string
  photos?: string[]
  location?: string
  date?: string
  caption?: string
  story?: string
}

type PhotographyJsonEntry = GalleryImageJsonEntry & { type: "photography" }
type DoodlingJsonEntry = GalleryImageJsonEntry & { type: "doodling" }
type VisualDetoursJsonEntry = GalleryImageJsonEntry & { type: "visual-detours" }
type ThoughtJsonEntry = {
  id: number
  type: "thoughts"
  title: string
  date: string
  text: string
}

type GalleryJsonEntry =
  | PhotographyJsonEntry
  | DoodlingJsonEntry
  | VisualDetoursJsonEntry
  | ThoughtJsonEntry

// ── Date parsing ───────────────────────────────────────────────────
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const monthLookup = new Map<string, number>([
  ["jan", 0], ["january", 0],
  ["feb", 1], ["february", 1],
  ["mar", 2], ["march", 2],
  ["apr", 3], ["april", 3],
  ["may", 4],
  ["jun", 5], ["june", 5],
  ["jul", 6], ["july", 6],
  ["aug", 7], ["august", 7],
  ["sep", 8], ["sept", 8], ["september", 8],
  ["oct", 9], ["october", 9],
  ["nov", 10], ["november", 10],
  ["dec", 11], ["december", 11],
])

export function normalizeMonthYear(value?: string): string | undefined {
  if (!value) return undefined
  const match = value.trim().match(/^([a-zA-Z]+)\s+(\d{4})$/)
  if (!match) return undefined
  const month = monthLookup.get(match[1].toLowerCase())
  if (month === undefined) return undefined
  const year = Number.parseInt(match[2], 10)
  if (Number.isNaN(year)) return undefined
  return `${monthNamesShort[month]} ${year}`
}

export function monthYearSortValue(value?: string): number {
  const normalized = normalizeMonthYear(value)
  if (!normalized) return Number.NEGATIVE_INFINITY
  const [monthName, year] = normalized.split(" ")
  const month = monthNamesShort.indexOf(monthName)
  const yearNumber = Number.parseInt(year, 10)
  if (month < 0 || Number.isNaN(yearNumber)) return Number.NEGATIVE_INFINITY
  return yearNumber * 12 + month
}

export function formatMonthYear(value?: string): string {
  return normalizeMonthYear(value) ?? "Unknown date"
}

// ── Data loading ───────────────────────────────────────────────────
const galleryData = [...(galleryRaw as GalleryJsonEntry[])].sort((a, b) => a.id - b.id)

function makePhotoItemKey(entry: PhotographyJsonEntry | DoodlingJsonEntry | VisualDetoursJsonEntry) {
  return [
    entry.type,
    entry.id,
    entry.image ?? "",
    entry.photos?.join("|") ?? "",
    entry.location ?? "",
    entry.date ?? "",
    entry.caption ?? "",
  ].join("::")
}

function toPhotoItem(entry: PhotographyJsonEntry | DoodlingJsonEntry | VisualDetoursJsonEntry, title: string): PhotoItem {
  const isDoodling = entry.type === "doodling"
  return {
    id: entry.id,
    stableKey: makePhotoItemKey(entry),
    kind: entry.type,
    title,
    desc: isDoodling ? undefined : entry.caption ?? "demo caption",
    story: isDoodling ? undefined : entry.story,
    location: isDoodling ? undefined : entry.location ?? "demo location",
    date: isDoodling ? undefined : normalizeMonthYear(entry.date) ?? "Jan 2024",
    src: entry.image ?? entry.photos?.[0],
    photos: entry.photos,
  }
}

export const photoGallery = galleryData
  .filter((entry): entry is Extract<GalleryJsonEntry, { type: "photography" }> => entry.type === "photography")
  .map((entry) => toPhotoItem(entry, entry.location ?? ""))

export const sketchGallery = galleryData
  .filter((entry): entry is Extract<GalleryJsonEntry, { type: "doodling" }> => entry.type === "doodling")
  .map((entry) => toPhotoItem(entry, ""))

export const sidequestGallery = galleryData
  .filter((entry): entry is Extract<GalleryJsonEntry, { type: "visual-detours" }> => entry.type === "visual-detours")
  .map((entry) => toPhotoItem(entry, entry.location ?? ""))

export const imageGalleryByTab: Record<Tab, PhotoItem[]> = {
  photos: photoGallery,
  sketches: sketchGallery,
  sidequests: sidequestGallery,
}

export const thoughts = galleryData
  .filter((entry): entry is Extract<GalleryJsonEntry, { type: "thoughts" }> => entry.type === "thoughts")
  .map((entry) => ({
    title: entry.title,
    date: formatMonthYear(entry.date),
    body: entry.text,
  }))

// ── Gallery section splitting ──────────────────────────────────────
const commonSubHeadings = ["late captures", "quiet chaos", "fragments", "random finds"]

function getStableBucket(value: string, bucketCount: number): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % bucketCount
}

export function splitIntoSections(items: PhotoItem[]): GallerySection[] {
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

export const INITIAL_RENDER_COUNT = 42
export const RENDER_STEP = 30

// ── Now playing helper ─────────────────────────────────────────────
export function getRelativePlayedText(playedAt?: string): string | null {
  if (!playedAt) return null
  const playedDate = new Date(playedAt)
  if (Number.isNaN(playedDate.getTime())) return null
  const diffSeconds = Math.round((playedDate.getTime() - Date.now()) / 1000)
  const hasRelativeTimeFormat = typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function"
  if (!hasRelativeTimeFormat) return null
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute")
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour")
  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, "day")
}

export async function fetcher(url: string) {
  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : `Request failed (${response.status})`
    throw new Error(message)
  }

  return data
}
