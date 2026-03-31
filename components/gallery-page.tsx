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
    if (!hasMore) return
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

  // Pre-measure story text for balanced presentation
  const storyMeasurement = useMemo(() => {
    if (!item.story) return null
    try {
      const { height, lineCount } = measureText(item.story, fonts.body(14), 320, 22)
      return { height, lineCount }
    } catch {
      return null
    }
  }, [item.story, pretextReady])

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
      className="fixed inset-0 z-[300] bg-[#000]/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 border border-[#3a3a3a] bg-[#111]/80 p-2 hover:bg-[#1a1a1a] transition-colors"
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5 text-[#d5d5d5]" />
      </button>

      {/* Split layout: image left, story right */}
      <motion.div
        className="absolute inset-0 flex flex-col lg:flex-row"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image side */}
        <div className="relative flex-1 flex items-center justify-center p-4 lg:p-8 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={photoIndex}
              className="relative max-w-full max-h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {allPhotos[photoIndex] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={allPhotos[photoIndex]}
                  alt={`${item.title} - ${photoIndex + 1}`}
                  className="block max-w-full max-h-[60vh] lg:max-h-[85vh] w-auto h-auto object-contain"
                />
              ) : (
                <div className="flex items-center justify-center w-64 h-64 bg-[#111]">
                  <Camera className="h-12 w-12 text-[#333]" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Multi-photo nav */}
          {hasMultiple && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 border border-[#333] bg-[#0a0a0a]/80 p-2 hover:bg-[#1a1a1a] transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5 text-[#ccc]" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 border border-[#333] bg-[#0a0a0a]/80 p-2 hover:bg-[#1a1a1a] transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5 text-[#ccc]" />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allPhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === photoIndex ? "bg-[#f0c6cf] scale-125" : "bg-[#555]"
                    }`}
                    aria-label={`Go to photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Story side -- only for non-doodling items */}
        {!isDoodling && (
          <div className="lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#222] bg-[#0a0a0a]/60 p-6 lg:p-8 flex flex-col justify-center overflow-y-auto max-h-[40vh] lg:max-h-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="space-y-5"
            >
              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {item.location && (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[#999]">
                    <MapPin className="h-3 w-3 text-[#f0c6cf]" />
                    {item.location}
                  </span>
                )}
                {item.date && (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[#999]">
                    <Calendar className="h-3 w-3 text-[#f0c6cf]" />
                    {item.date}
                  </span>
                )}
                {hasMultiple && (
                  <span className="font-mono text-[#666]">
                    {photoIndex + 1} / {allPhotos.length}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-bold text-[#e8e8e8] tracking-tight leading-snug">
                {item.title}
              </h3>

              {/* Description */}
              {item.desc && item.desc !== "demo caption" && (
                <p className="text-sm text-[#bbb] leading-relaxed">{item.desc}</p>
              )}

              {/* Story -- height pre-measured with pretext */}
              {item.story && (
                <div className="border-l-2 border-[#f0c6cf]/30 pl-4 py-1">
                  <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#666] mb-2">the story</p>
                  <p 
                    className="text-sm text-[#aaa] leading-relaxed"
                    style={storyMeasurement ? { minHeight: `${storyMeasurement.height}px` } : undefined}
                  >
                    {item.story}
                  </p>
                </div>
              )}

              {/* Thumbnail strip for multi-photo */}
              {hasMultiple && (
                <div className="flex gap-2 pt-2 overflow-x-auto">
                  {allPhotos.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`shrink-0 w-12 h-12 overflow-hidden border transition-all ${
                        i === photoIndex
                          ? "border-[#f0c6cf] opacity-100"
                          : "border-[#333] opacity-50 hover:opacity-80"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
