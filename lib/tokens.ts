/**
 * TS mirror of the CSS design tokens in app/globals.css.
 *
 * Use ONLY where a literal color string is unavoidable:
 * framer-motion `animate` targets (framer can't tween `var()`),
 * SVG fills, and canvas paints. Everything className-based must
 * use the Tailwind token utilities (text-ink-300, border-world, …).
 */

export const INK = {
  900: "#0a0a0a",
  850: "#0e0e0e",
  800: "#111111",
  700: "#1a1a1a",
  600: "#2a2a2a",
  500: "#444444",
  400: "#7a7a7a",
  300: "#9a9a9a",
  200: "#c4c4c4",
  100: "#e8e8e8",
} as const

export type World = "nerdy" | "creative"

export const ACCENT: Record<World, string> = {
  nerdy: "#7fb07f",
  creative: "#f0c6cf",
}

export const ACCENT_DIM: Record<World, string> = {
  nerdy: "#4f6e4f",
  creative: "#a98088",
}

/** rgb() triplets for building rgba(...) glows — mirror of --glow-* channels. */
export const GLOW: Record<World, string> = {
  nerdy: "127, 176, 127",
  creative: "240, 198, 207",
}

export const glow = (world: World, alpha: number) => `rgba(${GLOW[world]}, ${alpha})`

/** Full-screen tint used during the home exit bloom, per destination world. */
export const EXIT_TINT: Record<World, string> = {
  nerdy: "#05140b",
  creative: "#170a13",
}

/** Isometric GitHub graph tower faces (lit top → shadowed side → dark side). */
export const GRAPH_GREEN = {
  top: "#a6dca7",
  side: "#6fa472",
  dark: "#3f5b44",
} as const

/** Cosmic grounds (canvas fills). */
export const COSMIC_VOID = "#07060d"

/** The hero highlight-pill paper cream (also --paper-cream in globals.css). */
export const PAPER_CREAM = "#e2d2c1"

/** Third-party brand colors. */
export const SPOTIFY_GREEN = "#1db954"
