"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Camera, PenTool } from "lucide-react"
import type { PhotoItem, Tab } from "@/lib/creative-data"
import { formatMonthYear, srcSetFor } from "@/lib/creative-data"
import { fonts, getTightWrapLayout, measureTextWidth, usePretextReady } from "@/lib/pretext"
import { DevelopIn } from "@/components/motion/develop-in"

const NOTE_PADDING_X = 12
const NOTE_MIN_WIDTH = 132
const CAPTION_LINE_HEIGHT = 16
const META_LINE_HEIGHT = 14

export function PhotoCard({
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
  onClick: (trigger: HTMLElement | null) => void
}) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isMidViewport, setIsMidViewport] = useState(false)
  const [cardWidth, setCardWidth] = useState(280)
  const pretextReady = usePretextReady()
  const isDoodling = activeTab === "sketches" || item.kind === "doodling"
  const isVaranasi = item.location?.toLowerCase().includes("varanasi")
  const captionText = item.desc && item.desc !== "demo caption" ? item.desc : ""
  const locationText = item.location ?? ""
  const dateText = item.date ? formatMonthYear(item.date) : ""

  useEffect(() => {
    if (!isTouchDevice) {
      setIsMidViewport(false)
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsMidViewport(true)
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

  useEffect(() => {
    const node = cardRef.current
    if (!node) return

    const updateWidth = () => setCardWidth(Math.max(180, Math.floor(node.clientWidth)))
    updateWidth()

    if (typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? node.clientWidth
      setCardWidth(Math.max(180, Math.floor(nextWidth)))
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const noteLayout = useMemo(() => {
    const availableWidth = Math.max(160, cardWidth - 28)
    const contentMaxWidth = Math.max(120, availableWidth - NOTE_PADDING_X * 2)

    const captionLayout = captionText
      ? getTightWrapLayout(captionText, fonts.body(12), contentMaxWidth, CAPTION_LINE_HEIGHT, pretextReady)
      : null
    const locationLayout = locationText
      ? getTightWrapLayout(locationText, fonts.mono(11), contentMaxWidth, META_LINE_HEIGHT, pretextReady)
      : null
    const dateWidth = dateText ? Math.ceil(measureTextWidth(dateText, fonts.mono(11), pretextReady)) : 0

    const contentWidth = Math.max(
      captionLayout?.width ?? 0,
      locationLayout?.width ?? 0,
      Math.min(contentMaxWidth, dateWidth)
    )

    const width = contentWidth > 0
      ? Math.min(availableWidth, Math.max(NOTE_MIN_WIDTH, contentWidth + NOTE_PADDING_X * 2))
      : availableWidth

    return {
      width,
      captionHeight: captionLayout?.height ?? 0,
      metaHeight: locationLayout?.height ?? 0,
    }
    // pretextReady is a recompute trigger (re-measure once fonts load), not read directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captionText, locationText, dateText, cardWidth, pretextReady])

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
      className={`break-inside-avoid mb-6 paper-card overflow-hidden cursor-pointer group hover-bounce ${isVaranasi ? "ring-2 ring-accent-creative" : ""}`}
      style={
        isVaranasi
          ? {
              boxShadow:
                "0 0 18px 4px rgba(240,198,207,0.45), 0 0 40px 8px rgba(240,198,207,0.2), inset 0 0 12px rgba(240,198,207,0.08)",
            }
          : undefined
      }
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.title?.trim() || captionText || (isDoodling ? "sketch" : "photo")}`}
      onClick={() => onClick(cardRef.current)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick(cardRef.current)
        }
      }}
    >
      <DevelopIn index={index % 6} rotate={index % 2 === 0 ? -1.1 : 0.9} immediate={index < 6} className="w-full bg-ink-700 relative overflow-hidden">
        {item.imageMeta ? (
          <picture>
            <source type="image/avif" srcSet={srcSetFor(item.imageMeta, "avif")} sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${item.imageMeta.base}-${item.imageMeta.widths[0]}.webp`}
              srcSet={srcSetFor(item.imageMeta, "webp")}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
              width={item.imageMeta.width}
              height={item.imageMeta.height}
              alt={item.title?.trim() || captionText || `${isDoodling ? "Sketch" : "Photograph"}${dateText ? `, ${dateText}` : ""}`}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index < 6 ? "high" : "auto"}
              className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </picture>
        ) : item.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.title?.trim() || captionText || `${isDoodling ? "Sketch" : "Photograph"}${dateText ? `, ${dateText}` : ""}`}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index < 6 ? "high" : "auto"}
            className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-700 to-ink-700">
            {activeTab === "photos" ? (
              <Camera className="h-8 w-8 text-ink-500 group-hover:text-ink-400 transition-colors" />
            ) : (
              <PenTool className="h-8 w-8 text-ink-500 group-hover:text-ink-400 transition-colors" />
            )}
          </div>
        )}
        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <div className="border border-ink-600 bg-ink-900/84 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-200 backdrop-blur-sm">
            {String(index + 1).padStart(3, "0")}
          </div>
        </div>
        <div className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${overlayVisibilityClass}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div
              className="inline-flex max-w-full flex-col gap-2 border border-ink-600 bg-ink-900/78 px-3 py-2 backdrop-blur-sm"
              style={{ width: `${noteLayout.width}px` }}
            >
              {captionText && (
                <p
                  className="text-xs italic text-ink-200 leading-relaxed"
                  style={noteLayout.captionHeight ? { minHeight: `${noteLayout.captionHeight}px` } : undefined}
                >
                  {captionText}
                </p>
              )}
              {(locationText || dateText) && (
                <div className={`${captionText ? "border-t border-ink-700 pt-2" : ""} space-y-1`}>
                  {locationText && (
                    <p
                      className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-200"
                      style={noteLayout.metaHeight ? { minHeight: `${noteLayout.metaHeight}px` } : undefined}
                    >
                      {locationText}
                    </p>
                  )}
                  {dateText && <p className="font-mono text-[0.62rem] text-ink-300">{dateText}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </DevelopIn>
    </div>
  )
}
