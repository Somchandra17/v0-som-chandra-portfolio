"use client"

import { useEffect, useState } from "react"
import {
  clearCache as clearPretextCache,
  layout,
  layoutWithLines,
  prepare,
  prepareWithSegments,
  walkLineRanges,
  type LayoutLine,
  type PreparedText,
  type PreparedTextWithSegments,
} from "@chenglou/pretext"

const UNBOUNDED_WIDTH = 100_000

type FallbackLayout = {
  height: number
  lineCount: number
  maxLineWidth: number
  lines: Array<{ text: string; width: number }>
}

type WrapMetrics = {
  lineCount: number
  maxLineWidth: number
  breaksWord: boolean
}

export type TightWrapLayout = {
  width: number
  height: number
  lineCount: number
  lines: Array<{ text: string; width: number }>
}

const preparedCache = new Map<string, PreparedText>()
const segmentedCache = new Map<string, PreparedTextWithSegments>()

function hasDocument() {
  return typeof document !== "undefined"
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/)
  return match ? Number.parseFloat(match[1]) : 16
}

function approximateTextWidth(text: string, font: string): number {
  const fontSize = getFontSize(font)
  return [...text].length * fontSize * 0.56
}

function approximateLayout(text: string, font: string, maxWidth: number, lineHeight: number): FallbackLayout {
  if (!text.trim()) {
    return { height: 0, lineCount: 0, maxLineWidth: 0, lines: [] }
  }

  const words = text.trim().split(/\s+/)
  const lines: Array<{ text: string; width: number }> = []
  let currentLine = ""
  let currentWidth = 0
  const spaceWidth = approximateTextWidth(" ", font)

  for (const word of words) {
    const wordWidth = approximateTextWidth(word, font)
    const candidateWidth = currentLine ? currentWidth + spaceWidth + wordWidth : wordWidth

    if (currentLine && candidateWidth > maxWidth) {
      lines.push({ text: currentLine, width: currentWidth })
      currentLine = word
      currentWidth = wordWidth
      continue
    }

    currentLine = currentLine ? `${currentLine} ${word}` : word
    currentWidth = candidateWidth
  }

  if (currentLine) {
    lines.push({ text: currentLine, width: currentWidth })
  }

  const maxLineWidth = lines.reduce((max, line) => Math.max(max, line.width), 0)
  return {
    height: lines.length * lineHeight,
    lineCount: lines.length,
    maxLineWidth,
    lines,
  }
}

function getPrepared(text: string, font: string): PreparedText | null {
  if (!hasDocument()) return null
  const key = `${font}::${text}`
  const cached = preparedCache.get(key)
  if (cached) return cached
  const prepared = prepare(text, font)
  preparedCache.set(key, prepared)
  return prepared
}

function getPreparedWithSegments(text: string, font: string): PreparedTextWithSegments | null {
  if (!hasDocument()) return null
  const key = `${font}::${text}`
  const cached = segmentedCache.get(key)
  if (cached) return cached
  const prepared = prepareWithSegments(text, font)
  segmentedCache.set(key, prepared)
  return prepared
}

function collectWrapMetrics(prepared: PreparedTextWithSegments, maxWidth: number): WrapMetrics {
  let maxLineWidth = 0
  let breaksWord = false
  const lineCount = walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > maxLineWidth) maxLineWidth = line.width
    if (line.end.graphemeIndex !== 0) breaksWord = true
  })

  return { lineCount, maxLineWidth, breaksWord }
}

function toTightWrapLayout(lines: LayoutLine[], lineHeight: number): TightWrapLayout {
  let widest = 0
  const mappedLines = lines.map((line) => {
    const width = Math.ceil(line.width)
    if (width > widest) widest = width
    return { text: line.text, width }
  })

  return {
    width: widest,
    height: mappedLines.length * lineHeight,
    lineCount: mappedLines.length,
    lines: mappedLines,
  }
}

/**
 * `precise = false` forces the deterministic approximation — pass `usePretextReady()`
 * here when the result lands in server-rendered markup (style widths/heights), so the
 * server HTML and the first client render agree and hydration stays clean.
 */
export function measureTextWidth(text: string, font: string, precise = true): number {
  if (!text) return 0

  const prepared = precise ? getPreparedWithSegments(text, font) : null
  if (!prepared) {
    return Math.ceil(approximateTextWidth(text, font))
  }

  let widest = 0
  walkLineRanges(prepared, UNBOUNDED_WIDTH, (line) => {
    if (line.width > widest) widest = line.width
  })
  return Math.ceil(widest)
}

export function measureText(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  /** See measureTextWidth — false keeps SSR and first client render identical. */
  precise = true
): { height: number; lineCount: number } {
  if (!text || !text.trim()) {
    return { height: 0, lineCount: 0 }
  }

  const prepared = precise ? getPrepared(text, font) : null
  if (!prepared) {
    const fallback = approximateLayout(text, font, maxWidth, lineHeight)
    return { height: fallback.height, lineCount: fallback.lineCount }
  }

  return layout(prepared, maxWidth, lineHeight)
}

export function getShrinkWrapWidth(text: string, font: string, maxWidth: number): number {
  if (!text || !text.trim()) return 0

  const prepared = getPreparedWithSegments(text, font)
  if (!prepared) {
    const fallback = approximateLayout(text, font, maxWidth, 16)
    return Math.ceil(Math.min(maxWidth, fallback.maxLineWidth))
  }

  let widest = 0
  walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > widest) widest = line.width
  })
  return Math.ceil(widest)
}

export function getLineWidths(text: string, font: string, maxWidth: number): number[] {
  if (!text || !text.trim()) return []

  const prepared = getPreparedWithSegments(text, font)
  if (!prepared) {
    return approximateLayout(text, font, maxWidth, 16).lines.map((line) => Math.ceil(line.width))
  }

  const widths: number[] = []
  walkLineRanges(prepared, maxWidth, (line) => {
    widths.push(Math.ceil(line.width))
  })
  return widths
}

export function getTightWrapLayout(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  /** See measureTextWidth — false keeps SSR and first client render identical. */
  precise = true
): TightWrapLayout {
  if (!text || !text.trim()) {
    return { width: 0, height: 0, lineCount: 0, lines: [] }
  }

  const prepared = precise ? getPreparedWithSegments(text, font) : null
  if (!prepared) {
    const fallback = approximateLayout(text, font, maxWidth, lineHeight)
    return {
      width: Math.ceil(Math.min(maxWidth, fallback.maxLineWidth)),
      height: fallback.height,
      lineCount: fallback.lineCount,
      lines: fallback.lines.map((line) => ({ text: line.text, width: Math.ceil(line.width) })),
    }
  }

  const initial = collectWrapMetrics(prepared, maxWidth)
  let lo = 1
  let hi = Math.max(1, Math.ceil(maxWidth))
  let bestWidth = hi

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const midMetrics = collectWrapMetrics(prepared, mid)
    const keepsLineCount = midMetrics.lineCount <= initial.lineCount
    const avoidsForcedBreaks = initial.breaksWord || !midMetrics.breaksWord

    if (keepsLineCount && avoidsForcedBreaks) {
      bestWidth = mid
      hi = mid
    } else {
      lo = mid + 1
    }
  }

  const result = layoutWithLines(prepared, bestWidth, lineHeight)
  return toTightWrapLayout(result.lines, lineHeight)
}

export function batchMeasure(
  texts: string[],
  font: string,
  maxWidth: number,
  lineHeight: number
): { text: string; height: number; lineCount: number }[] {
  return texts.map((text) => {
    const { height, lineCount } = measureText(text, font, maxWidth, lineHeight)
    return { text, height, lineCount }
  })
}

export function batchShrinkWrap(
  texts: string[],
  font: string,
  maxWidth: number
): { text: string; width: number }[] {
  return texts.map((text) => ({
    text,
    width: getShrinkWrapWidth(text, font, maxWidth),
  }))
}

export const fonts = {
  body: (size: number) => `400 ${size}px "Space Grotesk", sans-serif`,
  mono: (size: number) => `400 ${size}px "Geist Mono", monospace`,
  bold: (size: number) => `700 ${size}px "Space Grotesk", sans-serif`,
  heading: (size: number) => `700 ${size}px "Space Grotesk", sans-serif`,
}

export function clearMeasurementCache() {
  preparedCache.clear()
  segmentedCache.clear()
  clearPretextCache()
}

export function usePretextReady(): boolean {
  // Starts false on the server AND the first client render — even when fonts are already
  // cached — so measured styles in server HTML match hydration exactly. The effect flips
  // it immediately after mount when fonts are ready (progressive enhancement).
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!hasDocument() || !document.fonts) {
      setReady(true)
      return
    }

    if (document.fonts.status === "loaded") {
      setReady(true)
      return
    }

    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
