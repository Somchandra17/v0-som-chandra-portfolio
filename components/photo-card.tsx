"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, PenTool } from "lucide-react"
import type { PhotoItem, Tab } from "@/lib/creative-data"
import { formatMonthYear } from "@/lib/creative-data"

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
