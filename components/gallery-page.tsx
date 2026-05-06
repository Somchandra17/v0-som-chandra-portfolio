"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, PenTool, ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { PhotoCard } from "@/components/photo-card"
import { NowPlaying } from "@/components/now-playing"
import {
  type PhotoItem,
  type Tab,
  type SortField,
  type SortDirection,
  monthYearSortValue,
  INITIAL_RENDER_COUNT,
  RENDER_STEP,
} from "@/lib/creative-data"
import { measureText, fonts, usePretextReady } from "@/lib/pretext"

const siblingLinks: { key: Tab; label: string; href: string }[] = [
  { key: "sidequests", label: "visual detors", href: "/creative/visual-detours" },
  { key: "photos", label: "clicks", href: "/creative/clicks" },
  { key: "sketches", label: "doodling", href: "/creative/doodling" },
]

interface GalleryPageProps {
  title: string
  subtitle: string
  tabKey: Tab
  items: PhotoItem[]
  showSort?: boolean
}

export function GalleryPage({ title, subtitle, tabKey, items, showSort = true }: GalleryPageProps) {
  const [lightboxItem, setLightboxItem] = useState<PhotoItem | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT)
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!lightboxItem) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxItem(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxItem])

  useEffect(() => {
    if (!lightboxItem || typeof document === "undefined") return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
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

  const sortedItems = useMemo(() => {
    if (!showSort) return items
    const sorted = [...items]
    sorted.sort((a, b) => {
      if (sortField === "location") {
        const locA = (a.location ?? "").toLowerCase()
        const locB = (b.location ?? "").toLowerCase()
        const compared = locA.localeCompare(locB)
        return sortDirection === "asc" ? compared : -compared
      }
      const dateA = monthYearSortValue(a.date)
      const dateB = monthYearSortValue(b.date)
      const compared = dateA - dateB
      return sortDirection === "asc" ? compared : -compared
    })
    return sorted
  }, [items, sortField, sortDirection, showSort])

  const visibleItems = useMemo(() => sortedItems.slice(0, visibleCount), [sortedItems, visibleCount])
  const hasMore = visibleCount < sortedItems.length

  useEffect(() => {
    setVisibleCount(INITIAL_RENDER_COUNT)
  }, [tabKey, sortField, sortDirection, items.length])

  useEffect(() => {
    if (!hasMore) return
    if (typeof IntersectionObserver === "undefined") return
    const node = loadMoreTriggerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisibleCount((c) => Math.min(c + RENDER_STEP, sortedItems.length))
      },
      { root: null, rootMargin: "900px 0px", threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, sortedItems.length])

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} breadcrumb={`som / creative / ${title}`} />

      <PageTransition>
        <div className="relative min-h-screen">
          {/* Back link + sibling nav */}
          <div className="mx-auto max-w-4xl px-6 pt-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/creative"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#666] hover:text-[#e8e8e8] transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              back to the unhinged side
            </Link>
            <div className="flex items-center gap-1">
              {siblingLinks
                .filter((s) => s.key !== tabKey)
                .map((s) => (
                  <Link
                    key={s.key}
                    href={s.href}
                    className="border border-[#333] px-3 py-1.5 font-mono text-[0.65rem] text-[#777] hover:text-[#e8e8e8] hover:border-[#666] transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
            </div>
          </div>

          <NowPlaying />

          {/* Sort controls */}
          {showSort && (
            <div className="mx-auto max-w-4xl px-6 pt-8">
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
                    className={`border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                      sortField === field.key
                        ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#0a0a0a]"
                        : "border-[#333] bg-transparent text-[#8c8c8c] hover:border-[#666] hover:text-[#e8e8e8]"
                    }`}
                  >
                    {field.label}
                  </button>
                ))}
                {([
                  { key: "asc" as SortDirection, label: "asc" },
                  { key: "desc" as SortDirection, label: "desc" },
                ]).map((dir) => (
                  <button
                    key={dir.key}
                    type="button"
                    onClick={() => setSortDirection(dir.key)}
                    className={`border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                      sortDirection === dir.key
                        ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#0a0a0a]"
                        : "border-[#333] bg-transparent text-[#8c8c8c] hover:border-[#666] hover:text-[#e8e8e8]"
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gallery grid -- continuous flow, no section separators */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pb-14">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {visibleItems.map((item, i) => (
                <PhotoCard
                  key={item.stableKey}
                  item={item}
                  index={i}
                  activeTab={tabKey}
                  isTouchDevice={isTouchDevice}
                  onClick={() => setLightboxItem(item)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="pt-6">
                <div ref={loadMoreTriggerRef} className="h-2 w-full" />
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => Math.min(c + RENDER_STEP, sortedItems.length))}
                  className="mt-3 border border-[#333] bg-transparent px-3 py-2 font-mono text-xs text-[#9a9a9a] transition-colors hover:border-[#666] hover:text-[#e8e8e8]"
                >
                  load more frames
                </button>
              </div>
            )}
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

      {/* Story Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <StoryLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Story Lightbox ───────────────────────────────────────────────── */

function StoryLightbox({ item, onClose }: { item: PhotoItem; onClose: () => void }) {
  const allPhotos = item.photos && item.photos.length > 1 ? item.photos : item.src ? [item.src] : []
  const [photoIndex, setPhotoIndex] = useState(0)
  const hasMultiple = allPhotos.length > 1
  const isDoodling = item.kind === "doodling"
  const pretextReady = usePretextReady()
  const displayTitle = item.title?.trim() || (isDoodling ? "untitled sketch" : item.kind === "visual-detours" ? "untitled detour" : "untitled frame")
  const kindLabel = isDoodling ? "doodling" : item.kind === "visual-detours" ? "visual detours" : "clicks"
  const detailNote = isDoodling ? "rough page from the sketchbook. no cleanup pass." : "frame note"
  const viewerHint = hasMultiple ? "arrow keys work here too" : "press esc to close"

  // Pre-measure story text for balanced presentation
  const storyMeasurement = useMemo(() => {
    if (!item.story) return null
    try {
      const { height, lineCount } = measureText(item.story, fonts.body(14), 340, 22)
      return { height, lineCount }
    } catch {
      return null
    }
  }, [item.story, pretextReady])

  useEffect(() => {
    setPhotoIndex(0)
  }, [item.stableKey])

  const goNext = useCallback(() => {
    setPhotoIndex((i) => (i + 1) % allPhotos.length)
  }, [allPhotos.length])

  const goPrev = useCallback(() => {
    setPhotoIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length)
  }, [allPhotos.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight" && hasMultiple) goNext()
      if (e.key === "ArrowLeft" && hasMultiple) goPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, hasMultiple, goNext, goPrev])

  return (
    <motion.div
      className="fixed inset-0 z-[300] bg-[#07090d]/96 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${displayTitle} lightbox`}
    >
      <motion.div
        className="absolute inset-0 mx-auto grid max-w-[1400px] grid-cols-1 gap-3 p-3 md:gap-4 md:p-5 lg:grid-cols-[minmax(0,1.18fr)_360px]"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <section className="paper-card flex min-h-0 flex-col overflow-hidden border border-[#252a31] bg-[#0a0c10]">
          <div className="flex items-center justify-between gap-3 border-b border-[#222831] px-4 py-3 md:px-5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="border border-[#2f3540] bg-[#11151b] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#d7dbe2]">
                {kindLabel}
              </span>
              {hasMultiple && (
                <span className="border border-[#2f3540] bg-[#11151b] px-2.5 py-1 font-mono text-[0.62rem] text-[#9199a5]">
                  frame {String(photoIndex + 1).padStart(2, "0")} / {String(allPhotos.length).padStart(2, "0")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#666] md:inline">
                {viewerHint}
              </span>
              <button
                onClick={onClose}
                className="border border-[#303640] bg-[#101319]/80 p-2 transition-colors hover:border-[#4a5260] hover:bg-[#141820]"
                aria-label="Close lightbox"
                autoFocus
              >
                <X className="h-5 w-5 text-[#d5d5d5]" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-[42dvh] flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(240,198,207,0.08),transparent_24%),linear-gradient(180deg,#090b10_0%,#06070b_100%)] p-3 md:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.28))]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={photoIndex}
                className="relative z-10 max-h-full max-w-full overflow-hidden border border-[#2b3039] bg-[#090b10] shadow-[0_28px_90px_rgba(0,0,0,0.34)]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {allPhotos[photoIndex] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allPhotos[photoIndex]}
                    alt={`${displayTitle} - ${photoIndex + 1}`}
                    className="block h-auto max-h-[58dvh] w-auto max-w-full object-contain md:max-h-[66dvh] lg:max-h-[78dvh]"
                  />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center bg-[#111]">
                    {isDoodling ? (
                      <PenTool className="h-12 w-12 text-[#333]" />
                    ) : (
                      <Camera className="h-12 w-12 text-[#333]" />
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {hasMultiple && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 border border-[#303640] bg-[#0d1016]/88 p-2.5 transition-colors hover:border-[#505867] hover:bg-[#141820]"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5 text-[#d7dbe2]" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 border border-[#303640] bg-[#0d1016]/88 p-2.5 transition-colors hover:border-[#505867] hover:bg-[#141820]"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5 text-[#d7dbe2]" />
                </button>
              </>
            )}
          </div>

          {hasMultiple && (
            <div className="border-t border-[#222831] px-3 py-3 md:px-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allPhotos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`shrink-0 border transition-all ${
                      i === photoIndex
                        ? "border-[#f0c6cf] bg-[#13151b]"
                        : "border-[#2d323b] bg-[#0c0f14] hover:border-[#555d69]"
                    }`}
                    aria-label={`Go to photo ${i + 1}`}
                  >
                    <div className="flex items-center gap-2 pr-3">
                      <div className="h-14 w-14 overflow-hidden border-r border-[#242932] bg-[#111]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Thumbnail ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-[72px] text-left">
                        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#666]">frame</p>
                        <p className="mt-1 font-mono text-sm text-[#d7dbe2]">{String(i + 1).padStart(2, "0")}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="paper-card flex min-h-0 flex-col overflow-hidden border border-[#252a31] bg-[#0b0d12]/88">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="border-b border-[#242932] px-5 py-4 md:px-6">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#8d93a0]">gallery note</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#e8e8e8] md:text-[2rem]">
                {displayTitle}
              </h3>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="border border-[#2f3540] bg-[#11151b] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#aab1bc]">
                  {kindLabel}
                </span>
                {item.location && (
                  <span className="inline-flex items-center gap-1.5 border border-[#2f3540] bg-[#11151b] px-2.5 py-1 font-mono text-[0.62rem] text-[#999]">
                    <MapPin className="h-3 w-3 text-[#f0c6cf]" />
                    {item.location}
                  </span>
                )}
                {item.date && (
                  <span className="inline-flex items-center gap-1.5 border border-[#2f3540] bg-[#11151b] px-2.5 py-1 font-mono text-[0.62rem] text-[#999]">
                    <Calendar className="h-3 w-3 text-[#f0c6cf]" />
                    {item.date}
                  </span>
                )}
              </div>

              {item.desc && item.desc !== "demo caption" ? (
                <p className="max-w-[34ch] text-sm leading-relaxed text-[#c2c7cf]">{item.desc}</p>
              ) : (
                <p className="max-w-[34ch] text-sm leading-relaxed text-[#8f97a3]">{detailNote}</p>
              )}

              {item.story && (
                <div className="border-l-2 border-[#f0c6cf]/30 pl-4 py-1">
                  <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-widest text-[#666]">the story</p>
                  <p
                    className="max-w-[36ch] text-sm leading-relaxed text-[#aaa]"
                    style={storyMeasurement ? { minHeight: `${storyMeasurement.height}px` } : undefined}
                  >
                    {item.story}
                  </p>
                </div>
              )}

              <div className="border-t border-[#242932] pt-4">
                <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-widest text-[#666]">
                  {hasMultiple ? "sequence" : "viewer"}
                </p>
                {hasMultiple ? (
                  <div className="grid gap-2">
                    {allPhotos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPhotoIndex(i)}
                        className={`flex items-center justify-between border px-3 py-2 text-left transition-colors ${
                          i === photoIndex
                            ? "border-[#f0c6cf] bg-[#141118] text-[#f6d8de]"
                            : "border-[#2d323b] bg-[#0d1016] text-[#aab1bc] hover:border-[#505867] hover:text-[#e8e8e8]"
                        }`}
                      >
                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em]">frame {String(i + 1).padStart(2, "0")}</span>
                        <span className="font-mono text-[0.65rem] text-[#7d8591]">{i === photoIndex ? "open" : "view"}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="max-w-[34ch] text-sm leading-relaxed text-[#8f97a3]">
                    one frame, full size, with the notes parked off to the side instead of sitting on the image.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </aside>
      </motion.div>
    </motion.div>
  )
}
