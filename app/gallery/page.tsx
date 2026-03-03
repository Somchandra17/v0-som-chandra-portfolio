"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BookOpen, Camera, Compass, PenTool, ChevronLeft, ChevronRight, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import galleryRaw from "@/data/gallery.json"
import styles from "./gallery.module.css"

/**
 * gallery content is fully managed from /data/gallery.json.
 * you only edit json; this page auto-renders based on "type".
 *
 * valid entry shapes:
 * 1) visual-detours single photo:
 *    { id, type: "visual-detours", image, location, date, caption }
 * 2) visual-detours grouped photos:
 *    { id, type: "visual-detours", photos: ["/gallery/a.jpg", ...], location, date, caption }
 * 3) photography:
 *    { id, type: "photography", image, location, date }
 * 4) doodling:
 *    { id, type: "doodling", image }
 * 5) thoughts:
 *    { id, type: "thoughts", title, date, text }
 *
 * drop images in /public/creative/pictures and reference them as /creative/pictures/<folder>/<file>.
 */

type TabKey = "photography" | "doodling" | "visual-detours" | "thoughts"

type VisualDetourSingle = {
  id: number
  type: "visual-detours"
  image: string
  location: string
  date: string
  caption: string
}

type VisualDetourGroup = {
  id: number
  type: "visual-detours"
  photos: string[]
  location: string
  date: string
  caption: string
}

type PhotographyEntry = {
  id: number
  type: "photography"
  image: string
  location: string
  date: string
}

type DoodlingEntry = {
  id: number
  type: "doodling"
  image: string
}

type ThoughtEntry = {
  id: number
  type: "thoughts"
  title: string
  date: string
  text: string
}

type GalleryEntry = VisualDetourSingle | VisualDetourGroup | PhotographyEntry | DoodlingEntry | ThoughtEntry

type LightboxState = {
  photos: string[]
  index: number
} | null

const tabs: Array<{ key: TabKey; label: string; sectionLabel: string; icon: typeof Camera }> = [
  { key: "photography", label: "Photography", sectionLabel: "LATE CAPTURES", icon: Camera },
  { key: "doodling", label: "Doodling", sectionLabel: "GRAPHITE SPILLS", icon: PenTool },
  { key: "visual-detours", label: "Visual Detours", sectionLabel: "QUIET CHAOS", icon: Compass },
  { key: "thoughts", label: "Thoughts", sectionLabel: "QUESTIONBLE HOURS", icon: BookOpen },
]

const galleryData = [...(galleryRaw as GalleryEntry[])].sort((a, b) => a.id - b.id)

function isVisualDetourGroup(entry: VisualDetourSingle | VisualDetourGroup): entry is VisualDetourGroup {
  return Array.isArray((entry as VisualDetourGroup).photos)
}

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("photography")
  const [lightbox, setLightbox] = useState<LightboxState>(null)

  const activeItems = useMemo(() => galleryData.filter((item) => item.type === activeTab), [activeTab])
  const activeTabMeta = tabs.find((tab) => tab.key === activeTab) ?? tabs[0]

  useEffect(() => {
    if (!lightbox) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null)
        return
      }

      if (event.key === "ArrowLeft") {
        setLightbox((current) => {
          if (!current) return current
          const previous = (current.index - 1 + current.photos.length) % current.photos.length
          return { ...current, index: previous }
        })
      }

      if (event.key === "ArrowRight") {
        setLightbox((current) => {
          if (!current) return current
          const next = (current.index + 1) % current.photos.length
          return { ...current, index: next }
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightbox])

  const goLightbox = (direction: -1 | 1) => {
    setLightbox((current) => {
      if (!current) return current
      const nextIndex = (current.index + direction + current.photos.length) % current.photos.length
      return { ...current, index: nextIndex }
    })
  }

  const lightboxImage = lightbox ? lightbox.photos[lightbox.index] : null

  return (
    <>
      <PageHeader title="gallery" subtitle="photography / doodling / visual detours / thoughts" />

      <PageTransition>
        <main className="relative mx-auto min-h-screen w-full max-w-5xl px-6 py-10 text-[#e8e8e8]">
          <section className="mb-10">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#666]">logbook interface</p>

            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full border px-4 py-2 font-mono text-xs tracking-wide transition-colors duration-200 ${
                    activeTab === tab.key
                      ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#111111]"
                      : "border-[#444] bg-transparent text-[#999] hover:border-[#666] hover:text-[#e8e8e8]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <AnimatePresence mode="wait">
            <motion.section
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#333]" />
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#666]">
                  {activeTabMeta.sectionLabel}
                </p>
              </div>

              {activeTab === "visual-detours" && (
                <div className="space-y-8">
                  {(activeItems as Array<VisualDetourSingle | VisualDetourGroup>).map((entry) => {
                    if (isVisualDetourGroup(entry)) {
                      const previewPhotos = entry.photos.slice(0, 3)

                      return (
                        <article key={entry.id} className={styles.detourCard}>
                          <button
                            type="button"
                            className={styles.stackButton}
                            onClick={() => setLightbox({ photos: entry.photos, index: 0 })}
                          >
                            <div className={styles.stackFrame}>
                              {previewPhotos.map((photo, photoIndex) => {
                                const placementClass =
                                  photoIndex === 0
                                    ? styles.stackOne
                                    : photoIndex === 1
                                      ? styles.stackTwo
                                      : styles.stackThree

                                return (
                                  <div key={photo} className={`${styles.stackPhoto} ${placementClass}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photo} alt={`${entry.location} frame ${photoIndex + 1}`} loading="lazy" />
                                  </div>
                                )
                              })}

                              <span className={styles.stackIndicator}>{entry.photos.length} frames</span>
                            </div>
                          </button>

                          <div className="mt-4 flex items-center justify-between font-mono text-xs text-[#666]">
                            <span>{entry.location}</span>
                            <span>{entry.date}</span>
                          </div>
                          <p className="mt-3 border-l border-[#2a2a2a] pl-3 text-sm italic leading-relaxed text-[#bdbdbd]">
                            {entry.caption}
                          </p>
                        </article>
                      )
                    }

                    return (
                      <article key={entry.id} className={`${styles.detourCard} group`}>
                        <div className="overflow-hidden border border-[#2a2a2a] bg-[#111111]">
                          <div className="aspect-[4/3] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.image}
                              alt={`${entry.location} on ${entry.date}`}
                              className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between font-mono text-xs text-[#666]">
                          <span>{entry.location}</span>
                          <span>{entry.date}</span>
                        </div>
                        <p className="mt-3 border-l border-[#2a2a2a] pl-3 text-sm italic leading-relaxed text-[#bdbdbd]">
                          {entry.caption}
                        </p>
                      </article>
                    )
                  })}
                </div>
              )}

              {activeTab === "photography" && (
                <div className={styles.masonry}>
                  {(activeItems as PhotographyEntry[]).map((entry) => (
                    <article key={entry.id} className={`${styles.masonryItem} group`}>
                      <div className="overflow-hidden border border-[#2a2a2a] bg-[#111111]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.image}
                          alt={`${entry.location} on ${entry.date}`}
                          className="h-auto w-full transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-[#666]">
                        <span>{entry.location}</span>
                        <span>{entry.date}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === "doodling" && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {(activeItems as DoodlingEntry[]).map((entry) => (
                    <article key={entry.id} className="group overflow-hidden border border-[#2a2a2a] bg-[#111111]">
                      <div className="aspect-square overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.image}
                          alt={`doodling ${entry.id}`}
                          className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === "thoughts" && (
                <div className="space-y-5">
                  {(activeItems as ThoughtEntry[]).map((entry) => (
                    <article key={entry.id} className="border border-[#222] bg-[#111111]/40 p-5 md:p-6">
                      <div className="mb-3 flex items-start justify-between gap-6">
                        <h3 className="font-mono text-lg font-semibold text-[#e8e8e8]">{entry.title}</h3>
                        <span className="font-mono text-xs text-[#666]">{entry.date}</span>
                      </div>
                      <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#cfcfcf]">
                        {entry.text}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        </main>
      </PageTransition>

      <AnimatePresence>
        {lightbox && lightboxImage && (
          <motion.div
            className="fixed inset-0 z-[350] bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setLightbox(null)
              }}
              className="absolute left-4 top-4 z-20 border border-[#333] bg-[#111111] p-2 text-[#c7c7c7] transition-colors hover:border-[#555] hover:text-[#e8e8e8]"
              aria-label="close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="absolute right-5 top-5 z-20 font-mono text-xs text-[#8e8e8e]">
              {lightbox.index + 1} / {lightbox.photos.length}
            </p>

            {lightbox.photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    goLightbox(-1)
                  }}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 border border-[#333] bg-[#111111] p-2 text-[#c7c7c7] transition-colors hover:border-[#555] hover:text-[#e8e8e8]"
                  aria-label="previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    goLightbox(1)
                  }}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 border border-[#333] bg-[#111111] p-2 text-[#c7c7c7] transition-colors hover:border-[#555] hover:text-[#e8e8e8]"
                  aria-label="next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="flex h-full w-full items-center justify-center px-12 py-8 md:px-20" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage}
                alt={`frame ${lightbox.index + 1}`}
                className="max-h-[90vh] w-auto max-w-full object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
