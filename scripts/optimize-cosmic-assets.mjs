// Cosmic Sakura asset pipeline.
//
// The raw SVGs in /SVGs are painterly, raster-traced single-path vectors (376KB–3.9MB).
// Shipping them inline would tessellate megabytes of path data on the main thread, so we
// rasterize them to AVIF + WebP at two widths each (retina + mobile), preserving alpha.
// This is a ~10x size win with no visual loss (they are already painterly raster art).
//
// Pipeline: rsvg-convert (SVG -> high-res PNG) -> magick (PNG -> AVIF/WebP, alpha kept).
// Requires: rsvg-convert, magick (ImageMagick w/ libheif + libwebp). Verified present.
//
// Usage:  node scripts/optimize-cosmic-assets.mjs
// Output: public/cosmic/<name>-<width>.{avif,webp}

import { execFileSync } from "node:child_process"
import { mkdirSync, statSync, rmSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SRC_DIR = join(ROOT, "SVGs")
const OUT_DIR = join(ROOT, "public", "cosmic")
const TMP = join(ROOT, ".cosmic-tmp.png")

const WEBP_Q = 82
const AVIF_Q = 55

// source SVG -> semantic name + [retina, mobile] widths
const ASSETS = [
  { src: "Project Image 2.svg",                    name: "galaxy",    widths: [2000, 1000] }, // spiral galaxy + blossoms — centerpiece
  { src: "Project Image (1) 2.svg",                name: "peony",     widths: [1200, 600] },  // pink peony bloom — contact finale
  { src: "Project Image (3).svg",                  name: "lotus",     widths: [900, 500] },   // purple lotus — secondary focal
  { src: "Project Image (4).svg",                  name: "branch-a",  widths: [1100, 600] },  // sakura branch
  { src: "Project Image (2) 2.svg",                name: "branch-b",  widths: [1200, 600] },  // sakura branch + mist (complex, static)
  { src: "Project Image (3) 2.svg",                name: "river",     widths: [1000, 600] },  // vertical petal river (opaque ground -> blend in CSS)
  { src: "Generate Variation for Project (1).svg", name: "stream-a",  widths: [1400, 800] },  // teal stardust stream
  { src: "Generate Variation for Project.svg",     name: "stream-b",  widths: [1400, 800] },  // teal/green stardust river
  { src: "Project Image (5).svg",                  name: "trail",     widths: [1400, 800] },  // horizontal stardust trail
  { src: "Project Image.svg",                      name: "dust-wave", widths: [1400, 800] },  // purple cosmic dust wave
  { src: "Project Image (2).svg",                  name: "nebula",    widths: [1600, 900] },  // pink/brown nebula sweep
  { src: "Project Image (6).svg",                  name: "sparkle",   widths: [1200, 700] },  // diagonal stardust + petals (comet)
  { src: "Project Image (7).svg",                  name: "petals",    widths: [1000, 600] },  // sparse drifting petals
]

const kb = (p) => Math.round(statSync(p).size / 1024)

mkdirSync(OUT_DIR, { recursive: true })

let totalSvg = 0
let totalOut = 0

for (const { src, name, widths } of ASSETS) {
  const srcPath = join(SRC_DIR, src)
  totalSvg += kb(srcPath)
  for (const w of widths) {
    // 1. SVG -> PNG at target width (vector, crisp)
    execFileSync("rsvg-convert", ["-w", String(w), srcPath, "-o", TMP])
    // 2. PNG -> WebP + AVIF (alpha preserved)
    const webp = join(OUT_DIR, `${name}-${w}.webp`)
    const avif = join(OUT_DIR, `${name}-${w}.avif`)
    execFileSync("magick", [TMP, "-quality", String(WEBP_Q), "-define", "webp:method=6", webp])
    execFileSync("magick", [TMP, "-quality", String(AVIF_Q), avif])
    totalOut += kb(webp) + kb(avif)
    console.log(`  ${name}-${w}  webp ${kb(webp)}KB  avif ${kb(avif)}KB`)
  }
}

rmSync(TMP, { force: true })
console.log(`\nsource SVGs: ${(totalSvg / 1024).toFixed(1)}MB  ->  output (avif+webp, all widths): ${(totalOut / 1024).toFixed(1)}MB`)
