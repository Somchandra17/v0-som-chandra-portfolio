# Portal-Seep Hover — foreground flow overlay (home only)

## Overview

On the home hero, the two cards ("the nerdy side" / "the unhinged side") are a literal
*pick a side*. Today, hovering a card only **brightens** the matching background cosmic
layers (opacity-only "awakening" in `components/cosmic/floating-svgs.tsx`) — everything
stays locked behind the content at `z-0`.

This feature adds a **foreground flow overlay**: on hover, one signature SVG per side
lifts **above the cards and text** and **flows + glows over them**, then recedes on leave.

**Concept — "each card is a door, the world behind it seeps out."** Hovering a card is a
*teaser of the world you're about to enter*: the nerdy card leaks its green ecosystem over
the page; the creative card spills pink water. Committing (2nd click) lets it **flood and
pull you through** — visually rhyming with the existing exit-bloom (`scale 1.7` + tint).
One coherent story: **seep → flood → enter.**

**Hard constraints (unchanged from the project):** keep the design system identical (same
fonts, tokens, assets, structure); **zero jitter**; **~flat CPU**; do not touch `/nerdy`,
`/creative`, their layouts, API routes, or the design tokens.

## Asset mapping

| Card (`hoverSide`) | Asset (`/cosmic/…`) | Glow tint | Why |
|---|---|---|---|
| `nerdy` (left card) | `stream-b-1400` | terminal green `#7fb07f` | the greenest, flow-shaped of the green assets |
| `creative` (right card) | `dust-wave-1400` | sakura pink `#f0c6cf` | clean abstract water current, no clutter |

- `dust-wave` is near-black → rides in **normal** blend over its pink glow aura (screen
  would erase it) → reads as dark water with light glowing through.
- `stream-b` has light foliage → **screen** blend so the green glows over the dark page.
- ⚠️ `stream-b` has a watermark glyph baked into its top-right corner. The radial mask +
  framing **must crop it out** (it's hidden today only because the bg copy is at 0.14α and
  partly offscreen).

## Architecture

A dedicated overlay rendered **outside** the `z-0` cosmic container (a child there can
never paint above `z-10` content):

- New component: `components/cosmic/foreground-flow.tsx`.
- Mounted from `app/page.tsx` (sibling of `<FloatingSvgs/>`), receiving `hoverSide` and
  `exiting`.
- Root: `fixed inset-0 pointer-events-none` at **`z-30`** — above the cards (`z-20`),
  below the grain/vignette (`z-50`). Raise toward `z-45` if it must also clear the `z-40`
  foreground mote tier (confirm against the live stack in execution).
- `pointer-events-none` is load-bearing: the ribbon floats *over* the cards but must never
  intercept the hover/click that drives it (otherwise moving onto it fires the card's
  `onHoverEnd` → flicker).
- **Mounts only while a side is active** (`hoverSide` set, or `exiting`) via
  `AnimatePresence`. Idle = nothing rendered in front → **idle CPU unchanged**.
- Reduced motion / pre-mount gated by the same `motionEnabled = mounted && !prefersReduced`
  pattern used in `floating-svgs.tsx`.

### DOM nesting (reuses the proven jitter-free structure)

```
overlay root  (fixed inset-0 pointer-events-none z-30)
└─ positioning wrapper        (gpu-layer; faint cursor parallax — fg-tier weight)
   ├─ glow aura               (radial-gradient, NORMAL blend, own gpu-layer;
   │                           animates opacity + scale breathe only)
   └─ reveal wrapper          (NORMAL-composited; one-shot opacity/scale settle on enter)
      └─ blend child          (static opacity; screen=green / normal=water; blend-isolate)
         └─ flow layer        (gpu-layer; radial mask + transformOrigin;
            └─ <picture>        TRANSFORM-ONLY continuous drift loop)
```

This mirrors `FloatingSvgItem`: opacity reveal as a *settling one-shot* on a normal
wrapper, blend on a *static-opacity* child, transform-only continuous loop on an isolated
GPU layer. Glow is a separate normal-blend element so its opacity can animate freely.

## Composition — anchored, asymmetric, mirrored

Not a centered wash. The ribbon is **densest at the hovered card** and dissolves as it
flows *outward into negative space*, mirrored per side so the two feel like opposites:

- `nerdy` (left card): anchored lower-left, flows **up-and-right**.
- `creative` (right card): anchored lower-right, flows **up-and-left**.

It **grazes the headline's edge, never covers it**. Exact coordinates (top/left/size in
`vw`, rotate, transformOrigin) tuned live; the dense stretch must avoid the H1/tagline.

## Motion — two personalities (the core differentiation)

Same parts, but the two sides **move differently** — precise hacker vs unhinged artist.
Both easings already exist in `floating-svgs.tsx`, so the motion stays native to the scene.

| | `nerdy` — green | `creative` — water |
|---|---|---|
| character | precise, deliberate (terminal) | loose, turbulent (unhinged) |
| drift | tighter, more **linear**, faster (~22–26s) | wider, **undulating**, slower (~30–36s) |
| easing | `[0.37, 0, 0.63, 1]` (river) | `[0.45, 0.05, 0.55, 0.95]` (branch sway) |
| glow pulse | steady, tight (~3s) | slow, irregular breathe (~6s) |

**Continuous drift** is transform-only: translate a few % along the diagonal axis + faint
`scale` breathe + ~1–2° `rotate` oscillation. Runs only while shown.

**Choreographed reveal** (one staggered moment, not a uniform fade):
1. `0–0.18s` — glow aura blooms at the card (opacity + scale).
2. `0.1–0.6s` — ribbon **sweeps out** along its diagonal (translate from off-axis +
   `scale 0.9→1` + opacity `0→target`).
3. settles into the personality drift.

**Exit** (`exiting === side`): ribbon + glow **surge outward** (`scale → ~1.4–1.7` + fade,
~0.7s) so they join the scene's bloom-flood rather than just vanishing.

**Cursor parallax (volume, not a sticker):** faint fg-tier depth offset (≈ ±26px, heavily
damped spring), reusing the existing mouse-depth approach. Fine-pointer only; off under
reduced motion.

**Opacity targets (readability):** ribbon ≈ `0.35` (tune 0.30–0.45), glow ≈ `0.25`.

## Background coordination

While the front ribbon is active for a side, **dim the background copy of that same asset**
so the texture doesn't read as duplicated:
- `creative` active → tone down the bg `river` (dust-wave) layer.
- `nerdy` active → tone down the bg `interactive-green-ecosystem` layers.

Small, additive change in `floating-svgs.tsx`'s hover-awakening branch (the rest of the
awakening — dimming the off-tone layers, lifting the galaxy on nerdy — stays as-is).

## The no-jitter / low-CPU contract (explicit)

- **Idle:** overlay unmounted when no side is active → no added per-frame cost.
- **Only `transform` + `opacity` animate.** No `filter`/blur, no `box-shadow`, no
  `mask-position`, no `background-position` (all paint-bound — the banned jitter sources).
- Glow = radial-gradient opacity + scale on its own GPU layer (no blur animation).
- One ribbon + one glow at a time; asset already cached by the bg scene → no extra network.
- Continuous loop is transform-only on an isolated, GPU-promoted, mask-bearing child —
  the structure already verified jitter-free this codebase.

## Reduced motion & mobile

- **`prefers-reduced-motion`:** no loops/parallax/choreography — show a single static faint
  frame (ribbon + glow at target opacity) on arm, or skip entirely. Gated by `motionEnabled`.
- **Touch:** no hover, but the 1st card tap **arms** the side (already sets `hoverSide`), so
  the ribbon appears on arm. Parallax is already fine-pointer-gated. Consider a lighter
  size on small screens.
- **No horizontal overflow:** `vw`/`%` sizing + radial mask, consistent with the existing
  `overflow-x: hidden` guard.

## Files

| File | Change |
|---|---|
| `components/cosmic/foreground-flow.tsx` | **New** — the overlay component. |
| `app/page.tsx` | Mount `<ForegroundFlow hoverSide exiting />` beside `<FloatingSvgs/>`. |
| `components/cosmic/floating-svgs.tsx` | Dim the bg copy of the asset the foreground owns, per active side. |
| `docs/MOTION_SYSTEM.md` | Document the foreground-flow layer + portal-seep motion. |
| `DESIGN.md` | Add the foreground-flow layer to the z-index map + home interactions. |

**Out of scope:** `/nerdy`, `/creative`, their layouts, API routes, `globals.css` tokens,
the assets themselves, and the other cosmic layers' existing signature motions.

## Verification

- `pnpm build` + `pnpm lint` clean.
- Live preview, desktop (1440×900): hover each card → the ribbon **seeps from that card**,
  flows + glows with the right **personality** (green = crisp/linear; water = loose/undulating),
  the **headline/buttons stay readable**, the `stream-b` **watermark is not visible**, and
  there's **no jitter** (sample `transform` over time; confirm transform-only).
- **Idle CPU unchanged**: overlay is unmounted when not hovering (verify via DOM/snapshot).
- **Exit**: 2nd click → ribbon surges outward with the scene bloom, then routes.
- `prefers-reduced-motion` → static frame, no loops.
- Mobile (390px): 1st tap shows the ribbon; **no horizontal overflow**; no console errors.
- `/nerdy` and `/creative` unchanged (spot check).
