/**
 * Gallery image pipeline.
 *
 * Reads the full-resolution originals from `originals/{clicks,sketch}` (kept out of
 * `public/` so they never ship in a deploy), emits responsive AVIF + WebP variants to
 * `public/gallery/{clicks,sketch}/<name>-<width>.<ext>`, and writes
 * `data/gallery-manifest.json` mapping each ORIGINAL public path (the `image` values in
 * data/gallery.json, e.g. "/creative/pictures/clicks/1.jpg") to its rendition set +
 * intrinsic dimensions. `lib/creative-data.ts` joins the manifest at import time.
 *
 * Run: pnpm images   (idempotent — skips up-to-date outputs)
 */
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ORIGINALS = path.join(ROOT, "originals")
const OUT_ROOT = path.join(ROOT, "public", "gallery")
const MANIFEST_PATH = path.join(ROOT, "data", "gallery-manifest.json")

/** Grid tiers + the lightbox tier (2000). Variants above the source width are skipped. */
const WIDTHS = [480, 768, 1080, 1600, 2000]
const AVIF_OPTS = { quality: 50, effort: 3 }
const WEBP_OPTS = { quality: 78, effort: 4 }
const SETS = [
  { dir: "clicks", publicPrefix: "/creative/pictures/clicks" },
  { dir: "sketch", publicPrefix: "/creative/pictures/sketch" },
]

const exts = new Set([".jpg", ".jpeg", ".png", ".webp"])

async function processImage(setDir, publicPrefix, file, manifest, stats) {
  const srcPath = path.join(ORIGINALS, setDir, file)
  const base = path.parse(file).name
  const outDir = path.join(OUT_ROOT, setDir)
  fs.mkdirSync(outDir, { recursive: true })

  // .rotate() bakes EXIF orientation so width/height are display dimensions.
  const probe = sharp(srcPath).rotate()
  const meta = await probe.metadata()
  const srcW = meta.autoOrient?.width ?? meta.width
  const srcH = meta.autoOrient?.height ?? meta.height
  if (!srcW || !srcH) throw new Error(`no dimensions for ${file}`)

  const widths = []
  for (const w of WIDTHS) {
    if (w > srcW && widths.length > 0) break // never upscale; keep at least one tier
    const target = Math.min(w, srcW)
    if (widths.includes(target)) continue
    widths.push(target)

    for (const [ext, opts] of [
      ["avif", AVIF_OPTS],
      ["webp", WEBP_OPTS],
    ]) {
      const outPath = path.join(outDir, `${base}-${target}.${ext}`)
      if (fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs > fs.statSync(srcPath).mtimeMs) {
        continue // up to date
      }
      const pipeline = sharp(srcPath).rotate().resize({ width: target, withoutEnlargement: true })
      await (ext === "avif" ? pipeline.avif(opts) : pipeline.webp(opts)).toFile(outPath)
      stats.encoded += 1
    }
  }

  manifest[`${publicPrefix}/${file}`] = {
    base: `/gallery/${setDir}/${base}`,
    width: srcW,
    height: srcH,
    widths,
  }
  stats.images += 1
}

async function run() {
  if (!fs.existsSync(ORIGINALS)) {
    console.error(`originals/ not found at ${ORIGINALS} — move the full-res sources there first.`)
    process.exit(1)
  }

  const jobs = []
  for (const { dir, publicPrefix } of SETS) {
    const setPath = path.join(ORIGINALS, dir)
    if (!fs.existsSync(setPath)) continue
    for (const file of fs.readdirSync(setPath)) {
      if (exts.has(path.extname(file).toLowerCase())) jobs.push({ dir, publicPrefix, file })
    }
  }

  const manifest = {}
  const stats = { images: 0, encoded: 0 }
  const concurrency = Math.max(2, Math.min(8, os.cpus().length - 1))
  let cursor = 0
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++]
      await processImage(job.dir, job.publicPrefix, job.file, manifest, stats)
      if (stats.images % 20 === 0) console.log(`  …${stats.images}/${jobs.length}`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))

  // Stable key order keeps the manifest diff-friendly.
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(ordered, null, 1))
  console.log(`done: ${stats.images} images, ${stats.encoded} new encodes → ${path.relative(ROOT, MANIFEST_PATH)}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
