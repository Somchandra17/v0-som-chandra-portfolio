"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { X, Camera, PenTool, ChevronLeft, ChevronRight } from "lucide-react"
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
  const activeSibling = siblingLinks.find((link) => link.key === tabKey)

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
          {/* Back link + sibling nav */}
          <div className="mx-auto max-w-4xl px-6 pt-6">
            <div className="overflow-hidden border border-[#2a2f37] bg-[linear-gradient(180deg,#101319_0%,#0b0d12_100%)]">
              <div className="flex flex-col gap-4 border-b border-[#232831] px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href="/creative"
                    className="inline-flex items-center gap-2 font-mono text-xs text-[#666] transition-colors hover:text-[#e8e8e8]"
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
                            ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#0a0a0a]"
                            : "border-[#333] text-[#777] hover:border-[#666] hover:text-[#e8e8e8]"
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="grid gap-px bg-[#232831] md:grid-cols-[minmax(0,1.45fr)_minmax(250px,0.55fr)]">
                  <div className="bg-[#0c0f14] px-4 py-4 sm:px-5">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#737a87]">
                      contact sheet / {activeSibling?.label ?? title.toLowerCase()}
                    </p>
                    <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-[#939aa6]">{galleryNote}</p>
                  </div>
                  <div className="grid gap-px bg-[#232831] sm:grid-cols-2 md:grid-cols-1">
                    <div className="bg-[#0c0f14] px-4 py-4 sm:px-5">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#737a87]">archive count</p>
                      <p className="mt-2 font-mono text-2xl text-[#ececec]">{String(sortedItems.length).padStart(3, "0")}</p>
                      <p className="mt-1 text-xs text-[#6e7683]">frames in this stack</p>
                    </div>
                    <div className="bg-[#0c0f14] px-4 py-4 sm:px-5">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#737a87]">viewer mode</p>
                      <p className="mt-2 max-w-[22ch] font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.14em] text-[#cfd4dd]">
                        tap to open. drag sideways inside the viewer to keep moving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NowPlaying />

          {/* Sort controls */}
          {showSort && (
            <div className="mx-auto max-w-4xl px-6 pt-8">
              <div className="mb-8 overflow-hidden border border-[#2a2f37] bg-[#0c0f14]">
                <div className="grid gap-px bg-[#232831] md:grid-cols-[minmax(0,1.2fr)_auto_auto]">
                  <div className="bg-[#0c0f14] px-4 py-4 sm:px-5">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#737a87]">sorting desk</p>
                    <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-[#8d93a0]">
                      Reorder the contact sheet by place or time, then open a frame and keep browsing without dropping back out.
                    </p>
                  </div>
                  <div className="bg-[#0c0f14] px-4 py-4 sm:px-5">
                    <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#737a87]">field</p>
                    <div className="flex flex-wrap gap-2">
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
                    </div>
                  </div>
                  <div className="bg-[#0c0f14] px-4 py-4 sm:px-5">
                    <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#737a87]">order</p>
                    <div className="flex flex-wrap gap-2">
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
                </div>
              </div>
            </div>
          )}

          {/* Gallery grid -- continuous flow, no section separators */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pb-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#242932] pb-4">
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#737a87]">contact strip</p>
                <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-[#8d93a0]">
                  The grid stays rough and fast. The viewer holds the details, sequencing, and the drag-through behavior.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-[#313842] bg-[#0e1117] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#cfd4dd]">
                  {String(Math.min(visibleCount, sortedItems.length)).padStart(3, "0")} on deck
                </span>
                <span className="border border-[#2a3039] bg-[#0b0e13] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7d8591]">
                  drag / tap / browse
                </span>
              </div>
            </div>
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
                  className="mt-3 border border-[#333] bg-[#0d1016] px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-[#9a9a9a] transition-colors hover:border-[#666] hover:text-[#e8e8e8]"
                >
                  load more frames
                </button>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[#333]">
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#666]">som chandra -- {new Date().getFullYear()}</p>
              <p className="font-mono text-xs text-[#555]">the unhinged side</p>
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
      const { height, lineCount } = measureText(item.story, fonts.body(14), 340, 22)
      return { height, lineCount }
    } catch {
      return null
    }
    // pretextReady is a recompute trigger (re-measure once fonts load), not read directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <motion.div
      ref={dialogRef}
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
        className="absolute inset-0 overflow-y-auto overscroll-y-contain"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-3 p-2 pb-4 pt-2 sm:p-3 sm:pb-5 md:gap-4 md:p-5 lg:grid lg:grid-cols-[minmax(0,1.18fr)_360px] lg:overflow-hidden">
          <section className="paper-card flex min-h-0 flex-col overflow-hidden border border-[#252a31] bg-[#0a0c10]">
            <div className="flex items-start justify-between gap-3 border-b border-[#222831] px-3 py-3 sm:px-4 md:px-5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="border border-[#2f3540] bg-[#11151b] px-2 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#d7dbe2] sm:px-2.5 sm:py-1 sm:text-[0.62rem]">
                  {kindLabel}
                </span>
                <span className="border border-[#2f3540] bg-[#11151b] px-2 py-0.5 font-mono text-[0.56rem] text-[#9199a5] sm:px-2.5 sm:py-1 sm:text-[0.62rem]">
                  entry {String(currentItemIndex + 1).padStart(3, "0")} / {String(items.length).padStart(3, "0")}
                </span>
                <span className="border border-[#2f3540] bg-[#11151b] px-2 py-0.5 font-mono text-[0.56rem] text-[#9199a5] sm:px-2.5 sm:py-1 sm:text-[0.62rem]">
                  frame {String(photoIndex + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}
                </span>
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

            <div className="relative flex min-h-[34svh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(240,198,207,0.08),transparent_24%),linear-gradient(180deg,#090b10_0%,#06070b_100%)] p-2 sm:min-h-[40svh] sm:p-3 md:min-h-[42dvh] md:p-6 lg:flex-1">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.28))]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 hidden justify-between px-4 py-3 md:flex">
                <span className="border border-[#2a3039] bg-[#0b0e13]/88 px-2 py-1 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[#8b93a0] lg:text-[0.6rem]">
                  archive viewer
                </span>
                {hasSequence && (
                  <span className="border border-[#2a3039] bg-[#0b0e13]/88 px-2 py-1 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[#8b93a0] lg:text-[0.6rem]">
                    drag sideways
                  </span>
                )}
              </div>
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
                  className={`relative z-10 max-h-full max-w-full overflow-hidden border border-[#2b3039] bg-[#090b10] shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${hasSequence ? "cursor-grab active:cursor-grabbing" : ""}`}
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={allPhotos[photoIndex]}
                      alt={`${displayTitle} - ${photoIndex + 1}`}
                      className="block h-auto max-h-[48svh] w-auto max-w-full object-contain sm:max-h-[56svh] md:max-h-[66dvh] lg:max-h-[78dvh]"
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

              {hasSequence && (
                <>
                  <button
                    onClick={goBackward}
                    disabled={isAtSequenceStart}
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 border border-[#303640] bg-[#0d1016]/88 p-2.5 text-[#d7dbe2] transition-colors hover:border-[#505867] hover:bg-[#141820] disabled:cursor-not-allowed disabled:border-[#232831] disabled:bg-[#0b0d12] disabled:text-[#555]"
                    aria-label="Previous frame"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goForward}
                    disabled={isAtSequenceEnd}
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 border border-[#303640] bg-[#0d1016]/88 p-2.5 text-[#d7dbe2] transition-colors hover:border-[#505867] hover:bg-[#141820] disabled:cursor-not-allowed disabled:border-[#232831] disabled:bg-[#0b0d12] disabled:text-[#555]"
                    aria-label="Next frame"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {hasMultiple && (
              <div className="border-t border-[#222831] px-3 py-3 md:px-4">
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
                          ? "border-[#f0c6cf] bg-[#13151b]"
                          : "border-[#2d323b] bg-[#0c0f14] hover:border-[#555d69]"
                      }`}
                      aria-label={`Go to photo ${index + 1}`}
                    >
                      <div className="flex items-center gap-2 pr-3">
                        <div className="h-14 w-14 overflow-hidden border-r border-[#242932] bg-[#111]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-[72px] text-left">
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#666]">frame</p>
                          <p className="mt-1 font-mono text-sm text-[#d7dbe2]">{String(index + 1).padStart(2, "0")}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="paper-card flex min-h-0 flex-col overflow-hidden border border-[#252a31] bg-[#0b0d12]/88 lg:min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex flex-1 flex-col lg:min-h-0"
            >
              <div className="border-b border-[#242932] px-5 py-4 md:px-6">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#8d93a0]">gallery note</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#e8e8e8] md:text-[2rem]">{displayTitle}</h3>
              </div>

              <div className="space-y-5 px-5 py-5 md:px-6 lg:flex-1 lg:overflow-y-auto">
                {metaLine.length > 0 && (
                  <div className="border-b border-[#242932] pb-4">
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#9fa6b2]">
                      {metaLine.join(" / ")}
                    </p>
                  </div>
                )}

                {item.desc && item.desc !== "demo caption" && (
                  <p className="max-w-[34ch] text-sm leading-relaxed text-[#cfd4dd]">{item.desc}</p>
                )}

                {item.story && (
                  <div className="border-l-2 border-[#f0c6cf]/30 py-1 pl-4">
                    <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-widest text-[#666]">the story</p>
                    <p
                      className="max-w-[36ch] text-sm leading-relaxed text-[#aaa]"
                      style={storyMeasurement ? { minHeight: `${storyMeasurement.height}px` } : undefined}
                    >
                      {item.story}
                    </p>
                  </div>
                )}

                {hasSequence && (
                  <div className="border-t border-[#242932] pt-4">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                      <button
                        type="button"
                        onClick={goBackward}
                        disabled={isAtSequenceStart}
                        className="border border-[#2d323b] bg-[#0d1016] px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#aab1bc] transition-colors hover:border-[#505867] hover:text-[#e8e8e8] disabled:cursor-not-allowed disabled:border-[#232831] disabled:text-[#535b67]"
                      >
                        prev
                      </button>
                      <div className="relative h-9 overflow-hidden border border-[#242932] bg-[#0d1016]">
                        <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-[#242932]" />
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgba(240,198,207,0.18),rgba(240,198,207,0.44))]"
                          animate={{ width: `${Math.max(10, currentEntryProgress * 100)}%` }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#cfd4dd]">
                          strip progress
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={goForward}
                        disabled={isAtSequenceEnd}
                        className="border border-[#2d323b] bg-[#0d1016] px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#aab1bc] transition-colors hover:border-[#505867] hover:text-[#e8e8e8] disabled:cursor-not-allowed disabled:border-[#232831] disabled:text-[#535b67]"
                      >
                        next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </aside>
        </div>
      </motion.div>
    </motion.div>
  )
}
