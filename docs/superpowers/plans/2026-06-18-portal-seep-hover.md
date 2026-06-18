# Portal-Seep Hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-06-18-portal-seep-hover-design.md`](../specs/2026-06-18-portal-seep-hover-design.md)

**Goal:** On the home hero, hovering a card lifts one signature SVG per side *above* the cards/text and flows + glows over them ("the world behind the door seeps out"), then recedes on leave.

**Architecture:** A new `pointer-events-none` foreground overlay (`components/cosmic/foreground-flow.tsx`) rendered *outside* the `z-0` cosmic container at `z-30`, mounted from `app/page.tsx` and driven by the existing `hoverSide` / `exiting` state. It mounts only while a side is active (zero idle cost), reuses the proven jitter-free nesting (one-shot opacity reveal → static-opacity holder → transform-only loop on a masked GPU layer), and a separate radial-gradient glow aura. The background copy of the asset the overlay "owns" is dimmed in `floating-svgs.tsx` so the texture isn't duplicated.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Framer Motion 11, Tailwind v4. No unit-test harness in this repo — verification is `pnpm build` + `pnpm lint` + the Claude Preview MCP tools (visual/structural checks).

## Global Constraints

Every task implicitly includes these (verbatim from the spec):

- **Keep the design system identical** — same fonts (Space Grotesk / Geist Mono), tokens, assets, structure. No restyle.
- **Zero jitter; ~flat CPU.**
- **Animate `transform` + `opacity` only** — no `filter`/blur, no `box-shadow`, no `mask-position`, no `background-position` (the banned paint-bound props).
- **Do not touch** `/nerdy`, `/creative`, their layouts, API routes, `app/globals.css` tokens, or the asset files.
- **Overlay is `pointer-events-none`** and **mounts only while a side is active** (`hoverSide` set or `exiting`) → idle CPU unchanged.
- **Asset mapping:** `nerdy` → `stream-b-1400` + glow `#7fb07f`; `creative` → `dust-wave-1400` + glow `#f0c6cf`.
- **Layering:** overlay at `z-30` (above the cards at `z-20`, below grain/vignette at `z-50`).
- **Reduced motion:** static frame only — no loops/parallax/choreography. Gated by `motionEnabled = mounted && !prefersReduced`.
- **`stream-b` has a watermark glyph in its top-right corner** — the radial mask + framing must crop it out.
- **Verify Framer changes on a FRESH dev server.** HMR can corrupt Framer transforms (a known failure mode in this repo); if the scene looks frozen/blank after an edit, restart the dev server before diagnosing.
- Commit messages use the repo's conventional style (`feat(flow): …`, `docs(flow): …`) and **carry no Claude/Anthropic attribution trailer.**

---

### Task 0: Baseline

**Files:** none (verification only).

- [ ] **Step 1: Confirm a clean baseline build**

Run: `pnpm build`
Expected: build completes with no errors.

- [ ] **Step 2: Confirm lint is clean**

Run: `pnpm lint`
Expected: no errors (warnings tolerated if pre-existing).

- [ ] **Step 3: Start the dev preview and capture a "before" shot**

Start the preview server (Claude Preview MCP `preview_start`, name `next-dev`); keep the returned `serverId` for later steps. Load `/`, let the loader finish (click to skip), then `preview_screenshot` the hero.
Expected: the two cards render over the cosmic scene; nothing floats above the cards. Save as the before-shot for comparison.

---

### Task 1: Foreground-flow component + mount + background de-dup

**Files:**
- Create: `components/cosmic/foreground-flow.tsx`
- Modify: `app/page.tsx` (import + render beside `<FloatingSvgs/>`)
- Modify: `components/cosmic/floating-svgs.tsx:158-177` (dim the bg copy the overlay owns)

**Interfaces:**
- Produces: `export function ForegroundFlow({ hoverSide, exiting }: { hoverSide: "nerdy" | "creative" | null; exiting: "nerdy" | "creative" | null })` — a fixed `z-30` overlay.
- Consumes: the existing `hoverSide` and `exiting` state in `app/page.tsx` (already defined at `app/page.tsx:95-97`), and the assets `/cosmic/stream-b-1400.{avif,webp}` + `/cosmic/dust-wave-1400.{avif,webp}` (already in `public/cosmic/`).

- [ ] **Step 1: Create the component**

Create `components/cosmic/foreground-flow.tsx`:

```tsx
"use client"

import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

type Side = "nerdy" | "creative" | null

type FlowConfig = {
  asset: string
  glow: string
  top: string
  left: string
  size: string
  transformOrigin: string
  mask: string
  ribbonOpacity: number
  enterX: string
  enterY: string
  drift: any
  driftTransition: any
  glowPulse: any
  glowPulseTransition: any
}

// Per-side signature. Two personalities: nerdy = precise/linear (terminal);
// creative = loose/undulating (unhinged). Anchored at the hovered card, dissolving
// outward into negative space (mirrored diagonals). Masks crop the dense centre toward
// the asset and feather the corners (hides stream-b's top-right watermark glyph).
const FLOW: Record<"nerdy" | "creative", FlowConfig> = {
  nerdy: {
    asset: "stream-b-1400",
    glow:
      "radial-gradient(circle at 32% 64%, rgba(127,176,127,0.5) 0%, rgba(127,176,127,0.16) 42%, transparent 70%)",
    top: "24vh",
    left: "-12vw",
    size: "86vw",
    transformOrigin: "28% 72%",
    mask: "radial-gradient(circle at 38% 58%, black 6%, rgba(0,0,0,0.55) 36%, transparent 64%)",
    ribbonOpacity: 0.36,
    enterX: "-6%",
    enterY: "7%",
    drift: { x: ["0%", "3%", "0%"], y: ["0%", "-2.5%", "0%"], rotate: [-8, -6.5, -8], scale: [1, 1.03, 1] },
    driftTransition: { duration: 24, repeat: Infinity, ease: [0.37, 0, 0.63, 1], times: [0, 0.5, 1] },
    glowPulse: { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] },
    glowPulseTransition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  creative: {
    asset: "dust-wave-1400",
    glow:
      "radial-gradient(circle at 62% 58%, rgba(240,198,207,0.5) 0%, rgba(240,198,207,0.16) 44%, transparent 72%)",
    top: "22vh",
    left: "26vw",
    size: "92vw",
    transformOrigin: "70% 70%",
    mask: "radial-gradient(circle at 58% 54%, black 8%, rgba(0,0,0,0.55) 40%, transparent 68%)",
    ribbonOpacity: 0.36,
    enterX: "6%",
    enterY: "7%",
    drift: { x: ["0%", "-4%", "1%", "0%"], y: ["0%", "3%", "-1%", "0%"], rotate: [10, 8, 11, 10], scale: [1, 1.05, 1.0, 1] },
    driftTransition: { duration: 34, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95], times: [0, 0.4, 0.75, 1] },
    glowPulse: { opacity: [0.65, 1, 0.82, 0.65], scale: [1, 1.07, 1.02, 1] },
    glowPulseTransition: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.75, 1] },
  },
}

function FlowLayer({
  side,
  motionEnabled,
  exiting,
  mouseX,
  mouseY,
}: {
  side: "nerdy" | "creative"
  motionEnabled: boolean
  exiting: boolean
  mouseX: any
  mouseY: any
}) {
  const cfg = FLOW[side]
  // Faint cursor DEPTH (fg-tier weight), mirrored per side — gives the ribbon volume.
  const dir = side === "nerdy" ? -1 : 1
  const mX = useTransform(mouseX, (v: number) => v * 26 * dir)
  const mY = useTransform(mouseY, (v: number) => v * 26 * dir)
  const springMX = useSpring(mX, { damping: 60, stiffness: 90 })
  const springMY = useSpring(mY, { damping: 60, stiffness: 90 })

  return (
    <motion.div
      className="absolute gpu-layer"
      style={{
        top: cfg.top,
        left: cfg.left,
        width: cfg.size,
        height: cfg.size,
        x: motionEnabled ? springMX : 0,
        y: motionEnabled ? springMY : 0,
      }}
    >
      {/* Reveal / exit wrapper — one-shot opacity + scale + entrance sweep (settles). */}
      <motion.div
        className="w-full h-full relative gpu-layer"
        style={{ transformOrigin: cfg.transformOrigin }}
        initial={{ opacity: 0, scale: 0.92, x: cfg.enterX, y: cfg.enterY }}
        animate={exiting ? { opacity: 0, scale: 1.5, x: "0%", y: "0%" } : { opacity: 1, scale: 1, x: "0%", y: "0%" }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={
          exiting
            ? motionEnabled
              ? { duration: 0.7, ease: [0.4, 0, 0.9, 0.5] }
              : { duration: 0 }
            : motionEnabled
              ? {
                  opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  x: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                }
              : { duration: 0 }
        }
      >
        {/* Glow aura — radial gradient, normal compositing, breathes (opacity + scale). */}
        <motion.div
          aria-hidden
          className="absolute inset-0 gpu-layer"
          style={{ background: cfg.glow, transformOrigin: cfg.transformOrigin }}
          animate={motionEnabled && !exiting ? cfg.glowPulse : { opacity: 0.85, scale: 1 }}
          transition={motionEnabled && !exiting ? cfg.glowPulseTransition : { duration: 0 }}
        />

        {/* Ribbon — static-opacity holder; the flow loop (transform-only) lives on its child. */}
        <div className="absolute inset-0" style={{ opacity: cfg.ribbonOpacity }}>
          <motion.div
            className="w-full h-full gpu-layer"
            style={{ WebkitMaskImage: cfg.mask, maskImage: cfg.mask, transformOrigin: cfg.transformOrigin }}
            animate={motionEnabled && !exiting ? cfg.drift : undefined}
            transition={motionEnabled && !exiting ? cfg.driftTransition : { duration: 0 }}
          >
            <picture className="block w-full h-full">
              <source srcSet={`/cosmic/${cfg.asset}.avif`} type="image/avif" />
              <source srcSet={`/cosmic/${cfg.asset}.webp`} type="image/webp" />
              <img
                src={`/cosmic/${cfg.asset}.webp`}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </picture>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ForegroundFlow({ hoverSide, exiting }: { hoverSide: Side; exiting: Side }) {
  const [mounted, setMounted] = useState(false)
  const prefersReduced = useReducedMotion()
  const motionEnabled = mounted && !prefersReduced

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    setMounted(true)
    const finePointer = window.matchMedia("(pointer: fine)").matches
    if (prefersReduced || !finePointer) return
    let rafId = 0
    let pending = false
    let lastX = 0
    let lastY = 0
    const flush = () => {
      pending = false
      mouseX.set(lastX)
      mouseY.set(lastY)
    }
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX / window.innerWidth - 0.5
      lastY = e.clientY / window.innerHeight - 0.5
      if (!pending) {
        pending = true
        rafId = requestAnimationFrame(flush)
      }
    }
    window.addEventListener("mousemove", onMove)
    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafId)
    }
  }, [mouseX, mouseY, prefersReduced])

  // Keep showing through the exit bloom even after hoverSide is cleared.
  const active: "nerdy" | "creative" | null = exiting ?? hoverSide

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {active && (
          <FlowLayer
            key={active}
            side={active}
            motionEnabled={motionEnabled}
            exiting={exiting === active}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Mount it in the home page**

In `app/page.tsx`, add the import next to the other cosmic imports (after `app/page.tsx:16`, the `BlossomField` import):

```tsx
import { ForegroundFlow } from "@/components/cosmic/foreground-flow"
```

Then render it right after `<EdgeBloom />` (currently `app/page.tsx:253`):

```tsx
      <EdgeBloom />
      <ForegroundFlow hoverSide={hoverSide} exiting={exiting} />
```

- [ ] **Step 3: Dim the background copy the overlay owns**

In `components/cosmic/floating-svgs.tsx`, replace the hover-awakening block (`app`/`floating-svgs.tsx:158-177`) so the asset the foreground overlay owns recedes instead of brightening:

```tsx
  if (hoverSide === "creative") {
    if (item.type === "river") {
      // Foreground flow owns the water now — recede the bg copy so it doesn't duplicate.
      targetOpacity = targetOpacity * 0.4
    } else if (item.type === "interactive-pink-particles") {
      targetOpacity = 0.8
    } else if (item.tone === "pink" && item.type !== "nebula-glow") {
      targetOpacity = Math.min(1, targetOpacity * 2.6 + 0.14)
    } else if (item.type !== "nebula-glow") {
      targetOpacity = targetOpacity * 0.22
    }
  } else if (hoverSide === "nerdy") {
    if (item.type === "interactive-green-ecosystem") {
      // Foreground flow owns the green stream now — recede the bg copy (was 0.9).
      targetOpacity = targetOpacity * 0.4
    } else if (item.tone === "green") {
      targetOpacity = Math.min(1, targetOpacity * 2.6 + 0.14)
    } else if (item.type === "galaxy") {
      // The solar system stays lit (acknowledges the nerdy side) rather than dimming out.
      targetOpacity = Math.min(1, targetOpacity * 1.1)
    } else if (item.type !== "nebula-glow") {
      targetOpacity = targetOpacity * 0.22
    }
  }
```

- [ ] **Step 4: Type-check / build**

Run: `pnpm build`
Expected: compiles with no TypeScript or build errors.

- [ ] **Step 5: Lint**

Run: `pnpm lint`
Expected: no new errors.

- [ ] **Step 6: Visual + structural verification on a fresh dev server**

Restart the preview server (stop, then `preview_start` name `next-dev`) so Framer isn't running through a stale HMR graph. Load `/`, skip the loader.
- `preview_eval`: dispatch a hover on the nerdy card (e.g. `document.querySelector('a[href="/nerdy"]').dispatchEvent(new MouseEvent('mouseover',{bubbles:true}))`) — or use `preview_click`/hover on the card region.
- `preview_screenshot`: confirm a green glowing ribbon floats **above** the left card, anchored lower-left, with the headline/buttons still readable and **no watermark glyph visible**.
- Repeat for the creative (right) card → pink water ribbon above the right card.
- `preview_snapshot` with no side hovered: confirm the overlay's `FlowLayer` is **not in the DOM** (idle = unmounted).
Expected: both ribbons render in front of the cards; idle DOM has only the empty `z-30` wrapper.

- [ ] **Step 7: Commit**

```bash
git add components/cosmic/foreground-flow.tsx app/page.tsx components/cosmic/floating-svgs.tsx
git commit -m "feat(flow): foreground portal-seep overlay — hover lifts a glowing ribbon above the cards"
```

---

### Task 2: Live verification & per-personality tuning

**Files:**
- Modify (tuning only, as needed): `components/cosmic/foreground-flow.tsx` (the `FLOW` config values)

**Interfaces:** none new — adjusts values produced in Task 1.

This is the design-sensitive gate: the component already animates; here you judge the *feel* live and tune the `FLOW` config to hit the spec. Make changes only where an acceptance check fails.

- [ ] **Step 1: Confirm the two personalities read as distinct**

On a fresh dev server, hover each card and watch the drift. Acceptance: nerdy reads **tighter / more linear / slightly faster**; creative reads **wider / undulating / slower**. If they feel too similar, widen the gap — e.g. nerdy faster/tighter, creative slower/looser:

```tsx
    // nerdy.driftTransition.duration: 24 -> 20
    // creative.driftTransition.duration: 34 -> 38
```

- [ ] **Step 2: Confirm readability over the headline**

`preview_screenshot` each side; the `i'm som.` headline and both card labels must stay legible under the ribbon. If a ribbon sits too heavy over the text, lower its opacity and/or nudge the anchor outward:

```tsx
    // <side>.ribbonOpacity: 0.36 -> 0.30
    // <side>.top / left: shift the dense stretch further into the margin
```

- [ ] **Step 3: Confirm the watermark stays cropped**

Zoom the screenshot on `stream-b`'s upper-right region. The flask/acorn glyph must not appear. If it peeks through, tighten the mask's transparent stop:

```tsx
    // nerdy.mask: "...transparent 64%)" -> "...transparent 58%)"
```

- [ ] **Step 4: Confirm no jitter (transform-only motion is live)**

`preview_eval` on a foreground tab to sample the ribbon's transform twice ~400ms apart, e.g.:

```js
(() => { const el = document.querySelector('[aria-hidden] .gpu-layer picture')?.parentElement;
  return el ? getComputedStyle(el).transform : 'no-ribbon' })()
```

Expected: the matrix values change between samples (motion is running) and only ever reflect transform/opacity — confirm no `filter`/`box-shadow` is animating. (If the tab is backgrounded, rAF pauses — sample on a foreground tab.)

- [ ] **Step 5: Confirm the exit surge**

Click the nerdy card twice (1st arms, 2nd exits). The ribbon should **scale outward + fade** with the scene bloom during the ~0.76s before navigation. `preview_screenshot` mid-exit to confirm the surge (not an abrupt cut).

- [ ] **Step 6: Re-run build + lint after any tuning**

Run: `pnpm build && pnpm lint`
Expected: clean.

- [ ] **Step 7: Commit (only if values changed)**

```bash
git add components/cosmic/foreground-flow.tsx
git commit -m "feat(flow): tune per-side flow personalities, opacity and watermark mask"
```

---

### Task 3: Reduced-motion & mobile pass

**Files:**
- Modify (if needed): `components/cosmic/foreground-flow.tsx`

**Interfaces:** none new.

- [ ] **Step 1: Verify reduced motion shows a static frame**

In the preview, emulate `prefers-reduced-motion: reduce` (`preview_eval` cannot toggle the media query directly — use the Preview's emulation if available, otherwise reason from code: with `motionEnabled === false`, parallax is `0`, the glow animates to `{opacity:0.85,scale:1}` with `duration:0`, and `drift` is `undefined`). Acceptance: on arm/hover, a **static** faint ribbon + glow appears with **no continuous motion**. If any loop still runs under reduced motion, gate it behind `motionEnabled` (it already is — fix any miss).

- [ ] **Step 2: Verify no horizontal overflow at mobile widths**

`preview_resize` to 390×844, load `/`, arm each side (tap the card — on touch the 1st tap sets `hoverSide`). `preview_eval`: `document.documentElement.scrollWidth <= window.innerWidth`.
Expected: `true` (no sideways scroll). The overlay is `overflow-hidden` + `vw`-sized, so it should hold; if not, reduce `size` on small screens.

- [ ] **Step 3: (Optional) lighten the overlay on small screens**

If the ribbon feels oversized on mobile, gate a smaller `size`/opacity behind a `max-width: 767px` check (mirror the `isCompactSpotify` pattern in `app/page.tsx:204-215`). Skip if it already reads well.

- [ ] **Step 4: Confirm `/nerdy` and `/creative` are untouched**

Load `/nerdy` and `/creative`; `preview_screenshot` each.
Expected: visually identical to before (the overlay is home-only; these routes don't mount it).

- [ ] **Step 5: Build + lint**

Run: `pnpm build && pnpm lint`
Expected: clean.

- [ ] **Step 6: Commit (only if code changed)**

```bash
git add components/cosmic/foreground-flow.tsx
git commit -m "feat(flow): reduced-motion static frame + mobile sizing for the foreground flow"
```

---

### Task 4: Docs + final contract verification

**Files:**
- Modify: `docs/MOTION_SYSTEM.md`
- Modify: `DESIGN.md`

**Interfaces:** none.

- [ ] **Step 1: Document the layer in `docs/MOTION_SYSTEM.md`**

Add a section describing the foreground-flow overlay: the portal-seep concept, transform-only flow + radial-gradient glow (no animated blur/box-shadow), mount-on-hover (zero idle), the two per-side personalities and their reused easings (`[0.37,0,0.63,1]` / `[0.45,0.05,0.55,0.95]`), and the reduced-motion static frame. Keep the house voice of that file.

- [ ] **Step 2: Document the layer in `DESIGN.md`**

In the Z-index map (`DESIGN.md` §3), add the `ForegroundFlow` overlay at `z-30` (above cards `z-20`, below grain `z-50`). In the home interactions (§5.3 hover "awakening"), note that hover now also lifts the owned asset to a foreground glowing ribbon and dims its background copy.

- [ ] **Step 2.5: Update the spawned background-task chip if the spec changed**

No-op unless the spec was edited during execution; otherwise skip.

- [ ] **Step 3: Final contract sweep on a fresh dev server**

Restart the preview server. Verify the full contract in one pass:
- Idle (no hover): `preview_snapshot` → no `FlowLayer` in the DOM.
- Hover nerdy → green ribbon above the left card; hover creative → pink water above the right card; both readable, no watermark.
- Transform sampling (Task 2 Step 4) shows live transform-only motion, no jitter.
- 2nd-click exit surges the ribbon with the bloom.
- 390px: `scrollWidth <= innerWidth`.
- `preview_console_logs`: no errors.

- [ ] **Step 4: Final build + lint**

Run: `pnpm build && pnpm lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add docs/MOTION_SYSTEM.md DESIGN.md
git commit -m "docs(flow): document the foreground portal-seep overlay (z-30, motion, personalities)"
```

---

## Self-Review

**Spec coverage:**
- Concept (portal seep) → Task 1 (component) + Task 4 (docs). ✓
- Asset mapping (stream-b/green, dust-wave/pink) → Task 1 `FLOW` config. ✓
- Architecture (z-30 overlay outside the z-0 container, pointer-events-none, mount-on-hover) → Task 1. ✓
- DOM nesting (one-shot reveal → static-opacity holder → transform-only loop → masked picture; separate glow) → Task 1 component. ✓
- Composition (anchored, mirrored diagonals) → Task 1 `top/left/transformOrigin/enterX/enterY`; tuned Task 2. ✓
- Two motion personalities + reused easings → Task 1 `drift*`/`glowPulse*`; verified Task 2 Step 1. ✓
- Choreographed reveal + exit surge → Task 1 reveal wrapper; verified Task 2 Step 5. ✓
- Cursor parallax (fg-tier, fine-pointer) → Task 1 `FlowLayer` + listener. ✓
- Background de-dup → Task 1 Step 3. ✓
- No-jitter / low-CPU contract → Global Constraints + Task 2 Step 4 + Task 4 Step 3. ✓
- Reduced motion + mobile → Task 3. ✓
- Watermark crop → Task 1 mask + Task 2 Step 3. ✓
- Docs (MOTION_SYSTEM, DESIGN) → Task 4. ✓
- `/nerdy` `/creative` untouched → Task 3 Step 4. ✓

**Placeholder scan:** No "TBD/handle edge cases/similar to" — full component code is in Task 1; tuning steps give concrete example diffs with acceptance criteria. ✓

**Type consistency:** `ForegroundFlow({ hoverSide, exiting })`, `FlowLayer({ side, motionEnabled, exiting, mouseX, mouseY })`, `FLOW` keys `nerdy`/`creative`, and `Side` union are consistent across Task 1 and the mount in `app/page.tsx`. The `floating-svgs.tsx` `item.type` values (`river`, `interactive-green-ecosystem`, `interactive-pink-particles`, `galaxy`) match the existing `sceneData`. ✓
