"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Camera, PenTool } from "lucide-react"
import type { PhotoItem, Tab } from "@/lib/creative-data"
import { formatMonthYear } from "@/lib/creative-data"
import { fonts, getTightWrapLayout, measureTextWidth, usePretextReady } from "@/lib/pretext"

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
  onClick: () => void
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
    if (!node || typeof ResizeObserver === "undefined") return

    const updateWidth = () => setCardWidth(Math.max(180, Math.floor(node.clientWidth)))
    updateWidth()

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
      ? getTightWrapLayout(captionText, fonts.body(12), contentMaxWidth, CAPTION_LINE_HEIGHT)
      : null
    const locationLayout = locationText
      ? getTightWrapLayout(locationText, fonts.mono(11), contentMaxWidth, META_LINE_HEIGHT)
      : null
    const dateWidth = dateText ? Math.ceil(measureTextWidth(dateText, fonts.mono(11))) : 0

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
      className={`break-inside-avoid mb-6 paper-card overflow-hidden cursor-pointer group hover-bounce animate-in fade-in slide-in-from-bottom-2 duration-300 [content-visibility:auto] [contain-intrinsic-size:340px_240px] ${isVaranasi ? "ring-2 ring-[#f0c6cf]" : ""}`}
      style={{
        animationDelay: `${Math.min(index, 8) * 24}ms`,
        ...(isVaranasi
          ? {
              boxShadow:
                "0 0 18px 4px rgba(240,198,207,0.45), 0 0 40px 8px rgba(240,198,207,0.2), inset 0 0 12px rgba(240,198,207,0.08)",
            }
          : {}),
      }}
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
            <div
              className="inline-flex max-w-full flex-col gap-2 border border-[#2f2f2f] bg-[#0a0a0a]/78 px-3 py-2 backdrop-blur-sm"
              style={{ width: `${noteLayout.width}px` }}
            >
              {captionText && (
                <p
                  className="text-xs text-[#d8d8d8] leading-relaxed"
                  style={noteLayout.captionHeight ? { minHeight: `${noteLayout.captionHeight}px` } : undefined}
                >
                  {captionText}
                </p>
              )}
              {(locationText || dateText) && (
                <div className={`${captionText ? "border-t border-[#242424] pt-2" : ""} space-y-1`}>
                  {locationText && (
                    <p
                      className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#bcbcbc]"
                      style={noteLayout.metaHeight ? { minHeight: `${noteLayout.metaHeight}px` } : undefined}
                    >
                      {locationText}
                    </p>
                  )}
                  {dateText && <p className="font-mono text-[0.62rem] text-[#808080]">{dateText}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
