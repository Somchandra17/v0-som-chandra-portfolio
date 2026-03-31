"use client"

// Native Canvas-based text measurement (no external dependencies)
// Provides similar functionality to @chenglou/pretext using browser Canvas API

// Singleton canvas context for measurements
let ctx: CanvasRenderingContext2D | null = null

function getContext(): CanvasRenderingContext2D {
  if (typeof window === "undefined") {
    // SSR fallback - return mock that estimates based on character count
    return {
      font: "",
      measureText: (text: string) => ({ width: text.length * 8 }),
    } as unknown as CanvasRenderingContext2D
  }
  
  if (!ctx) {
    const canvas = document.createElement("canvas")
    ctx = canvas.getContext("2d")!
  }
  return ctx
}

// Cache for text measurements
const measurementCache = new Map<string, { width: number }>()

/**
 * Measure single line text width
 */
export function measureTextWidth(text: string, font: string): number {
  const key = `${text}::${font}`
  if (measurementCache.has(key)) {
    return measurementCache.get(key)!.width
  }
  
  const context = getContext()
  context.font = font
  const metrics = context.measureText(text)
  const width = metrics.width
  
  measurementCache.set(key, { width })
  return width
}

/**
 * Calculate layout dimensions for multi-line text
 */
export function measureText(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): { height: number; lineCount: number } {
  if (!text || text.length === 0) {
    return { height: 0, lineCount: 0 }
  }

  const context = getContext()
  context.font = font
  
  const words = text.split(/\s+/)
  let lineCount = 1
  let currentLineWidth = 0
  const spaceWidth = context.measureText(" ").width

  for (const word of words) {
    const wordWidth = context.measureText(word).width
    
    if (currentLineWidth + wordWidth > maxWidth && currentLineWidth > 0) {
      lineCount++
      currentLineWidth = wordWidth + spaceWidth
    } else {
      currentLineWidth += wordWidth + spaceWidth
    }
  }

  return {
    height: lineCount * lineHeight,
    lineCount,
  }
}

/**
 * Get the tightest "shrink-wrap" width for text
 * This finds the exact pixel width that fits the text perfectly
 */
export function getShrinkWrapWidth(text: string, font: string, maxWidth: number): number {
  const context = getContext()
  context.font = font
  
  // For single line, just measure directly
  const fullWidth = context.measureText(text).width
  if (fullWidth <= maxWidth) {
    return Math.ceil(fullWidth)
  }
  
  // For multi-line, find the widest line
  const words = text.split(/\s+/)
  let maxLineWidth = 0
  let currentLineWidth = 0
  const spaceWidth = context.measureText(" ").width

  for (const word of words) {
    const wordWidth = context.measureText(word).width
    
    if (currentLineWidth + wordWidth > maxWidth && currentLineWidth > 0) {
      maxLineWidth = Math.max(maxLineWidth, currentLineWidth - spaceWidth)
      currentLineWidth = wordWidth + spaceWidth
    } else {
      currentLineWidth += wordWidth + spaceWidth
    }
  }
  
  // Don't forget the last line
  maxLineWidth = Math.max(maxLineWidth, currentLineWidth - spaceWidth)
  
  return Math.ceil(maxLineWidth)
}

/**
 * Get line-by-line measurements for multi-line text
 */
export function getLineWidths(text: string, font: string, maxWidth: number): number[] {
  const context = getContext()
  context.font = font
  
  const words = text.split(/\s+/)
  const widths: number[] = []
  let currentLineWidth = 0
  const spaceWidth = context.measureText(" ").width

  for (const word of words) {
    const wordWidth = context.measureText(word).width
    
    if (currentLineWidth + wordWidth > maxWidth && currentLineWidth > 0) {
      widths.push(Math.ceil(currentLineWidth - spaceWidth))
      currentLineWidth = wordWidth + spaceWidth
    } else {
      currentLineWidth += wordWidth + spaceWidth
    }
  }
  
  // Don't forget the last line
  if (currentLineWidth > 0) {
    widths.push(Math.ceil(currentLineWidth - spaceWidth))
  }
  
  return widths
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
}
