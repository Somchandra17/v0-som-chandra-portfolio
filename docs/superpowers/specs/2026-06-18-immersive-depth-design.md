# Immersive Depth — Homepage Foreground Layer

**Date:** 2026-06-18
**Branch:** `feat/background-depth`
**Scope:** Homepage only (`app/page.tsx` + `components/cosmic/*`). `/nerdy` and `/creative` untouched.

## Problem

The homepage background reads as a flat wallpaper, not an immersive layered space. Diagnosed via Playwright screenshots (hero idle/hover, scroll positions, mobile) and code analysis:

1. **Zero occlusion.** Every decorative layer lives at `z-0` or below; all content floats at `z-10` over the top. Nothing ever crosses in front of the content. The brain reads depth from occlusion ("thing A is closer because it covers thing B"), and this scene has none — so it reads as a backdrop regardless of how many parallax tiers exist in code.
2. **Uniformly low opacity + heavy radial masking** dissolve every asset (galaxy, rivers, branches) into the same indistinct soft blob. There is no silhouette for parallax to grab, so movement is not legible as depth.
3. **Sub-perceptual parallax amplitudes** (mouse 7–22px, scroll 0.06–0.22×). Most tiers move below the threshold where depth would be *felt*.

The existing performance architecture is excellent and must be preserved: GPU-layered, transform/opacity-only, isolated blend group, 30fps-capped hover-gated canvas, full `prefers-reduced-motion` support. The fix is **structural + a retune** — not a motion-system rewrite.

## Goal

Make the homepage read as **immersive, layered depth** via a foreground tier that occludes content, atmospheric-perspective separation of the existing tiers, and parallax spreads widened above the perceptual threshold — while keeping CPU flat (~0 delta) and introducing no jitter.

## Decisions (locked with user)

- **Depth feel:** Immersive occlusion — a sparse foreground of delicate motes/petals/dust that passes *in front of* card edges and gaps (pointer-events:none, ≤~0.55 opacity), thin enough that text stays fully readable.
- **Foreground rendering:** Reuse the existing `BlossomField` canvas (2D context, sprite-cached blobs, 60fps cap, hover-gated, tab-hidden pause). No new DOM nodes, no new animation system.
- **Scope:** Homepage only.
- **Idle behavior:** Idle trickle of ~6 motes @ 20fps (half the hover rate) — cheap, alive, sells "you're inside a space."
- **First-click (ARM):** Soft ~10-mote ripple emanates from the clicked card and settles in ~0.6s.

## Design

### 1. The core fix — a foreground tier that crosses content

Add **one new structural element**: a foreground mote layer drawn on top of content.

```
  YOU
   │
   ▼
  drift motes / petal fragments    z-40  ← FOREGROUND (crosses card edges + gaps)
     │  occlusion happens here  │
  ─────────────────────────────────────
  cards / text / terminal          z-10  CONTENT (untouched)
  mid florals (branch, river)      z-0   MID
  nebula / galaxy (dimmed, softer) z-10  FAR
  starfield                        -z-10 VOID
```

Implementation: the existing `BlossomField` canvas gets `z-index` bumped from `z-[1]` to `z-[40]`, and a **new foreground sub-stream** runs inside the same RAF loop, drawn last so it composites on top. Same canvas, same sprite cache, same throttle/pause/reduced-motion contract.

### 2. Atmospheric perspective — separate the existing tiers by brightness + mask softness

The code has 12 parallax tiers; they read flat because opacity is uniformly low and masks dissolve all silhouettes. Retune into three legible planes:

- **FAR** (nebula-glow, galaxy, flower-deep): dim further (existing base α × ~0.7), slightly softer masks. Reads as distant haze.
- **MID** (branch, branch-small, river, orbital): lift slightly (× ~1.15), tighten masks so silhouettes hold. The "reachable" middle.
- **FOREGROUND** motes: brightest, sharpest, largest parallax. Clearly nearest.

Depth-of-field is **faked via opacity + mask softness only** — no live `blur()` filters (would break the perf contract).

### 3. Parallax amplitudes — widen the inter-tier spread

Keep max movement modest (no jitter) but make the *differential* between planes obvious:

| Plane | Mouse parallax | Scroll parallax |
|---|---|---|
| FAR | ~8px | ~0.06× |
| MID | ~16px | ~0.14× (close to current) |
| FOREGROUND | ~26px | ~0.28× |

Existing rAF-coalescing and spring smoothing (`damping 50–60, stiffness 90–300`) stay exactly as-is.

### 4. Interaction model — an intensity ladder

The scene "breathes" up and down with engagement. Each step increases mote density, brightness, and parallax spread. The foreground inherits and amplifies the **existing** states (`hoverSide`, `armedSide`, `exiting`, `scrollYProgress`, cursor) — **no new event listeners, no new state machine**.

| State | Foreground density | Foreground opacity | Behavior |
|---|---|---|---|
| **IDLE** | ~6 motes | 0.3 | 20fps trickle, drift along viewport edges + section gaps, never parked over text |
| **HOVER** | ~16 motes | 0.45 | shifts toward hovered tone; concentrates near active card; brightness ×1.3; parallax widens |
| **ARMED** (click #1) | ~22 motes | 0.55 | + soft ~10-mote ripple from clicked card (~0.6s settle); foreground locks to armed color — occlusion reads strongest |
| **EXIT** (click #2) | burst +30 | →0.85 | existing 30-mote radial burst now renders in *front of* content; motes accelerate + grow faster (`size += 0.7`) for ~0.4s — depth inverts: content recedes while foreground surges |

#### Two continuous axes

- **CURSOR MOVE** (`pointer:fine` only, existing rAF-coalesced listener): foreground motes get the **largest cursor parallax of any tier (~26px)** — they track the cursor more than anything else, the "I could touch this layer" cue.
- **SCROLL**: foreground carries the **largest scroll parallax (~0.28×)**; motes **thin out over dense content** (music zone, terminal) and **re-densify in gaps** — readability-first, driven off the existing single `scrollYProgress` reader.

#### Motion language

- **Easing:** every depth transition uses the existing `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) — the site's native reveal curve.
- **Timings:** hover shifts ~0.5s; armed commit ~0.4s; exit 0.7s — match existing opacity transitions.
- **Directional logic:** creative = upward-rising pink petals; nerdy = more-horizontal green leaves (inheriting BlossomField's existing drift vectors).

### 5. Restraint guardrails (what the depth will never do)

- Foreground motes never fully obscure text — max opacity ~0.55 (0.85 only at the transient exit peak), always sparse.
- No mote covers a whole card face — size capped well below card dimensions.
- Foreground thins over text-dense zones — readability wins over spectacle.
- Click ripples are subtle and short-lived — never a flash/bang.
- Everything pauses on tab-hidden and disables under `prefers-reduced-motion` (foreground returns `null`).

## Performance contract (why CPU stays flat)

The design is engineered so the delta is ~0. It honors every rule in `docs/MOTION_SYSTEM.md`:

| Rule | How this design keeps it |
|---|---|
| One canvas, one RAF | Foreground motes run inside BlossomField's *existing* loop — no second animation system |
| Hover-gated (idle cost = 0 baseline) | Idle trickle is ~6 motes @ 20fps — negligible; full density only on hover/armed/exit |
| 60fps cap, tab-hidden pause | Inherited unchanged from BlossomField |
| No live blur/blend on moving layers | Foreground uses `globalCompositeOperation = "lighter"` (already present) — no CSS filter |
| Transform/opacity only | All motion is canvas draws; no DOM layout/paint thrash |
| Reduced motion | Foreground gated by `prefersReduced`, returns `null` exactly like BlossomField today |
| One scroll reader | Foreground density uses the existing `scrollYProgress`; no new listener |

No new dependencies. No new DOM nodes. No new composited layers.

## Files touched (homepage scope only)

| File | Change |
|---|---|
| `components/cosmic/blossom-field.tsx` | Add foreground sub-stream + canvas `z-[1]` → `z-[40]`; sparser/slower mote config; tone-shift on hover/armed; ARM ripple spawn; exit acceleration; idle trickle @ 20fps |
| `components/cosmic/floating-svgs.tsx` | Retune opacity per plane (FAR dim ×0.7 / MID lift ×1.15); tighten mid-tier masks; widen tier parallax spread to the values in §3 |
| `app/globals.css` | Optional token for foreground opacity (no structural change) |
| `docs/MOTION_SYSTEM.md` | Document the new foreground tier + updated stacking model + interaction ladder |

## Verification

- `pnpm build && pnpm start` (or `pnpm dev`), homepage only.
- Confirm: foreground motes drift in front of card edges/gaps (occlusion); tiers separate into FAR/MID/FG by brightness; parallax spread is perceptible; tone shifts on hover; ARM ripple on first click; exit burst blooms in front of content.
- Confirm CPU stays flat: idle trickle negligible; tab-hidden pauses; reduced-motion returns static frame.
- Playwright re-capture (idle, hover-nerdy, hover-creative, ARM, exit, scroll positions) to verify the before/after visually.
- `/nerdy` and `/creative` unchanged.

## Out of scope

- `/nerdy` and `/creative` depth treatment (could be a follow-up pass).
- New assets (reuses existing cosmic AVIF/WebP + existing sprite blobs).
- Any change to the loader, layout shell, or API routes.
