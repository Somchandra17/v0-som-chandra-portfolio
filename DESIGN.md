# DESIGN.md — som chandra portfolio

A page-by-page design reference: layout, layers, the cosmic SVG scene (names +
paths + positions), interactions, and the mobile view for every route.

> Companion docs: [`docs/MOTION_SYSTEM.md`](docs/MOTION_SYSTEM.md) covers the
> animation engine and the no-jitter rules in depth. This file is the visual /
> layout spec.

---

## Table of contents

1. [Design language & tokens](#1-design-language--tokens)
2. [Global chrome (every page)](#2-global-chrome-every-page)
3. [Z-index map](#3-z-index-map)
4. [The cosmic SVG scene (home only)](#4-the-cosmic-svg-scene-home-only)
5. [Page — Home `/`](#5-page--home-)
6. [Page — Nerdy `/nerdy`](#6-page--nerdy-nerdy)
7. [Page — Creative `/creative`](#7-page--creative-creative)
8. [Page — Galleries `/creative/clicks` & `/creative/doodling`](#8-page--galleries-creativeclicks--creativedoodling)
9. [Page — `/rebots.txt`](#9-page--rebotstxt)
10. [Cosmic asset reference (names + paths)](#10-cosmic-asset-reference-names--paths)
11. [Mobile view — global rules & breakpoints](#11-mobile-view--global-rules--breakpoints)

---

## 1. Design language & tokens

Single source of truth: [`app/globals.css`](app/globals.css) (`:root`). Components
reference tokens, never raw hex (the cosmic layer is the main exception).

**Type**
- Sans: `Space Grotesk` (`--font-sans`) — headings & body.
- Mono: `Geist Mono` (`--font-mono`) — kickers, metadata, terminal, captions.
- Display scale: `clamp(3rem, 8vw, 6rem)`; hero name uses `clamp(3.5rem, 9vw, 6.5rem)`.
- **Corners are sharp everywhere** — `--radius: 0`.

**Ink ramp (neutral spine)**

| Token | Hex | Use |
|---|---|---|
| `--ink-900` | `#0a0a0a` | page background |
| `--ink-850` | `#0e0e0e` | raised surfaces / terminal header |
| `--ink-800` | `#111111` | card background (`.paper-card`) |
| `--ink-700` | `#1a1a1a` | muted surface |
| `--ink-600` | `#2a2a2a` | borders |
| `--ink-500` | `#444444` | hairline / ring |
| `--ink-400` | `#7a7a7a` | muted text |
| `--ink-300` | `#9a9a9a` | secondary text |
| `--ink-200` | `#c4c4c4` | body |
| `--ink-100` | `#e8e8e8` | primary text |

**Per-world accents** — flipped by a `[data-world]` wrapper (`--world`):

| World | Accent | Dim | Set by |
|---|---|---|---|
| nerdy | `#7fb07f` (terminal green) | `#4f6e4f` | `app/nerdy/layout.tsx` → `data-world="nerdy"` |
| creative | `#f0c6cf` (sakura pink) | `#a98088` | `app/creative/layout.tsx` → `data-world="creative"` |

**Cosmic palette** (home ambience): grounds `--cosmic-void #07060d`, `--cosmic-deep
#0d0a18`, `--cosmic-plum #170f28`; sakura ramp `#ffe6f0 → #f0c6cf → #b85a86`;
accents `--nebula-violet #8b6fc4`, `--stardust-gold #e6c79a`, `--aurora-teal #6fb3a8`.

**Signature surface — `.paper-card`**: `bg #111`, `1px #2a2a2a` border, hover lifts
with a hard `3px 3px 0 #222` offset shadow (sticker/paper feel). Decorative motifs:
`.tape-top` (washi-tape strip), `.crt-scanlines` (static green scanlines on the
nerdy card + terminal), `.draw-underline`, `.hover-bounce`, `.hover-wiggle`.

---

## 2. Global chrome (every page)

Rendered by [`components/layout-shell.tsx`](components/layout-shell.tsx) → wraps all
routes via `app/layout.tsx`.

- **`curved-paper-bg`** — fixed solid black plate, `z-0`.
- **`PaperOverlay`** ([`components/grain-overlay.tsx`](components/grain-overlay.tsx)):
  - `.paper-texture` — fixed SVG `feTurbulence` grain, `z-50`, `mix-blend-screen`, opacity 0.22.
  - `.lowlight-burn` — fixed radial vignette + faint blue/pink corner casts, `z-[51]`.
- **Loader** ([`components/loader.tsx`](components/loader.tsx)) — `z-[200]`, see §5.
- **Tab title** — `app/layout.tsx` sets `title: "Sup? - Som 00:21"` for **all** pages
  (per-page title overrides were removed from the nerdy/creative layouts).
- **Loading gate** — content is hidden until `checked` resolves (sessionStorage
  `som-loaded`); the loader shows on first load + on hard reload, and is skipped on
  in-session client navigations.
- **SEO** — `app/sitemap.ts` (5 routes), `public/robots.txt`, JSON-LD Person, OpenGraph/Twitter.

---

## 3. Z-index map

Lowest → highest. (Cosmic layers carry their own per-layer `zIndex` inside the
fixed `z-0` FloatingSvgs container — see §4.)

| z | Element | Scope |
|---|---|---|
| `-z-10` | `ParticleField` star canvas (`h-[150vh]`) | home |
| `0` | `curved-paper-bg`, `FloatingSvgs` container | global / home |
| `2` | `EdgeBloom` edge flowers | home |
| `10` | page content (`.float-content`, `<section>`s) | all |
| `20` | hero "pick a side" cards (within content) | home |
| `30` | `ForegroundFlow` portal-seep hover ribbon (above the cards) | home |
| `40` | `BlossomField` foreground motes · `PageHeader` (sticky top bar) | home / subpages |
| `50 / 51` | grain / vignette overlays | all |
| `150` | exit hand-off tint (route swap) | home |
| `200` | Loader | all (first load) |
| `300` | gallery `StoryLightbox` | galleries |

---

## 4. The cosmic SVG scene (home only)

> The full cosmic SVG system is mounted **only on the home page**
> ([`app/page.tsx`](app/page.tsx): `<ParticleField/> <FloatingSvgs/> <BlossomField/>
> <EdgeBloom/>`). Subpages render the flat `#0a0a0a` ground + grain/vignette only.

Source of truth: [`components/cosmic/floating-svgs.tsx`](components/cosmic/floating-svgs.tsx)
(`sceneData`). Every layer is an **absolutely-positioned** `<picture>` inside a fixed
full-viewport, `overflow-hidden`, `isolation:isolate` container. Sizes/positions use
**`vw` units**, so the composition scales proportionally from desktop to phone.

Each asset loads as `<source avif>` → `<source webp>` → `<img webp>` from
**`/cosmic/<name>.<ext>`** (files live in `public/cosmic/`). A radial mask feathers
each rectangle into a soft cosmic form; compositing is **normal** (no `mix-blend` on
moving layers — that was the jitter source; see MOTION_SYSTEM.md).

### 4.1 Layer table (positioning + names + paths)

Position is CSS `top` / `left`; size is `width` = `height`. `z` is the per-layer
`zIndex`. Tier drives parallax weight (§4.2). Base opacity is the resting value.

| # | Asset (path `/cosmic/…`) | type | tone | top | left | size | z | rotate | tier | base α |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | *(none — CSS gradient)* `nebula-glow` | nebula-glow | pink | `calc(20vh - 125vw)` | `-45vw` | `250vw` | -2 | 20° | bg | 0.40 |
| 2 | `galaxy-2000.avif/.webp` | galaxy | pink | `calc(30vh - 100vw)` | `-35vw` | `200vw` | 0 | -15° | bg | 0.42 |
| 3 | `dust-wave-1400.avif/.webp` | river | pink | `calc(40vh - 75vw)` | `10vw` | `150vw` | 1 | 35° | bg | 0.26 |
| 4 | `river-1000.avif/.webp` | orbital | pink | `calc(70% - 100vw)` | `calc(60% - 100vw)` | `200vw` | 0 | -20° | bg | 0.30 |
| 5 | `branch-a-1100.avif/.webp` | branch | pink | `-60vw` | `60vw` | `100vw` | 3 | 20° | mid | 0.24 |
| 6 | `petals-1000.avif/.webp` | branch-small | pink | `20vh` | `-20vw` | `60vw` | 3 | -10° | mid | 0.20 |
| 7 | `trail-1400.avif/.webp` | trail | pink | `40%` | `10%` | `80vw` | 4 | 5° | fg | scroll |
| 8 | `lotus-900.avif/.webp` | flower-deep | pink | `-30vw` | `-30vw` | `80vw` | -1 | 45° | bg | 0.14 |
| 9 | `peony-1200.avif/.webp` | footer-bloom | pink | `calc(100vh - 45vw)` | `calc(75vw - 45vw)` | `90vw` | 5 | -25° | fg | scroll |
| 10 | `stream-b-1400.avif/.webp` | interactive-green-ecosystem | green | `calc(14vh - 35vw)` | `calc(16vw - 35vw)` | `70vw` | 0 | 10° | mid | 0.12 |
| 11 | `stream-a-1400.avif/.webp` | interactive-green-ecosystem | green | `calc(44vh - 35vw)` | `calc(6vw - 35vw)` | `70vw` | 0 | -15° | mid | 0.12 |
| 12 | `sparkle-1200.avif/.webp` | interactive-pink-particles | pink | `calc(40vh - 35vw)` | `calc(75vw - 35vw)` | `70vw` | 5 | 30° | fg | hover |

Notes:
- **Layer 1 (nebula-glow)** is a pure CSS `radial-gradient` (`NEBULA_GRADIENT`), no
  image — the soft pink→violet wash. It replaced a 3.99 MB blurred SVG.
- **Layer 2 (galaxy)** is the gravitational centre, loaded `eager`; all others `lazy`.
- **trail / peony** are scroll-driven (opacity/scale/rotate tied to `scrollYProgress`);
  peony blooms in near the bottom of the page (the "finale").
- **Composition reads roughly:** galaxy + nebula centre-left, sakura branch top-right,
  small petals mid-left, green code-streams upper/mid-left, pink sparkles upper-right.

### 4.2 Depth tiers (parallax)

Defined in `FloatingSvgItem`. Two inputs, both transform-only and spring-smoothed:

| tier | layers | scroll × | mouse depth (px) |
|---|---|---|---|
| `bg` | nebula, galaxy, river, orbital, flower-deep | 0.06 | ±7 |
| `mid` | branches, green ecosystems | 0.13 | ±14 |
| `fg` | trail, footer-bloom, pink particles | 0.22 | ±22 |

- **Scroll parallax**: `y = scrollY × multiplier × -1` (springed).
- **Mouse depth** ("feel depth, not follow cursor"): tiny per-tier offset, heavily
  damped (`damping 60, stiffness 90`), alternating direction per layer. **Disabled on
  touch / coarse pointers** (`matchMedia("(pointer: fine)")`) and under reduced motion.

### 4.3 Hover "awakening" (which SVGs respond)

Hovering a home card **dims the backdrop and lifts that side's signature SVG to a foreground
glowing ribbon** (`components/cosmic/foreground-flow.tsx`, z-30) that floats *above the cards* and
flows + glows; the background copy of that asset recedes so it isn't doubled:

- **Hover nerdy** → foreground **green stream** (`stream-b`, mirrored) pools into the **bottom-left
  corner** with a soft green glow; the bg green ecosystems recede (×0.4), galaxy stays lit (×1.1),
  everything else dims ×0.22.
- **Hover creative** → foreground **pink water** (`dust-wave`) flows through the **bottom-right
  corner** with a soft (dimmed) glow; the bg river recedes (×0.4), pink particles drop to a 0.3
  accent, galaxy stays lit, the rest dims ×0.22.
- Plus **`BlossomField`** ([`components/cosmic/blossom-field.tsx`](components/cosmic/blossom-field.tsx))
  emits drifting motes — green on nerdy, pink on creative — **only while hovering**
  (canvas `z-[1]`, `globalCompositeOperation:"lighter"`). On the 2nd-click exit it
  fires an upward burst.

### 4.4 Edge blooms (scroll)

[`components/cosmic/edge-bloom.tsx`](components/cosmic/edge-bloom.tsx) — flowers that
bloom in from the viewport edge as you reach it (`z-[2]`, normal compositing, radial
mask + brightness bake):

| edge | asset (`/cosmic/…`) | left | size | rotate | trigger (scrollYProgress) |
|---|---|---|---|---|---|
| top | `petals-1000` | 2% | 24vw | -12° | 0 → 0.07 |
| top | `sparkle-1200` | 73% | 22vw | 15° | 0 → 0.07 |
| bottom | `petals-1000` | 74% | 26vw | -6° | 0.92 → 1 |

### 4.5 Star field

[`components/cosmic/particle-field.tsx`](components/cosmic/particle-field.tsx) — fixed
`-z-10` canvas, `h-[150vh]` with slow scroll drift. **200 stars desktop / 80 mobile**,
capped at ~30 fps, twinkle + slight upward drift, occasional pink (`240,198,207`).
Pauses entirely when the tab is hidden; static single frame under reduced motion.

---

## 5. Page — Home `/`

File: [`app/page.tsx`](app/page.tsx) (`min-h-screen bg-[#07060d]`). Content gates on
`loading` so it enters over the already-built cosmic scene.

### Loader hand-off ([`components/loader.tsx`](components/loader.tsx))
1. Breathing **aura** — `60vmax` radial pink→violet gradient, scale/opacity loop.
2. Two mono status lines + pulsing dot + progress dots.
3. **Name reveal** — "som." de-blurs in with a `26rem` glow blooming behind it.
4. **Soft scale-dissolve** hand-off (scale 1.04 + fade, 0.7 s) → reveals the home.
   Click / any key skips; reduced motion skips instantly.

### Section stack (all content `z-10`)
1. **Hero** (`min-h-screen`, centered, scroll-fades via `heroOpacity`/`heroY`):
   - kicker `oh hey, you found this page`
   - **name** `i'm som.` — clickable `<button>` toggling `som` ⇄ `0xs0m` (mono+green)
     via `TextMorph` (per-character blur morph).
   - **cycling tagline** — `PretextHighlight` (pretext-measured highlight pill, 15
     lines, 3 s cycle). **Scales to fit** narrow widths instead of clipping.
   - auto-cycling **fun fact** (mono, 2.2 s).
   - **"pick a side"** kicker → **2 cards** (`grid-cols-1 sm:grid-cols-2`): the nerdy
     side (terminal/CRT, green) and the unhinged side (pink). 3D tilt on fine pointers.
   - hover hint line + **scroll cue** (bottom).
2. **Music zone** — Spotify: now-playing/last-played, top artists (2-up grid on
   mobile), all-time tracks, recently played. Each card links out; graceful when empty.
3. **Terminal** — `MusicDCTF` (see §5.1) with a static suspended-depth green glow.
4. **Socials** — GitHub / LinkedIn / Email / somm.tf.
5. **Footer** — `som chandra, {current year}` (dynamic).

### Navigation interaction (2-click, desktop + mobile)
- **1st click** on a card → **arms** that side: matching SVGs awaken, name flips
  (nerdy), and the **"pick a side" kicker pops to an accent-lit, glowing
  `click again to open →`** (green for nerdy, pink for creative). No navigation.
- **2nd click** (same card) → exit bloom (scene zooms+blooms to opacity 0, ~0.76 s) +
  a late full-screen tint, then routes to `/nerdy` or `/creative`.
- Desktop: arming is hover-gated (leaving the card resets it). Touch: arm persists.

### 5.1 MusicD CTF terminal — [`components/musicd-ctf.tsx`](components/musicd-ctf.tsx)
A client-side path-traversal puzzle styled as a sketchy music daemon. Window chrome +
"not a terminal person?" helper + starter buttons + 5-level hint system + scrollable
output (`h-80`) + input row. **Win:** `load ../../flag.txt` → escapes `songs/` →
unlocks the playlist view. `cat /flag.txt` is intentionally blocked.

### Home — mobile view
- Hero cards **stack** to one column; mouse parallax + 3D tilt **off** (coarse pointer).
- Tagline drops to 18 px and **scales-to-fit** so long lines never clip.
- Hero vertical rhythm tightens (`mb-7/md:mb-10`, `mt-6/md:mt-8`, `mt-10/md:mt-14`,
  `mt-9/md:mt-12`); the absolute **scroll cue is hidden** (`hidden sm:flex`).
- Spotify artist cards go 2-up (`w-[calc(50%-0.5rem)]`); track/recent rows stack.
- Star field drops to 80 particles. `overflow-x:hidden` guard prevents the `vw`
  cosmic layers from creating a sideways scrollbar.

---

## 6. Page — Nerdy `/nerdy`

Files: [`app/nerdy/layout.tsx`](app/nerdy/layout.tsx) (`data-world="nerdy"` → green
accent) + [`app/nerdy/page.tsx`](app/nerdy/page.tsx). No cosmic scene — flat dark +
grain. Max width `max-w-4xl`.

Order: **sticky `PageHeader`** (back-home + `som / nerdy` breadcrumb) → now-playing
(if active) → **About** (bio + "link bunker" 2-col + achievement stat chips + **live
`github, lately` stats**, see §6.1) → **Experience** (timeline cards) → **Projects**
(2-col, 5 cards) → **Skills** (2-col tag groups) → **Certs + Achievements** (2-col) →
footer. Entrances via `whileInView` fade-up.

**Projects (current):** Burp AI Agent · TrashDroid · **TrashiOS** · TrashRecon ·
**TrashFrame**. (RootAppChecker removed.)

### 6.1 GitHub stats — [`components/github-stats.tsx`](components/github-stats.tsx)
Live block titled **`github, lately`** (3 `.paper-card` chips): **commits this year ·
public repos · followers** — **deliberately no star counts**. Data via SWR from
[`app/api/github/route.ts`](app/api/github/route.ts) (public GitHub API, cached
1 h, optional `GITHUB_TOKEN` for higher limits, fails soft → hides if unavailable).

### Nerdy — mobile view
- All 2-col grids (link bunker, projects, skills, certs/achievements) → **1 column**.
- Stat chips and GitHub chips wrap (`flex-wrap`). Header stays sticky and compact.
- Experience header row stacks (`flex-col md:flex-row`); body text `text-sm md:text-base`.

---

## 7. Page — Creative `/creative`

Files: [`app/creative/layout.tsx`](app/creative/layout.tsx) (`data-world="creative"` →
pink accent) + [`app/creative/page.tsx`](app/creative/page.tsx). Max width `max-w-5xl`.

Order: **`PageHeader`** (`som / creative`) → pink **"some typos are intentional"**
disclaimer → now-playing → **split-screen** (`grid lg:grid-cols-2`): left = `clicks`/
`doodling` nav with a floating image-pair reveal on hover; right = bio with **wavy
intentional typos** (hover a squiggle → correction + roast tooltip) → **Thoughts**
cards → footer (with a second pink note).

Section heights are pre-measured with **pretext** (`measureText`) for stable
containers across the blur cross-fade. Nav is 2-click: 1st selects (reveals preview),
2nd opens the full gallery.

### Creative — mobile view
- Split-screen collapses to **stacked** (`grid-cols-1`, then `lg:grid-cols-2`); the
  bio sits under the nav. Floating preview images shrink (`w-20 h-20 md:w-24`).
- Disclaimer/footer pink notes float right and clear. Thought cards full-width.

---

## 8. Page — Galleries `/creative/clicks` & `/creative/doodling`

Both render [`components/gallery-page.tsx`](components/gallery-page.tsx) (`GalleryPage`);
thin route wrappers in `app/creative/clicks/page.tsx` & `…/doodling/page.tsx`. Data is
**data-driven** from [`data/gallery.json`](data/gallery.json) via
[`lib/creative-data.ts`](lib/creative-data.ts) (82 photos, 20 sketches).

Layout: `PageHeader` → back/sibling-nav + **contact-sheet** info panel (archive count,
viewer hint) → **sort controls** (date/location, asc/desc — **clicks only**;
`showSort={false}` for doodling) → **masonry grid** (`columns-1 sm:columns-2
lg:columns-3`, `break-inside-avoid`) → footer. Cards lazy-render
(`IntersectionObserver`, initial 42, +30) with a manual "load more".

**`PhotoCard`** — image with index badge; hover (or mid-viewport on touch) reveals a
pretext-sized caption/location/date note; Varanasi frames get a pink ring/glow.

**`StoryLightbox`** (`z-[300]`) — full-screen viewer: drag / arrows / thumbnail rail,
keyboard (Esc/←/→), body-scroll lock, "entry NNN / total" + frame counter, side panel
with title/meta/story + a progress rail. (Hooks run before the `if (!item)` guard so
it's `rules-of-hooks`-safe.)

### Galleries — mobile view
- Grid → **single column**; lightbox stacks (image on top, info below;
  `lg:grid-cols-[1.18fr_360px]` only on large). Drag-to-advance + tap targets sized
  for touch; sort/info panels collapse to one column.

---

## 9. Page — `/rebots.txt`

File: [`app/rebots.txt/page.tsx`](app/rebots.txt/page.tsx). A joke easter-egg page
(not the real robots file — that's `public/robots.txt`). `PageHeader` + a single
`.paper-card` with a `<pre>` "chaotic terminal" robots-style text (HTB writeup links,
real `Sitemap: https://www.somm.tf/sitemap.xml`).

**Mobile:** `<pre>` scrolls horizontally inside its card (`overflow-x-auto`); the page
itself never overflows.

---

## 10. Cosmic asset reference (names + paths)

All under **`public/cosmic/`**, served at **`/cosmic/<name>.<ext>`**. Every base name
ships **AVIF + WebP** at **two resolutions** (a high-res used in the scene + a smaller
variant available for lighter contexts). Loaded via `<picture>` (AVIF → WebP → img).

| Base name | Resolutions | Role in scene |
|---|---|---|
| `galaxy` | `-2000`, `-1000` | galaxy core (layer 2, eager) |
| `nebula` | `-1600`, `-900` | *(available; scene uses a CSS gradient for the wash)* |
| `dust-wave` | `-1400`, `-800` | "black river" current (layer 3) |
| `river` | `-1000`, `-600` | pink orbital ring (layer 4) |
| `branch-a` | `-1100`, `-600` | large sakura branch (layer 5) |
| `branch-b` | `-1200`, `-600` | *(alt branch, available)* |
| `petals` | `-1000`, `-600` | small petal branch (layer 6) + edge blooms |
| `trail` | `-1400`, `-800` | scroll-energy trail (layer 7) |
| `lotus` | `-900`, `-500` | deep purple flower (layer 8) |
| `peony` | `-1200`, `-600` | footer bloom finale (layer 9) |
| `stream-a` | `-1400`, `-800` | green code ecosystem (layer 11) |
| `stream-b` | `-1400`, `-800` | green code ecosystem (layer 10) |
| `sparkle` | `-1200`, `-700` | pink particles (layer 12) + top edge bloom |

Other public assets: `public/favicon.ico`, `public/logo.png` (OG image),
`public/robots.txt`, `public/creative/pictures/clicks/*` (82), `…/sketch/*` (20).

---

## 11. Mobile view — global rules & breakpoints

**Tailwind breakpoints:** `sm` 640 px · `md` 768 px · `lg` 1024 px.
JS breakpoint helpers: `isCompactSpotify` & the star-field cap both use
`max-width: 767px`.

Global mobile behaviour:
- **No horizontal scroll** — `html, body { overflow-x: hidden }` guards the `vw`-based
  cosmic layers (`app/globals.css`).
- **Pointer-gated motion** — mouse parallax (cosmic depth) and card 3D tilt only run on
  `(pointer: fine)`; touch devices get the static composition.
- **`prefers-reduced-motion`** — loader skips, cosmic loops/blooms settle, star field
  renders one static frame, smooth-scroll off (global media query).
- **Grids collapse** — every multi-column grid is `grid-cols-1` / `columns-1` first,
  widening at `sm`/`md`/`lg`. Galleries: 1 → 2 → 3 columns.
- **Performance** — rasterized AVIF/WebP (not SVG), GPU-promoted transform-only
  animations, hover-gated canvases idle on touch, 30 fps star cap, tab-hidden pause.

Verified clean (0 px horizontal overflow, no console errors) at 320 / 360 / 390 px and
desktop across every route.
