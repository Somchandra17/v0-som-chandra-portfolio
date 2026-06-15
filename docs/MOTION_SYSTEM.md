# Cosmic Sakura — Motion & Component System

The homepage (`app/page.tsx`) is a scroll experience: *a software engineer drifting
through a digital universe*. This documents the motion system, components, asset usage, and
performance contract. Scope is **homepage only** — `/nerdy` and `/creative` are untouched and
deliberately stay terminal/brutalist as the contrast to the cosmic creative side.

## Concept: "two worlds, one night sky"
The homepage is the shared cosmic night. "Pick a side" is the fork — **nerdy = lit green
terminal** (CRT, code), **creative = cosmic darkroom** (peony, petals, pink glow). The cosmos is
the connective tissue; sakura blooms toward the creative side.

## The scroll journey (5 stages, on existing content)
1. **Arrival** — hero `i'm som.` over a faint galaxy + sakura branch, ambient petals/stars, cursor depth.
2. **The fork** — pick-a-side cards: nerdy CRT code backdrop vs creative peony that blooms on hover.
3. **The soundtrack** — Spotify sections drift over stardust streams + petals.
4. **The engineer's playground** — the galaxy emerges behind the `musicd-ctf` terminal.
5. **Convergence** — a single peony blooms behind the contact links; the intentional ending.

## Tech stack & division of labor
- **Lenis** — smooth scroll (the sole scroll *writer*). Mounted in `SmoothScrollProvider`.
- **GSAP + ScrollTrigger** — scroll-linked scrubs & parallax (the sole scroll *reader*). Driven by
  `gsap.ticker` → `lenis.raf` (one loop). `lenis.on('scroll', ScrollTrigger.update)` keeps scrubs in sync.
- **Framer Motion** — component reveals, hover, the name-morph, the convergence bloom.
- **Canvas 2D** — the particle field. **No Three.js** (not needed; cheaper, lighter).

The hero scroll-exit was migrated from Framer `useScroll` to a single GSAP scrub so there's exactly
one scroll authority — no Lenis/Framer jitter.

## Components (`components/`)
| File | Role |
|---|---|
| `motion/smooth-scroll-provider.tsx` | Lenis + GSAP wiring. Client-only, lazy-imports the libs. **Off entirely under `prefers-reduced-motion`.** Exposes `getLenis()` (LayoutShell routes its route-change scroll reset through it). |
| `cosmic/particle-field.tsx` | One fixed full-viewport canvas: petals + stars + dust. DPR≤2, tab-hidden pause, mobile count −60%, init deferred to `requestIdleCallback`, reduced-motion → one static frame. |
| `cosmic/parallax-layer.tsx` | Reusable depth wrapper: outer = scroll scrub, inner = cursor parallax (`gsap.quickTo`). Reduced-motion → passthrough. |
| `cosmic/sakura-asset.tsx` | `<picture>` AVIF→WebP→img wrapper. `COSMIC_ASSETS` maps name→widths. `priority` for above-fold. |

**Stacking model (homepage):** `cosmic-bg` gradient `z-0` (fixed) → galaxy/branch parallax `z-1/2`
→ particle canvas `z-5` (fixed) → content sections `z-10`. Section/card backdrops use
`isolate` + a `-z-10` child so decoration sits behind text without restructuring content.

## Asset usage
Source SVGs in `SVGs/` are huge traced vectors (≈9.7 MB). They are **rasterized to AVIF + WebP at
two widths** into `public/cosmic/` by `scripts/optimize-cosmic-assets.mjs` (≈3.4 MB total, ~10×
smaller, alpha preserved). Re-run with `node scripts/optimize-cosmic-assets.mjs`.

| Asset | Where | Treatment |
|---|---|---|
| `galaxy` | hero (faint) + behind CTF (emerges) | `animate-galaxy-spin`, violet glow, radial mask |
| `branch-a` | hero corner | parallax + cursor depth |
| `peony` | creative card (hover bloom) + convergence finale | scale/opacity bloom, sakura glow |
| `stream-a`, `trail` | behind music | parallax, `blend-screen`, edge-fade mask |
| petals/stars/dust | everywhere | procedural canvas (not images) |

## Design tokens (`app/globals.css`)
Cosmic layer added without touching the ink spine: `--cosmic-void/deep/plum`, `--sakura-100…600`
(anchored on the existing `--accent-creative`), `--nebula-violet/--stardust-gold/--aurora-teal`,
and `--glow-*` channels. Utilities: `cosmic-bg`, `cosmic-layer`, `glow-*`, `drop-glow-*`,
`blend-screen/lighten`, `mask-fade-x/y/radial`, `animate-twinkle/cosmic-float/cosmic-drift/cosmic-glow/galaxy-spin`.

## Performance contract (targets Lighthouse 90+)
- **LCP = hero `<h1>` text** (server-rendered, `display:swap`); galaxy sits behind it, never outranks it.
- Motion libs **client-only + dynamically imported** → off the server bundle / initial chunk.
- Particles **idle-deferred**, **paused** when the tab is hidden, DPR capped at 2, **−60% on mobile**.
- Below-fold assets `loading="lazy"`; transform/opacity only; `will-change` only while animating.
- All decorative layers are fixed/absolute → **zero CLS**.
- Nested scroll (the `musicd-ctf` terminal) carries `data-lenis-prevent`.

## Accessibility
- `prefers-reduced-motion`: no Lenis, no parallax, particles render one static frame, hero scrub skipped.
- All decorative layers + the canvas are `aria-hidden`; focus order and `:focus-visible` ring preserved.
- Existing keyboard interactions (name toggle, CTF terminal) unchanged.

## Verifying locally
`pnpm dev`, then scroll the homepage: smooth scroll, parallax depth, drifting petals, the galaxy
behind the terminal, the closing peony bloom. Toggle OS "reduce motion" to confirm the static
fallback. `pnpm build` validates types/SSR.
