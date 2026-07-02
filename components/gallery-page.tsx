"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { X, Camera, PenTool, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { PhotoCard } from "@/components/photo-card"
import {
  type PhotoItem,
  type Tab,
  type SortField,
  type SortDirection,
  monthYearSortValue,
  imageMetaFor,
  srcSetFor,
  INITIAL_RENDER_COUNT,
  RENDER_STEP,
} from "@/lib/creative-data"
import { measureText, fonts, usePretextReady } from "@/lib/pretext"

const siblingLinks: { key: Tab; label: string; href: string }[] = [
  { key: "photos", label: "clicks", href: "/creative/clicks" },
  { key: "sketches", label: "doodling", href: "/creative/doodling" },
]

const galleryNotesByTab: Record<Tab, string> = {
  photos: "A contact sheet of kept moments. Open any frame and keep moving without dropping back to the grid.",
  sketches: "Paper scraps, half-finished lines, and the bits that looked honest enough to survive the erase pass.",
}

function getPhotosForItem(item: PhotoItem) {
  return item.photos && item.photos.length > 1 ? item.photos : item.src ? [item.src] : []
}

interface GalleryPageProps {
  title: string
  subtitle: string
  tabKey: Tab
  items: PhotoItem[]
  showSort?: boolean
}

export function GalleryPage({ title, subtitle, tabKey, items, showSort = true }: GalleryPageProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT)
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)
  const lastTriggerRef = useRef<HTMLElement | null>(null)

  // Return keyboard focus to the thumbnail that opened the lightbox (WCAG 2.4.3).
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    const trigger = lastTriggerRef.current
    if (trigger) requestAnimationFrame(() => trigger.focus())
  }, [])
  const galleryNote = galleryNotesByTab[tabKey]

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxIndex, closeLightbox])

  useEffect(() => {
    if (lightboxIndex === null || typeof document === "undefined") return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxIndex])

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
        <main id="main-content" className="relative min-h-screen">
          {/* Compact contact strip: nav + note + count + sort in one card — photos start
              above the fold, the chrome stays out of the way. */}
          <div className="mx-auto max-w-4xl px-6 pt-6">
            <div className="border border-ink-600 bg-ink-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 px-4 py-3 sm:px-5">
                <Link
                  href="/creative"
                  className="inline-flex items-center gap-2 font-mono text-xs text-ink-400 transition-colors hover:text-ink-100"
                >
                  <ArrowLeft className="h-3 w-3" />
                  back to the unhinged side
                </Link>
                <div className="flex flex-wrap items-center gap-1.5">
                  {siblingLinks.map((s) => (
                    <Link
                      key={s.key}
                      href={s.href}
                      className={`border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors ${
                        s.key === tabKey
                          ? "border-ink-100 bg-ink-100 text-ink-900"
                          : "border-ink-600 text-ink-400 hover:border-world hover:text-ink-100"
                      }`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                <p className="min-w-0 flex-1 basis-64 text-sm leading-relaxed text-ink-300">{galleryNote}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-ink-600 bg-ink-850 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-200">
                    {String(sortedItems.length).padStart(3, "0")} frames
                  </span>
                  {showSort && (
                    <>
                      {([
                        { key: "date" as SortField, label: "date" },
                        { key: "location" as SortField, label: "location" },
                      ]).map((field) => (
                        <button
                          key={field.key}
                          type="button"
                          onClick={() => setSortField(field.key)}
                          className={`border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors ${
                            sortField === field.key
                              ? "border-ink-100 bg-ink-100 text-ink-900"
                              : "border-ink-600 bg-transparent text-ink-400 hover:border-world hover:text-ink-100"
                          }`}
                        >
                          {field.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
                        aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"} — click to flip`}
                        className="border border-ink-600 bg-transparent px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-400 transition-colors hover:border-world hover:text-ink-100"
                      >
                        {sortDirection === "asc" ? "asc ↑" : "desc ↓"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery grid -- continuous flow, photos first */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-8 pb-14">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {visibleItems.map((item, i) => (
                <PhotoCard
                  key={item.stableKey}
                  item={item}
                  index={i}
                  activeTab={tabKey}
                  isTouchDevice={isTouchDevice}
                  onClick={(trigger) => {
                    lastTriggerRef.current = trigger
                    setLightboxIndex(i)
                  }}
                />
              ))}
            </div>
            {hasMore && (
              <div className="pt-6">
                <div ref={loadMoreTriggerRef} className="h-2 w-full" />
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => Math.min(c + RENDER_STEP, sortedItems.length))}
                  className="mt-3 border border-ink-600 bg-ink-850 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-300 transition-colors hover:border-ink-400 hover:text-ink-100"
                >
                  load more frames
                </button>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-ink-600">
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-ink-400">som chandra -- {new Date().getFullYear()}</p>
              <p className="font-mono text-xs text-ink-400">the unhinged side</p>
            </div>
          </footer>
        </main>
      </PageTransition>

      {/* Story Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && sortedItems[lightboxIndex] && (
          <StoryLightbox
            key={`${tabKey}-${lightboxIndex}`}
            items={sortedItems}
            initialItemIndex={lightboxIndex}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Story Lightbox ───────────────────────────────────────────────── */

function StoryLightbox({
  items,
  initialItemIndex,
  onClose,
}: {
  items: PhotoItem[]
  initialItemIndex: number
  onClose: () => void
}) {
  const [currentItemIndex, setCurrentItemIndex] = useState(initialItemIndex)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [transitionDirection, setTransitionDirection] = useState<-1 | 1>(1)
  const pretextReady = usePretextReady()
  const dialogRef = useRef<HTMLDivElement>(null)
  const item = items[currentItemIndex]

  // Values the hooks below depend on. Computed null-safely so every hook runs before the
  // `if (!item)` guard — React requires hooks to run in the same order on every render.
  const allPhotos = item ? getPhotosForItem(item) : []
  const frameCount = Math.max(allPhotos.length, 1)
  const hasMultiple = allPhotos.length > 1
  const canBrowseItems = items.length > 1
  const hasSequence = canBrowseItems || hasMultiple

  const storyMeasurement = useMemo(() => {
    if (!item?.story) return null
    try {
      const { height, lineCount } = measureText(item.story, fonts.body(14), 340, 22, pretextReady)
      return { height, lineCount }
    } catch {
      return null
    }
  }, [item?.story, pretextReady])

  const goForward = useCallback(() => {
    if (photoIndex < frameCount - 1) {
      setTransitionDirection(1)
      setPhotoIndex((current) => current + 1)
      return
    }
    if (!canBrowseItems || currentItemIndex >= items.length - 1) return
    setTransitionDirection(1)
    setCurrentItemIndex((current) => current + 1)
    setPhotoIndex(0)
  }, [canBrowseItems, currentItemIndex, frameCount, items.length, photoIndex])

  const goBackward = useCallback(() => {
    if (photoIndex > 0) {
      setTransitionDirection(-1)
      setPhotoIndex((current) => current - 1)
      return
    }
    if (!canBrowseItems || currentItemIndex <= 0) return
    const previousItemIndex = currentItemIndex - 1
    const previousPhotos = getPhotosForItem(items[previousItemIndex])
    setTransitionDirection(-1)
    setCurrentItemIndex(previousItemIndex)
    setPhotoIndex(Math.max(previousPhotos.length - 1, 0))
  }, [canBrowseItems, currentItemIndex, items, photoIndex])

  const handleStageDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!hasSequence) return
      if (info.offset.x <= -70) {
        goForward()
      } else if (info.offset.x >= 70) {
        goBackward()
      }
    },
    [goBackward, goForward, hasSequence]
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowRight") goForward()
      if (event.key === "ArrowLeft") goBackward()
      if (event.key === "Tab") {
        const root = dialogRef.current
        if (!root) return
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null)
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const activeEl = document.activeElement as HTMLElement | null
        if (event.shiftKey && activeEl === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && activeEl === last) {
          event.preventDefault()
          first.focus()
        } else if (activeEl && !root.contains(activeEl)) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goBackward, goForward, onClose])

  if (!item) return null

  const isDoodling = item.kind === "doodling"
  const displayTitle =
    item.title?.trim() || (isDoodling ? "untitled sketch" : "untitled frame")
  const kindLabel = isDoodling ? "doodling" : "clicks"
  const viewerHint = hasSequence ? "drag sideways or use the rail" : "press esc to close"
  const isAtSequenceStart = currentItemIndex === 0 && photoIndex === 0
  const isAtSequenceEnd = currentItemIndex === items.length - 1 && photoIndex === frameCount - 1
  const currentEntryProgress = items.length > 1 ? (currentItemIndex + 1) / items.length : 1
  const metaLine = [item.location, item.date].filter(Boolean) as string[]
  // The side panel earns its space only when there's something to say (title/meta/
  // caption/story). Sketches usually have none — they get the full-bleed stage.
  const hasStoryPanel =
    Boolean(item.story) ||
    Boolean(item.desc && item.desc !== "demo caption") ||
    metaLine.length > 0

  return (
    <motion.div
      ref={dialogRef}
      className="fixed inset-0 z-[300] bg-ink-900/96 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${displayTitle} lightbox`}
    >
      <motion.div
        className="absolute inset-0 overflow-y-auto overscroll-y-contain"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-3 p-2 pb-4 pt-2 sm:p-3 sm:pb-5 md:gap-4 md:p-5 lg:overflow-hidden ${
            hasStoryPanel ? "lg:grid lg:grid-cols-[minmax(0,1.18fr)_360px]" : "lg:grid lg:grid-cols-1"
          }`}
        >
          <section className="paper-card flex min-h-0 flex-col overflow-hidden border border-ink-700 bg-ink-900">
            <div className="flex items-start justify-between gap-3 border-b border-ink-700 px-3 py-3 sm:px-4 md:px-5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="border border-ink-600 bg-ink-850 px-2 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ink-200 sm:px-2.5 sm:py-1 sm:text-[0.62rem]">
                  {kindLabel}
                </span>
                <span className="border border-ink-600 bg-ink-850 px-2 py-0.5 font-mono text-[0.56rem] text-ink-300 sm:px-2.5 sm:py-1 sm:text-[0.62rem]">
                  entry {String(currentItemIndex + 1).padStart(3, "0")} / {String(items.length).padStart(3, "0")}
                </span>
                {frameCount > 1 && (
                  <span className="border border-ink-600 bg-ink-850 px-2 py-0.5 font-mono text-[0.56rem] text-ink-300 sm:px-2.5 sm:py-1 sm:text-[0.62rem]">
                    frame {String(photoIndex + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-400 md:inline">
                  {viewerHint}
                </span>
                <button
                  onClick={onClose}
                  className="border border-ink-600 bg-ink-850/80 p-2 transition-colors hover:border-ink-500 hover:bg-ink-800"
                  aria-label="Close lightbox"
                  autoFocus
                >
                  <X className="h-5 w-5 text-ink-200" />
                </button>
              </div>
            </div>

            <div className="relative flex min-h-[34svh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(240,198,207,0.08),transparent_24%),linear-gradient(180deg,var(--ink-850)_0%,var(--ink-900)_100%)] p-2 sm:min-h-[40svh] sm:p-3 md:min-h-[42dvh] md:p-6 lg:flex-1">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.28))]" />
              <AnimatePresence custom={transitionDirection} mode="wait">
                <motion.div
                  key={`${item.stableKey}-${photoIndex}`}
                  custom={transitionDirection}
                  drag={hasSequence ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.14}
                  dragMomentum={false}
                  onDragEnd={handleStageDragEnd}
                  style={hasSequence ? { touchAction: "pan-y" } : undefined}
                  className={`relative z-10 max-h-full max-w-full overflow-hidden border border-ink-600 bg-ink-900 shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${hasSequence ? "cursor-grab active:cursor-grabbing" : ""}`}
                  variants={{
                    enter: (direction: -1 | 1) => ({ opacity: 0, x: direction * 42, scale: 0.985 }),
                    center: { opacity: 1, x: 0, scale: 1 },
                    exit: (direction: -1 | 1) => ({ opacity: 0, x: direction * -42, scale: 0.985 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  whileDrag={{ scale: 0.985 }}
                >
                  {allPhotos[photoIndex] ? (
                    (() => {
                      const meta = imageMetaFor(allPhotos[photoIndex])
                      const alt = `${displayTitle} - ${photoIndex + 1}`
                      const imgClass =
                        "block h-auto max-h-[48svh] w-auto max-w-full object-contain sm:max-h-[56svh] md:max-h-[66dvh] lg:max-h-[78dvh]"
                      return meta ? (
                        <picture>
                          <source type="image/avif" srcSet={srcSetFor(meta, "avif")} sizes="(max-width: 1024px) 94vw, 72vw" />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${meta.base}-${meta.widths[meta.widths.length - 1]}.webp`}
                            srcSet={srcSetFor(meta, "webp")}
                            sizes="(max-width: 1024px) 94vw, 72vw"
                            width={meta.width}
                            height={meta.height}
                            alt={alt}
                            className={imgClass}
                          />
                        </picture>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={allPhotos[photoIndex]} alt={alt} className={imgClass} />
                      )
                    })()
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center bg-ink-800">
                      {isDoodling ? (
                        <PenTool className="h-12 w-12 text-ink-600" />
                      ) : (
                        <Camera className="h-12 w-12 text-ink-600" />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {hasSequence && (
                <>
                  <button
                    onClick={goBackward}
                    disabled={isAtSequenceStart}
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 border border-ink-600 bg-ink-850/88 p-2.5 text-ink-200 transition-colors hover:border-ink-500 hover:bg-ink-800 disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-ink-900 disabled:text-ink-400"
                    aria-label="Previous frame"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goForward}
                    disabled={isAtSequenceEnd}
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 border border-ink-600 bg-ink-850/88 p-2.5 text-ink-200 transition-colors hover:border-ink-500 hover:bg-ink-800 disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-ink-900 disabled:text-ink-400"
                    aria-label="Next frame"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {hasMultiple && (
              <div className="border-t border-ink-700 px-3 py-3 md:px-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allPhotos.map((src, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setTransitionDirection(index > photoIndex ? 1 : -1)
                        setPhotoIndex(index)
                      }}
                      className={`shrink-0 border transition-all ${
                        index === photoIndex
                          ? "border-accent-creative bg-ink-850"
                          : "border-ink-600 bg-ink-900 hover:border-ink-500"
                      }`}
                      aria-label={`Go to photo ${index + 1}`}
                    >
                      <div className="flex items-center gap-2 pr-3">
                        <div className="h-14 w-14 overflow-hidden border-r border-ink-700 bg-ink-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageMetaFor(src) ? `${imageMetaFor(src)!.base}-${imageMetaFor(src)!.widths[0]}.webp` : src}
                            alt={`Thumbnail ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-[72px] text-left">
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-400">frame</p>
                          <p className="mt-1 font-mono text-sm text-ink-200">{String(index + 1).padStart(2, "0")}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {hasStoryPanel && (
          <aside className="paper-card flex min-h-0 flex-col overflow-hidden border border-ink-700 bg-ink-900/88 lg:min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex flex-1 flex-col lg:min-h-0"
            >
              <div className="border-b border-ink-700 px-5 py-4 md:px-6">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-300">gallery note</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-ink-100 md:text-[2rem]">{displayTitle}</h3>
              </div>

              <div className="space-y-5 px-5 py-5 md:px-6 lg:flex-1 lg:overflow-y-auto">
                {metaLine.length > 0 && (
                  <div className="border-b border-ink-700 pb-4">
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink-300">
                      {metaLine.join(" / ")}
                    </p>
                  </div>
                )}

                {item.desc && item.desc !== "demo caption" && (
                  <p className="max-w-[34ch] text-sm leading-relaxed text-ink-200">{item.desc}</p>
                )}

                {item.story && (
                  <div className="border-l-2 border-accent-creative/30 py-1 pl-4">
                    <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-widest text-ink-400">the story</p>
                    <p
                      className="max-w-[36ch] text-sm leading-relaxed text-ink-200"
                      style={storyMeasurement ? { minHeight: `${storyMeasurement.height}px` } : undefined}
                    >
                      {item.story}
                    </p>
                  </div>
                )}

                {hasSequence && (
                  <div className="border-t border-ink-700 pt-4">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                      <button
                        type="button"
                        onClick={goBackward}
                        disabled={isAtSequenceStart}
                        className="border border-ink-600 bg-ink-850 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-100 disabled:cursor-not-allowed disabled:border-ink-700 disabled:text-ink-500"
                      >
                        prev
                      </button>
                      <div className="relative h-9 overflow-hidden border border-ink-700 bg-ink-850">
                        <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-ink-700" />
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgba(240,198,207,0.18),rgba(240,198,207,0.44))]"
                          animate={{ width: `${Math.max(10, currentEntryProgress * 100)}%` }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-200">
                          strip progress
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={goForward}
                        disabled={isAtSequenceEnd}
                        className="border border-ink-600 bg-ink-850 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-100 disabled:cursor-not-allowed disabled:border-ink-700 disabled:text-ink-500"
                      >
                        next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </aside>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
