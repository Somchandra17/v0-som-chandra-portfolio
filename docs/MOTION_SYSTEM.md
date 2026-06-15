# Homepage — Animation & Layer System

The homepage (`app/page.tsx`) is an ambient scroll experience: *a software engineer drifting
through a digital cosmos*. This documents the layer stack, the motion systems, the compositing
treatment, and the performance contract that keeps it cheap to render. Scope is **homepage only** —
`/nerdy` and `/creative` stay terminal/brutalist as the deliberate contrast.

## Concept: "two worlds, one night sky"
The homepage is the shared cosmic night. **Pick a side** is the fork — **nerdy = lit green terminal**
(CRT, code) vs **creative = the unhinged side** (sakura, pink glow). Pink layers bloom toward the
creative side; green layers wake on the nerdy side. The cosmos is the connective tissue.

## Tech stack & division of labor
- **Framer Motion** — *everything that moves*: scroll parallax (`useScroll`/`useTransform`/`useSpring`),
  cursor parallax (`useMotionValue` + springs), the infinite float loops, mount reveals, the name-morph,
  the hover awakenings, the convergence bloom.
- **Native scroll** — no smooth-scroll library. (Lenis/GSAP were removed; the scroll-tied animations
  are tuned for native scroll.)
- **Canvas 2D** — the star particle field. No Three.js, no WebGL.

There is exactly **one scroll reader** (`useScroll`) shared by the layers, the particle drift, and the
hero exit, so there is no two-system jitter.

## Stacking model

Bottom → top, as composited on the homepage:

```
.curved-paper-bg            z-0    (LayoutShell — paper ground, mostly hidden by the void)
└ .float-content            z-10   (LayoutShell — page content; establishes a stacking context)
   └ <main> bg #07060d
      ├ <ParticleField>     canvas  fixed  -z-10   ← drifting stars (opaque #07060d fill)
      ├ <FloatingSvgs>      fixed   z-0   isolation:isolate
      │   └ 12 cosmic layers, internal z-index -2 … 5  (blend *within* this isolated group)
      └ page sections       (hero / cards / spotify / ctf / footer; inner content z-10)
.paper-texture::before      z-50   (LayoutShell — film grain, mix-blend-screen)
.lowlight-burn              z-51   (LayoutShell — sensor vignette)
```

**Key decision — `isolation: isolate` on the `FloatingSvgs` container.** The 12 layers use
`mix-blend-screen`. Without isolation, `screen` blends against the backdrop *including the star canvas
that repaints every frame* — forcing all 12 large layers to re-rasterize + re-blend continuously
(the original lag/high-CPU cause). Isolation makes them blend only within their own group (against the
two static dark-gradient washes inside it), decoupling them from the canvas.

## The 12 cosmic layers (`components/cosmic/floating-svgs.tsx` → `sceneData`)

Each layer is a stack of nested `motion.div`s: **outer** = position + scroll/mouse `x,y` →
**reveal** = mount fade/scale/rotate + `mix-blend-screen` → **inner** = continuous float loop + radial
mask → the image (`<picture>` AVIF/WebP) or, for the nebula, a CSS gradient.

| # | Layer (`type`) | Tone | Asset (`/cosmic`) | z | Scroll `parallax` | Mouse `depth` | Size | Top / Left | Rot° | Float | Base α |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | `nebula-glow` | pink | *CSS gradient* | −2 | 0.1 | 0.15 | 250vw | calc(20vh−125vw) / −45vw | 20 | 90s | 0.35 |
| 1 | `galaxy` | pink | `galaxy-2000` | 0 | 0.2 | 0.08 | 200vw | calc(30vh−100vw) / −35vw | −15 | 60s | 0.28 |
| 2 | `river` | green | `dust-wave-1400` | 1 | 0.5 | 0.08 | 150vw | calc(40vh−75vw) / 10vw | 35 | 50s | 0.18 |
| 3 | `orbital` | pink | `river-1000` | 0 | 0.4 | 0.06 | 200vw | calc(70%−100vw) / calc(60%−100vw) | −20 | 75s | 0.20 |
| 4 | `branch` | pink | `branch-a-1100` | 3 | 1.2 | 0.04 | 100vw | −60vw / 60vw | 20 | 40s | 0.15 |
| 5 | `branch-small` | pink | `petals-1000` | 3 | 1.2 | 0.04 | 60vw | 20vh / −20vw | −10 | 35s | 0.12 |
| 6 | `trail` | pink | `trail-1400` | 4 | 1.5 | 0.02 | 80vw | 40% / 10% | 5 | 45s | *scroll* |
| 7 | `flower-deep` | pink | `lotus-900` | −1 | 0.15 | 0.10 | 80vw | −30vw / −30vw | 45 | 30s | 0.08 |
| 8 | `footer-bloom` | pink | `peony-1200` | 5 | 0 | 0.02 | 90vw | calc(100vh−45vw) / calc(75vw−45vw) | −25 | 25s | *scroll* |
| 9 | `…green-ecosystem` | green | `stream-b-1400` | 0 | 1.5 | 0.02 | 70vw | calc(40vh−35vw) / calc(25vw−35vw) | 10 | 28s | 0.05 |
| 10 | `…green-ecosystem` | green | `stream-a-1400` | 0 | 0.5 | 0.05 | 100vw | calc(70%−50vw) / −30vw | −15 | 32s | 0.05 |
| 11 | `…pink-particles` | pink | `sparkle-1200` | 5 | 1.5 | 0.01 | 70vw | calc(40vh−35vw) / calc(75vw−35vw) | 30 | 20s | *hover* |

- **`nebula-glow`** is a pure `radial-gradient` (pink→violet→transparent), not an image — it replaced a
  3.99 MB galaxy SVG blurred at `120px`. No image, no mask, no blur.
- **`trail`** and **`footer-bloom`** have no static opacity; they are driven by whole-page scroll
  progress (see *Scroll-driven specials*).
- **`pink-particles`** is invisible until the creative side is hovered.

## Motion systems

1. **Scroll parallax (depth via speed).** `useScroll().scrollY` → `useSpring(damping 50, stiffness 300)`
   → each layer's `y = scrollY × parallax × −1`. Foreground layers (`parallax` 1.2–1.5) slide fast
   against the scroll; deep background (0.1–0.2) barely moves → parallax depth.
2. **Cursor depth parallax.** A single `mousemove` listener (rAF-coalesced, `(pointer:fine)` only)
   normalizes the cursor to −0.5…0.5; each layer offsets by `cursor × windowWidth × depth`, springed.
   **Only the perceptible layers (`depth ≥ 0.08`: nebula, galaxy, river, flower-deep) are mouse-driven** —
   the rest are static on the cursor axis, so a handful of springs run on move instead of 24.
3. **Continuous float loops.** Per-`type` infinite keyframe loops on the innermost div (slow
   scale/rotate/opacity/x/y), 20–90 s, staggered by index — the perpetual "alive" drift.
4. **Mount reveal.** One-shot fade + scale + rotate to target on mount, eased `cubic-bezier(0.16,1,0.3,1)`,
   opacity ramp 4–15 s depending on layer.
5. **Scroll-driven specials.** `trail` translates `−20% → 20%` with an opacity pulse; `footer-bloom`
   scales `0.5 → 1.2`, fades `0 → 0.9`, and rotates as page `scrollYProgress` runs `0.7 → 1` — the
   closing peony bloom.
6. **Hover awakenings.** `hoverSide` (`creative` | `nerdy`, lifted from the pick-a-side cards) boosts
   matching-tone layers (opacity ×1.5, slight scale/rotate) and dims off-tone layers (×0.7);
   `pink-particles` and the green ecosystem get dedicated boosts.

## Hero & cards (`app/page.tsx`)
- **Hero exit:** `useScroll({ target: heroRef })` → `heroOpacity 1→0` over `[0, 0.8]` and
  `heroY 0→−100` — the hero fades up as you scroll past it. *(Held static under reduced motion.)*
- **Name morph:** a button toggles `som ⇄ 0xs0m` (green for nerdy). Cycling taglines (`heroLines`, 3 s)
  and fun facts (`funFacts`, 2.2 s) run on intervals.
- **Card 3D tilt:** cursor → `parallaxX/Y` (±10 px) + `rotateX/Y` (±4°) via springs
  (damping 30, stiffness 100). `(pointer:fine)` + non-reduced-motion, rAF-coalesced.

## Particle field (`components/cosmic/particle-field.tsx`)
One fixed full-viewport `<canvas>` (`-z-10`, `h-[150vh]`, opaque `#07060d` fill). **200 stars
(80 on mobile)** drift slowly upward with a sine twinkle. Capped to **~30 fps**, **paused when the tab
is hidden** (`visibilitychange`), and reduced to **one static frame under `prefers-reduced-motion`**.
A scroll `yShift × −0.2` gives the field a gentle parallax.

## Compositing treatment
- **`mix-blend-screen`** on every cosmic layer → additive light over the near-black void.
- **`radial-gradient` mask** per layer (`black X% → transparent Y%`) feathers each layer's edges so
  rectangular images read as soft cosmic forms. No live `blur()` filters (all removed for performance).
- **`isolation: isolate`** on the container (see *Stacking model*).

## Reduced motion
`useReducedMotion()` gates the JS animation everywhere CSS can't reach:
- Cosmic layers render their **final static frame** — no float loops, no scroll/cursor transforms.
- Particle canvas paints **one static starfield**.
- Hero fade and card tilt are **disabled**; the cursor listener is never attached.
- The `globals.css` `prefers-reduced-motion` block additionally neutralizes all CSS animations/transitions.
- All decorative layers + the canvas are `aria-hidden`; focus order and `:focus-visible` are untouched.

## Performance contract (why it stays cheap)
- **Isolated blend group** — the 60 fps canvas no longer forces the 12 blend layers to recomposite.
- **Rasterized assets** — layers load `public/cosmic/*.avif` (≈0.73 MB total for the scene) instead of
  the raw SVGs (≈7.2 MB, galaxy alone 3.99 MB and previously loaded twice). ~10× lighter, no per-frame
  vector tessellation. `images.unoptimized: true`, so a raw `<picture>` (AVIF → WebP) does the format
  negotiation that `next/image` can't.
- **No live blur** — the `blur(120px)`/`10px`/`2px` filters are gone (gradient + masks + upscale instead).
- **Calmed canvas** — 30 fps cap, tab-hidden pause, −60% particles on mobile.
- **Lean cursor work** — one rAF-coalesced listener, fine-pointer only, driving ~8 springs (was ~28).
- **Load discipline** — `galaxy` eager, all other layers `loading="lazy"`.
- All decorative layers are `fixed`/`absolute` → **zero CLS**; LCP is the hero `<h1>` text.

## Asset pipeline (`scripts/optimize-cosmic-assets.mjs`)
Source SVGs in `SVGs/` are huge traced vectors (≈9.7 MB). The script rasterizes them to **AVIF + WebP
at two widths** into `public/cosmic/<name>-<width>.{avif,webp}` (`rsvg-convert` → `magick`, alpha
preserved). Re-run with `node scripts/optimize-cosmic-assets.mjs`. The redesign's `public/svgs/` files
map to these semantic names by byte-identity:

| Layer | semantic asset | | Layer | semantic asset |
|---|---|---|---|---|
| galaxy / nebula-glow | `galaxy` | | flower-deep | `lotus` |
| river | `dust-wave` | | footer-bloom | `peony` |
| orbital | `river` | | green-ecosystem 1 | `stream-b` |
| branch | `branch-a` | | green-ecosystem 2 | `stream-a` |
| branch-small | `petals` | | pink-particles | `sparkle` |
| trail | `trail` | | | |

## File map
| File | Role |
|---|---|
| `app/page.tsx` | Hero, pick-a-side cards, Spotify, CTF, footer; mounts `ParticleField` + `FloatingSvgs`; hero scroll-exit + card tilt. |
| `components/cosmic/floating-svgs.tsx` | The 12-layer cosmic system, all parallax/float/hover logic, isolation. |
| `components/cosmic/particle-field.tsx` | The star canvas (throttle/pause/reduced-motion). |
| `components/grain-overlay.tsx` | `PaperOverlay` — film grain (`z-50`) + low-light vignette (`z-51`). |
| `components/layout-shell.tsx` | Loader gate, `float-content` wrapper, overlays, scroll reset. |
| `app/globals.css` | Cosmic tokens, keyframes, CRT scanline, grain texture, reduced-motion block. |
| `public/cosmic/` | Rasterized AVIF/WebP assets (committed). |
| `scripts/optimize-cosmic-assets.mjs` | SVG → AVIF/WebP pipeline. |

## Verifying locally
`pnpm build && pnpm start` (or `pnpm dev`), then on the homepage: confirm the drifting stars, the
parallax depth on scroll, the cursor depth on the deep layers, the green/pink awakenings on card hover,
and the closing peony bloom at the footer. Toggle the OS "reduce motion" setting to confirm the static
fallback. `pnpm build` validates types/SSR.
