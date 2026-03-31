"use client"

import { prepare, layout, prepareWithSegments, walkLineRanges } from "@chenglou/pretext"

// Cache for prepared text measurements
const measurementCache = new Map<string, ReturnType<typeof prepare>>()
const segmentCache = new Map<string, ReturnType<typeof prepareWithSegments>>()

/**
 * Prepare text for measurement (cached)
 */
export function prepareText(text: string, font: string) {
  const key = `${text}::${font}`
  if (!measurementCache.has(key)) {
    measurementCache.set(key, prepare(text, font))
  }
  return measurementCache.get(key)!
}

/**
 * Prepare text with segments for line-level control (cached)
 */
export function prepareTextWithSegments(text: string, font: string) {
  const key = `${text}::${font}`
  if (!segmentCache.has(key)) {
    segmentCache.set(key, prepareWithSegments(text, font))
  }
  return segmentCache.get(key)!
}

/**
 * Get layout dimensions for text
 */
export function measureText(text: string, font: string, maxWidth: number, lineHeight: number) {
  const prepared = prepareText(text, font)
  return layout(prepared, maxWidth, lineHeight)
}

/**
 * Get the tightest "shrink-wrap" width for text
 * This finds the exact pixel width that fits the text perfectly
 */
export function getShrinkWrapWidth(text: string, font: string, maxWidth: number): number {
  const prepared = prepareTextWithSegments(text, font)
  let width = 0
  walkLineRanges(prepared, maxWidth, (line) => {
    width = Math.max(width, line.width)
  })
  return Math.ceil(width)
}

/**
 * Get line-by-line measurements for multi-line text
 */
export function getLineWidths(text: string, font: string, maxWidth: number): number[] {
  const prepared = prepareTextWithSegments(text, font)
  const widths: number[] = []
  walkLineRanges(prepared, maxWidth, (line) => {
    widths.push(Math.ceil(line.width))
  })
  return widths
}

/**
 * Calculate balanced line width for text
 * Finds a width that distributes lines more evenly
 */
export function getBalancedWidth(text: string, font: string, maxWidth: number): number {
  const prepared = prepareText(text, font)
  const { lineCount } = layout(prepared, maxWidth, 1)
  
  if (lineCount <= 1) return maxWidth
  
  // Binary search for a width that produces balanced lines
  let lo = maxWidth / 2
  let hi = maxWidth
  
  while (hi - lo > 1) {
    const mid = (lo + hi) / 2
    const { lineCount: midLines } = layout(prepared, mid, 1)
    if (midLines > lineCount) {
      lo = mid
    } else {
      hi = mid
    }
  }
  
  return Math.ceil(hi)
}

/**
 * Pre-measure an array of strings and return measurements
 */
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

/**
 * Pre-measure strings and return shrink-wrap widths
 */
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

// Font string builders for common use cases
export const fonts = {
  body: (size: number) => `${size}px Inter, system-ui, sans-serif`,
  mono: (size: number) => `${size}px "Geist Mono", monospace`,
  bold: (size: number) => `bold ${size}px Inter, system-ui, sans-serif`,
  heading: (size: number) => `bold ${size}px Inter, system-ui, sans-serif`,
}

// Clear caches (useful for font changes)
export function clearMeasurementCache() {
  measurementCache.clear()
  segmentCache.clear()
}
