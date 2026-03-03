"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, PenTool } from "lucide-react"
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
  splitIntoSections,
  INITIAL_RENDER_COUNT,
  RENDER_STEP,
} from "@/lib/creative-data"

const siblingLinks: { key: Tab; label: string; href: string }[] = [
  { key: "sidequests", label: "Visual Detors", href: "/creative/visual-detours" },
  { key: "photos", label: "Clicks", href: "/creative/clicks" },
  { key: "sketches", label: "Doodling", href: "/creative/doodling" },
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
  const groupedGallery = useMemo(() => splitIntoSections(visibleItems), [visibleItems])
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
      <PageHeader title={title} subtitle={subtitle} />

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

          {/* Gallery grid */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pb-14">
            <div className="space-y-10">
              {groupedGallery.map((section, sectionIndex) => (
                <div key={section.heading}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-10 bg-[#3f3f3f]" />
                    <p className="inline-flex items-center border border-[#383838] bg-[#0d0d0d]/70 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[#a8a8a8]">
                      {section.heading}
                    </p>
                  </div>
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                    {section.items.map((item, i) => (
                      <PhotoCard
                        key={`${section.heading}-${item.id}`}
                        item={item}
                        index={sectionIndex * 100 + i}
                        activeTab={tabKey}
                        isTouchDevice={isTouchDevice}
                        onClick={() => setLightboxItem(item)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="pt-3">
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

      {/* Lightbox */}
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
