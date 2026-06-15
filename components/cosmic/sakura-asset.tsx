import type { CSSProperties } from "react"

// Rasterized cosmic assets live in /public/cosmic as <name>-<width>.{avif,webp}.
// Widths are [retina, mobile] — see scripts/optimize-cosmic-assets.mjs.
export const COSMIC_ASSETS = {
  galaxy: [2000, 1000],
  peony: [1200, 600],
  lotus: [900, 500],
  "branch-a": [1100, 600],
  "branch-b": [1200, 600],
  river: [1000, 600],
  "stream-a": [1400, 800],
  "stream-b": [1400, 800],
  trail: [1400, 800],
  "dust-wave": [1400, 800],
  nebula: [1600, 900],
  sparkle: [1200, 700],
  petals: [1000, 600],
} as const

export type CosmicAssetName = keyof typeof COSMIC_ASSETS

type Props = {
  name: CosmicAssetName
  /** Accessible label. Omit for purely decorative layers (renders aria-hidden). */
  alt?: string
  /** Responsive sizing hint; defaults to full viewport width. */
  sizes?: string
  /** Above-the-fold hero asset → eager + high fetch priority. Default lazy. */
  priority?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * <picture> wrapper (AVIF → WebP → img). next/image buys nothing here
 * (next.config sets images.unoptimized), and these are decorative painterly
 * layers, so a raw <picture> with width-descriptor srcsets is leanest.
 */
export function SakuraAsset({ name, alt, sizes = "100vw", priority = false, className, style }: Props) {
  const [large, small] = COSMIC_ASSETS[name]
  const srcset = (ext: string) =>
    `/cosmic/${name}-${small}.${ext} ${small}w, /cosmic/${name}-${large}.${ext} ${large}w`

  return (
    <picture>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={`/cosmic/${name}-${small}.webp`}
        alt={alt ?? ""}
        aria-hidden={alt ? undefined : true}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        className={className}
        style={style}
      />
    </picture>
  )
}
