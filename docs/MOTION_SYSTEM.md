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
      │     retuned into FAR (dim, soft) / MID (lifted, firmer mask) planes
      ├ <ForegroundFlow>    fixed   z-30      ← HOVER: portal-seep ribbon, above the cards
      │   one signature SVG per side (green stream / pink water) lifts over the content
      ├ <BlossomField>      canvas  fixed  z-40      ← FOREGROUND: motes occlude content
      │   hover/armed/exit petals + an idle trickle; tone-leans on engagement
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

The 12 layers are retuned into two depth planes: **FAR** (nebula, galaxy, flower-deep —
dimmed ×0.7, softer masks → distant haze) and **MID** (river, orbital, branch, branch-small,
green-ecosystem — lifted ×1.15, tighter masks so silhouettes hold → the reachable middle).
Parallax spread widened (mouse 8/16/26px, scroll 0.06/0.14/0.28×) so the plane differential
reads as depth. The nearest plane (FOREGROUND) is carried by the BlossomField canvas above.

## Motion systems

1. **Scroll parallax (depth via speed).** `useScroll().scrollY` → `useSpring(damping 50, stiffness 300)`
   → each layer's `y = scrollY × parallax × −1`. Foreground layers (`parallax` 1.2–1.5) slide fast
   against the scroll; deep background (0.1–0.2) barely moves → parallax depth.
2. **Cursor depth parallax.** A single `mousemove` listener (rAF-coalesced, `(pointer:fine)` only)
   normalizes the cursor to −0.5…0.5; each layer offsets by `cursor × windowWidth × depth`, springed.
   **Only the perceptible layers (`depth ≥ 0.08`: nebula, galaxy, river, flower-deep) are mouse-driven** —
   the rest are static on the cursor axis, so a handful of springs run on move instead of 24.
3. **Continuous motion — per-layer _signatures_.** Each `type` gets a distinct, transform-only
   loop on the innermost div (no opacity/filter), so the planes read as separate living depths
   instead of one uniform wobble:
   - **galaxy** — a continuous full spin (`rotate +360°`, ~200 s linear) + faint scale breathe; the
     gravitational anchor actually *turns*.
   - **orbital** (pink ring) — continuous counter-spin (`rotate −360°`, ~150 s), opposite the galaxy,
     so the two rotations read as separate depths.
   - **branch / branch-small** — wind sway *hinged at the attach corner* (`transformOrigin` top-right /
     top-left), not a center pivot; petals flutter lighter and quicker.
   - **river / green-ecosystem** — flow along their axis (sustained x/y drift) — current / streaming data.
   - **nebula-glow / flower-deep** — slow breathe + positional / rotation drift — atmospheric.
   Durations spread ~26–200 s and phases stagger by index so no two planes ever sync. A per-`type`
   `transformOrigin` (corner for branches, center for the rest) is what turns a center wobble into a
   hinged sway or a centered spin.
4. **Mount reveal.** One-shot fade + scale + rotate to target on mount, eased `cubic-bezier(0.16,1,0.3,1)`,
   opacity ramp 4–15 s depending on layer.
5. **Scroll-driven specials.** `trail` translates `−20% → 20%` with an opacity pulse; `footer-bloom`
   scales `0.5 → 1.2`, fades `0 → 0.9`, and rotates as page `scrollYProgress` runs `0.7 → 1` — the
   closing peony bloom.
6. **Hover awakenings.** `hoverSide` (`creative` | `nerdy`, lifted from the pick-a-side cards) dims
   the backdrop and lifts that side's **signature SVG to the foreground** (see *Foreground flow*),
   receding its background copy (`river` / `green-ecosystem` ×0.4) so the texture isn't duplicated;
   the galaxy stays lit as a neutral anchor on both sides.

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

## Foreground mote tier (`components/cosmic/blossom-field.tsx`, z-40)

The single structural change that turns the scene from a flat backdrop into an
immersive space: the petal canvas was bumped from `z-1` to `z-40`, so its motes
now render **in front of** content (card edges, gaps) — real occlusion, the cue
the brain reads as depth. The canvas keeps its one 2D context, sprite-cached
blobs, `globalCompositeOperation = "lighter"`, and `prefers-reduced-motion` →
`null`. Beyond the z-bump it also gained, to support the always-on idle trickle:

- **An always-on idle trickle.** The loop no longer self-stops when no side is
  engaged — while the tab is visible it keeps a sparse foreground alive. It runs
  at **20fps when idle** and steps up to the full **60fps when active**
  (hover / armed / exit), so the resting state stays cheap.
- **Its own tab-hidden visibility pause** (added here — the canvas previously had
  no reason to pause because it only ran during hover). With the trickle always
  running, a `visibilitychange` guard stops the loop when the tab is hidden and
  resumes it when visible.
- **Off-screen recycling.** Foreground motes that drift past the viewport edge are
  recycled rather than accumulating, keeping the live count bounded.

**Two mote streams share the one loop:**
1. *Hover petals* (background behaviour, retained) — spawned on hover, ambient alpha.
2. *Foreground motes* (`fg: true`) — sparser, slower, brighter; drift along viewport edges
   and section gaps (never parked over text). Carry the largest parallax of any tier.

**Mote lifecycle:** foreground motes **recycle when they drift off-screen** (re-seeded
to keep the density steady), while the ARM ripple motes are short-lived and **fade out
to settle** (~0.6s) rather than recycling.

**Intensity ladder** (inherits existing `hoverSide` / `armedSide` / `exiting` — no new state):

| State | FG density | FG opacity | Behaviour |
|---|---|---|---|
| IDLE | ~6 @ 20fps | 0.3 | trickle; drifts across edges/gaps; "living space" baseline |
| HOVER | ~16 | 0.45 | tone-leans to hovered side; concentrates near active card |
| ARMED (1st click) | ~22 | 0.55 | + ~10-mote ripple from clicked card (~0.6s settle); locks tone |
| EXIT (2nd click) | burst +30 | →0.85 | existing radial burst now renders in front of content; motes grow faster (`size += 0.7`) — depth inverts: content recedes, foreground surges |

**Scroll thinning:** foreground density scales down over text-dense zones (music ~0.4×,
terminal ~0.3×) and restores in gaps — readability-first. Uses the existing single
`scrollY` reader; no new listener.

**Guardrails:** FG motes never fully obscure text (≤0.55 opacity, 0.85 only at the transient
exit peak); no mote covers a whole card face (size 4–12px + burst 16–46px).

## Foreground flow — the "portal-seep" hover (`components/cosmic/foreground-flow.tsx`, z-30)

The pick-a-side cards are doors; hovering one lets *the world behind it seep out over reality*.
A dedicated `pointer-events-none` overlay — rendered **outside** the `z-0` cosmic group, at
**`z-30`** (above the cards at `z-20`, below the grain at `z-50`) — lifts **one signature SVG per
side above the content** and flows + glows over it, then recedes on leave. Committing (2nd click)
lets it **surge outward with the exit bloom** (`scale → 1.5` + fade) — *seep → flood → enter*.

- **Mounts only while a side is active** (`hoverSide`, or `exiting`) via `AnimatePresence` → the
  overlay is **empty at idle** (zero added per-frame cost). Driven by the existing `hoverSide` /
  `exiting` props from `app/page.tsx`; no new global state.
- **Per side:** `nerdy` → `stream-b` (green, mirrored), masked to its foliage and pooled into the
  **bottom-left corner**; `creative` → `dust-wave` (water), flowing through the **bottom-right
  corner**. The matching **background copy recedes** (`floating-svgs.tsx` dims `river` /
  `green-ecosystem` ×0.4) and the rest of the scene dims, so the foreground reads as the hero.
- **Two motion personalities** (reusing the scene's own easings): `nerdy` drifts tighter / more
  linear / faster (`[0.37,0,0.63,1]`, ~24 s); `creative` undulates wider / slower
  (`[0.45,0.05,0.55,0.95]`, ~34 s) — precise hacker vs unhinged artist.
- **Glow** is a separate `mix-blend-screen` radial-gradient aura (green / sakura-pink) with a
  **scale-only** breathe — additive light over the dark scene, **never an animated blur/box-shadow**.
- **Structure mirrors the proven nesting:** positioning wrapper (faint fg-tier cursor parallax) →
  one-shot opacity/scale reveal (settles) → static-opacity holder → **transform-only** flow loop on
  a masked, GPU-promoted child → `<picture>`. The mask crops `stream-b`'s corner watermark out.
- **Contract:** only `transform` + `opacity` animate; mount-on-hover keeps idle cost flat; gated by
  `motionEnabled`, so reduced motion shows a single static frame (no loop, no parallax). On touch the
  1st tap arms the side, so the ribbon appears on tap.

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
| `components/cosmic/foreground-flow.tsx` | The portal-seep hover overlay (z-30): per-side ribbon + glow lifted above the content. |
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
