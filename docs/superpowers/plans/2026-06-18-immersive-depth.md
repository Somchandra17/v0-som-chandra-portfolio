# Immersive Depth — Homepage Foreground Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage background read as immersive, layered depth by adding a foreground mote tier that occludes content, retuning the 12 existing cosmic layers into FAR/MID/FG planes, and widening parallax spread — with ~0 CPU delta and no jitter.

**Architecture:** Reuse the existing `BlossomField` 2D canvas (sprite-cached, 60fps-capped, hover-gated, tab-hidden-paused) as the new foreground tier by bumping its `z-index` to 40 and adding a sparser/slower foreground sub-stream inside the same RAF loop. Retune `FloatingSvgs` opacities + masks + parallax to separate the existing 12 layers into three legible planes. No new DOM nodes, no new animation systems, no new dependencies.

**Tech Stack:** Next.js 16 (App Router), React 19, Framer Motion 11, TypeScript 5, Tailwind 4, Canvas 2D.

**Spec:** `docs/superpowers/specs/2026-06-18-immersive-depth-design.md`

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `components/cosmic/blossom-field.tsx` | Foreground mote canvas (was background petals) | **Major modify** — add foreground sub-stream, bump z-index, tone-shift on hover/armed, ARM ripple, exit accel, idle trickle |
| `components/cosmic/floating-svgs.tsx` | The 12-layer cosmic system | **Modify** — retune opacities (FAR/MID), tighten mid masks, widen parallax spread |
| `app/page.tsx` | Homepage root | **Modify** — pass `armedSide` into `BlossomField`; small wiring |
| `app/globals.css` | Design tokens | **Minor modify** — add one CSS var for foreground canvas z-index (clarity) |
| `docs/MOTION_SYSTEM.md` | Motion system doc | **Modify** — document the foreground tier + stacking model + interaction ladder |
| `/tmp/verify-depth.mjs` | Playwright verification script | **Create** (throwaway) — re-capture before/after screenshots |

**Out of scope:** `/nerdy`, `/creative`, loader, layout shell, API routes, new assets.

---

## Task 0: Baseline build + before-screenshots

**Files:**
- None modified. Capture baseline state.

- [ ] **Step 1: Verify clean build**

Run: `pnpm build`
Expected: builds successfully, no type errors. (If it fails, stop and fix the pre-existing issue first — do not build on a broken baseline.)

- [ ] **Step 2: Confirm dev server is running**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: `200`. If not `200`, start it: `pnpm dev > /tmp/portfolio-dev.log 2>&1 &` and wait ~3s.

- [ ] **Step 3: Capture BEFORE screenshots (for the after-comparison)**

Create `/tmp/verify-depth.mjs` with this exact content (this is the throwaway verification harness, reused in later tasks):

```js
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = process.argv[2] || '/tmp/portfolio-shots';
fs.mkdirSync(OUT, { recursive: true });
const URL = 'http://localhost:3000';
const shots = [];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.setItem('som-pretext', 'ready'); } catch {} });

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500); // entrance + cosmic layers settle

await page.screenshot({ path: `${OUT}/01-hero-desktop-idle.png` });
shots.push('01-hero-desktop-idle.png');

const nerdyCard = page.locator('a[href="/nerdy"]').first();
await nerdyCard.hover();
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/02-hover-nerdy.png` });
shots.push('02-hover-nerdy.png');

const creativeCard = page.locator('a[href="/creative"]').first();
await creativeCard.hover();
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/03-hover-creative.png` });
shots.push('03-hover-creative.png');

await page.mouse.move(0, 0);
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/04-scrolled-music.png` });
shots.push('04-scrolled-music.png');

await page.evaluate(() => window.scrollTo(0, 2200));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/05-scrolled-terminal.png` });
shots.push('05-scrolled-terminal.png');

await browser.close();
console.log('SHOTS:', JSON.stringify(shots));
```

Run: `cd /tmp && node /tmp/verify-depth.mjs /tmp/portfolio-shots-before`
Expected: prints `SHOTS: [...]` with 5 files. (The "before" state has no foreground occlusion — later tasks will produce an "after" set you compare against.)

- [ ] **Step 4: No commit (baseline capture only)**

---

## Task 1: Add the `armed` prop to BlossomField + wire from page.tsx

This task adds the plumbing (no visual change yet) so the later foreground logic can react to the ARM (first-click) state. Tiny, isolated, committed alone.

**Files:**
- Modify: `components/cosmic/blossom-field.tsx:6` (type), `:34-45` (props + effect)
- Modify: `app/page.tsx:17` (import), `:252` (prop pass)

- [ ] **Step 1: Add `armed` to the BlossomField props**

In `components/cosmic/blossom-field.tsx`, replace the component signature and the hoverSide effect (lines 34-45):

```tsx
export function BlossomField({ hoverSide, armedSide = null, exiting = null }: { hoverSide: Side; armedSide?: Side; exiting?: Side }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sideRef = useRef<Side>(null)
  const armedRef = useRef<Side>(null)
  const exitingRef = useRef<Side>(null)
  const startRef = useRef<() => void>(() => {})
  const rippleRef = useRef<(side: "nerdy" | "creative") => void>(() => {})
  const burstRef = useRef<(side: "nerdy" | "creative") => void>(() => {})
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    sideRef.current = hoverSide
    if (hoverSide) startRef.current()
  }, [hoverSide])

  // On the 1st click (ARM) a soft ripple acknowledges the commit.
  useEffect(() => {
    const was = armedRef.current
    armedRef.current = armedSide
    if (armedSide && !was) {
      rippleRef.current(armedSide)
      startRef.current()
    }
  }, [armedSide])
```

- [ ] **Step 2: Wire the prop from `app/page.tsx`**

In `app/page.tsx`, the `<BlossomField ... />` call (around line 252) — add `armedSide`:

```tsx
      <BlossomField hoverSide={hoverSide} armedSide={armedSide} exiting={exiting} />
```

(`armedSide` already exists as state in `app/page.tsx:96`.)

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: success. (`rippleRef` is assigned an empty function so there's no runtime change yet.)

- [ ] **Step 4: Commit**

```bash
git add components/cosmic/blossom-field.tsx app/page.tsx
git commit -m "feat(depth): wire armedSide into BlossomField (plumbing, no visual change)"
```

---

## Task 2: Bump BlossomField to z-40 (the foreground tier) + add idle trickle

This is the moment the canvas becomes a foreground layer. It now renders *on top of* content. The idle trickle makes the scene feel alive even with no hover. This task is visually verifiable on its own.

**Files:**
- Modify: `components/cosmic/blossom-field.tsx` — canvas className (line ~226), spawn logic + idle spawner

- [ ] **Step 1: Bump the canvas z-index to 40**

In `components/cosmic/blossom-field.tsx`, replace the canvas element (around line 224-228):

```tsx
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[40] h-screen w-full"
      aria-hidden="true"
    />
  )
```

(Changed `z-[1]` → `z-[40]`.)

- [ ] **Step 2: Add foreground mote config constants**

In `components/cosmic/blossom-field.tsx`, after the existing `const CAP = 30` (line 17), add:

```tsx
const CAP = 30

// --- Foreground sub-stream: delicate motes drifting IN FRONT of content (z-40).
// Sparser, slower, brighter than the hover petals. Sells occlusion depth.
const FG_IDLE_CAP = 6        // idle trickle density
const FG_HOVER_CAP = 16      // hover density
const FG_ARMED_CAP = 22      // armed (1st-click) density
const FG_IDLE_FRAME_MS = 1000 / 20  // idle trickle runs at 20fps (half the 60fps petal loop)
```

- [ ] **Step 3: Add a `fg` flag to the Mote interface**

In `components/cosmic/blossom-field.tsx`, replace the `Mote` interface (lines 19-32):

```tsx
interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  angle: number
  spin: number
  swaySeed: number
  sway: number
  color: string
  life: number
  fade: number
  fg: boolean      // foreground mote? (rendered brighter, occludes content)
  ripple: boolean  // ARM ripple mote? (short-lived, settles fast)
}
```

- [ ] **Step 4: Add the foreground spawn function**

In the main `useEffect` (the canvas one, starting line 57), find the existing `spawn` function (lines 103-119) and add a new `spawnFg` right after it. First, replace the existing `spawn` to include the two new fields:

```tsx
    const spawn = (side: "nerdy" | "creative") => {
      const colors = COLORS[side]
      motes.push({
        x: Math.random() * w,
        y: h * 0.55 + Math.random() * h * 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.25 + Math.random() * 0.5),
        size: 6 + Math.random() * 10,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        swaySeed: Math.random() * 6.28,
        sway: 0.3 + Math.random() * 0.6,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0,
        fade: 0.004 + Math.random() * 0.004,
        fg: false,
        ripple: false,
      })
    }

    // Foreground mote: drifts along viewport edges + section gaps (not parked over text),
    // slower and brighter than hover petals. `biasCardX/biasCardY` pull it toward the
    // active card region when a side is hovered/armed.
    const spawnFg = (side: "nerdy" | "creative", biasCardX: number, biasCardY: number) => {
      const colors = COLORS[side]
      // Bias spawn toward the active card region (±some scatter) when engaged; else spread across width.
      const nearCard = side !== null
      const cx = nearCard ? biasCardX + (Math.random() - 0.5) * w * 0.6 : Math.random() * w
      motes.push({
        x: cx,
        y: nearCard ? biasCardY + (Math.random() - 0.5) * h * 0.5 : h * 0.2 + Math.random() * h * 0.6,
        vx: (Math.random() - 0.5) * 0.18,           // slower horizontal drift
        vy: side === "nerdy" ? (Math.random() - 0.5) * 0.3 : -(0.15 + Math.random() * 0.3), // nerdy: more horizontal; creative: rises
        size: 4 + Math.random() * 8,                // smaller — delicate, never covers a card face
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.012,
        swaySeed: Math.random() * 6.28,
        sway: 0.2 + Math.random() * 0.4,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0,
        fade: 0.0025 + Math.random() * 0.0025,      // slower fade-in (delicate)
        fg: true,
        ripple: false,
      })
    }
```

- [ ] **Step 5: Add the ARM ripple spawn function**

Right after `spawnFg`, add:

```tsx
    // ARM ripple: on the 1st click, ~10 motes emanate outward from the clicked card and settle.
    const ripple = (side: "nerdy" | "creative") => {
      const colors = COLORS[side]
      const cx = w / 2
      const cy = h * 0.46
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = 0.8 + Math.random() * 1.8
        motes.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 60,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.4,
          size: 8 + Math.random() * 12,
          angle: Math.random() * 6.28,
          spin: (Math.random() - 0.5) * 0.04,
          swaySeed: Math.random() * 6.28,
          sway: 0.3 + Math.random() * 0.3,
          color: colors[(Math.random() * colors.length) | 0],
          life: 1,
          fade: 0.02 + Math.random() * 0.01,        // settles in ~0.6s
          fg: true,
          ripple: true,
        })
      }
    }
    rippleRef.current = ripple
```

- [ ] **Step 6: Add the exit-burst acceleration**

Find the existing `burst` function (lines 121-144). Update each pushed mote to include `fg: true, ripple: false` AND grow faster. Replace the body's mote push loop:

```tsx
    // Exit burst: a spray of large motes flying outward from centre (the "bloom out").
    // Now rendered in FRONT of content (fg) — the depth inverts: content recedes, foreground surges.
    const burst = (side: "nerdy" | "creative") => {
      const colors = COLORS[side]
      const cx = w / 2
      const cy = h * 0.46
      for (let i = 0; i < 30; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = 1.6 + Math.random() * 4.2
        motes.push({
          x: cx + (Math.random() - 0.5) * w * 0.5,
          y: cy + (Math.random() - 0.5) * h * 0.45,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.2,
          size: 16 + Math.random() * 30,
          angle: Math.random() * 6.28,
          spin: (Math.random() - 0.5) * 0.08,
          swaySeed: Math.random() * 6.28,
          sway: 0.4 + Math.random() * 0.5,
          color: colors[(Math.random() * colors.length) | 0],
          life: 1,
          fade: 0.01 + Math.random() * 0.01,
          fg: true,
          ripple: false,
        })
      }
    }
    burstRef.current = burst
```

- [ ] **Step 7: Update the render loop for foreground density + idle trickle + scroll thinning**

This is the core loop change. Replace the `render` function (lines 147-202) entirely:

```tsx
    // --- Active-side card centre (for spawn biasing). Computed each frame from refs.
    // The nerdy/creative cards sit in a 2-col grid around mid-page in the hero.
    let biasCardX = w / 2
    let biasCardY = h * 0.46

    // Single scroll-progress reader shared with density (no new listener).
    // Density is REDUCED over dense content (music zone, terminal) and restored in gaps.
    let densityScale = 1

    const render = (now: number) => {
      if (!running) return
      rafId = requestAnimationFrame(render)
      const isIdleTick = (now - last >= FG_IDLE_FRAME_MS)
      if (now - last < FRAME_MS) return   // hover/armed/burst loop still capped at 60fps
      last = now

      ctx.clearRect(0, 0, w, h)
      const side = sideRef.current
      const armed = armedRef.current
      const exitingNow = exitingRef.current
      phase += 0.02
      const flatten = exitingNow ? 0.85 : side ? FLATTEN[side] : 0.5

      ctx.globalCompositeOperation = "lighter"

      // --- Foreground density by state (the intensity ladder) ---
      let fgCap = FG_IDLE_CAP
      let fgOpacityBoost = 0.3
      if (side === "nerdy" || side === "creative") {
        fgCap = FG_HOVER_CAP
        fgOpacityBoost = 0.45
      }
      if (armed) {
        fgCap = FG_ARMED_CAP
        fgOpacityBoost = 0.55
      }
      if (exitingNow) fgOpacityBoost = 0.85

      // --- Scroll thinning: reduce density over text-dense zones ---
      const scrollProg = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      densityScale = 1
      if (scrollProg > 0.18 && scrollProg < 0.55) densityScale = 0.4   // music zone
      else if (scrollProg > 0.6 && scrollProg < 0.78) densityScale = 0.3 // terminal

      // --- Spawning ---
      const activeSide: "nerdy" | "creative" | null = exitingNow ?? side ?? armed
      if (activeSide) {
        if (now - lastSpawn > 70 && motes.length < CAP) spawn(activeSide)   // hover petals (bg)
        const fgEffectiveCap = Math.round(fgCap * densityScale)
        const fgCount = motes.filter(m => m.fg && !m.ripple).length
        if (fgCount < fgEffectiveCap && now - lastFgSpawn > (activeSide ? 200 : 700)) {
          spawnFg(activeSide, biasCardX, biasCardY)
          lastFgSpawn = now
        }
      } else {
        // Idle trickle (no hover/armed): keep ~6 fg motes alive at 20fps cadence.
        if (isIdleTick) {
          const fgCount = motes.filter(m => m.fg && !m.ripple).length
          if (fgCount < FG_IDLE_CAP) spawnFg("creative", w / 2, h / 2)
        }
      }

      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i]
        const dying = (!p.fg && (side === null || p.y < h * 0.08 || !!exitingNow))
          || (p.fg && !p.ripple && (activeSide === null && p.life > 0 && now % 7 === 0 ? false : exitingNow))
          || (p.ripple && p.life <= 0.02)
        p.life += dying ? -p.fade * 3 : p.fade * 2
        if (p.life >= 1) p.life = 1
        if (p.life <= 0) {
          motes.splice(i, 1)
          continue
        }

        if (exitingNow && p.fg) p.size += 0.7        // exit surge (was 0.45)
        else if (exitingNow) p.size += 0.45
        p.x += p.vx + Math.sin(phase + p.swaySeed) * p.sway
        p.y += p.vy
        p.angle += p.spin

        const sp = sprite(p.color)
        const d = p.size * 2
        // Foreground motes render brighter (occlusion depth); bg petals keep their ambient alpha.
        const alpha = p.fg ? p.life * fgOpacityBoost : p.life * 0.85
        ctx.globalAlpha = alpha
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.scale(1, flatten)
        ctx.drawImage(sp, -d / 2, -d / 2, d, d)
        ctx.restore()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"

      if (activeSide === null && motes.length === 0) {
        running = false
        ctx.clearRect(0, 0, w, h)
      }
    }
```

- [ ] **Step 8: Declare the new `lastFgSpawn` variable**

Find the variable declarations near the top of the canvas effect (around lines 95-100, where `let lastSpawn = 0` lives) and add `lastFgSpawn`:

```tsx
    const motes: Mote[] = []
    let running = false
    let rafId = 0
    let lastSpawn = 0
    let lastFgSpawn = 0
    let last = 0
    let phase = 0
    const FRAME_MS = 1000 / 60
```

- [ ] **Step 9: Start the loop for idle trickle (not just on hover)**

Find the `start` function + initial-trigger block (lines 204-212). Update so the loop starts on mount (for idle trickle), not only when a side is hovered:

```tsx
    const start = () => {
      if (running) return
      running = true
      last = 0
      lastSpawn = 0
      lastFgSpawn = 0
      rafId = requestAnimationFrame(render)
    }
    startRef.current = start
    // Start on mount so the idle trickle runs. Loop self-stops when no motes remain.
    start()
```

(Removed the `if (sideRef.current) start()` conditional — the loop now starts immediately and self-pauses when `activeSide === null && motes.length === 0`.)

- [ ] **Step 10: Verify build**

Run: `pnpm build`
Expected: success. If TypeScript complains about `armedRef`/`rippleRef` being read before assignment, confirm they were declared in Task 1.

- [ ] **Step 11: Visual verification — idle + hover + ARM**

Run: `cd /tmp && node /tmp/verify-depth.mjs /tmp/portfolio-shots-task2`
Expected: 5 screenshots captured. Open `01-hero-desktop-idle.png` — there should now be a **sparse foreground of delicate motes drifting in front of the card edges/gaps** (occlusion). This is the core depth fix. Hover shots should show denser, tone-leaning motes.

- [ ] **Step 12: Commit**

```bash
git add components/cosmic/blossom-field.tsx
git commit -m "feat(depth): foreground mote tier — z-40 occlusion, idle trickle, ARM ripple, exit surge"
```

---

## Task 3: Retune FloatingSvgs — FAR/MID/FG atmospheric separation + parallax spread

Now the background layers separate into legible planes. This makes the foreground (Task 2) read as the *nearest* of three depths rather than a lone overlay.

**Files:**
- Modify: `components/cosmic/floating-svgs.tsx:81-92` (base opacities), `:120-148` (parallax constants + transforms)

- [ ] **Step 1: Retune base opacities into FAR/MID planes**

In `components/cosmic/floating-svgs.tsx`, replace `baseOpacities` (lines 81-92):

```tsx
// Base opacities — retuned into FAR (dim, distant haze) and MID (lifted, reachable) planes.
// FOREGROUND depth is carried by the BlossomField canvas (z-40), not these layers.
// FAR: nebula, galaxy, flower-deep  ·  MID: river, orbital, branch, branch-small, green-ecosystem
const baseOpacities: Record<string, number> = {
  "nebula-glow": 0.28,                        // FAR  (was 0.4)  ×0.7
  "galaxy": 0.30,                             // FAR  (was 0.42) ×0.7
  "river": 0.30,                              // MID  (was 0.26) ×1.15
  "orbital": 0.35,                            // MID  (was 0.3)  ×1.15
  "branch": 0.28,                             // MID  (was 0.24) ×1.15
  "branch-small": 0.23,                       // MID  (was 0.2)  ×1.15
  "trail": 0,                                 // Driven by scroll
  "flower-deep": 0.10,                        // FAR  (was 0.14) ×0.7
  "interactive-pink-particles": 0,            // Only visible on hover
  "interactive-green-ecosystem": 0.14,        // MID  (was 0.12) ×1.15
}
```

- [ ] **Step 2: Widen the parallax spread**

In `components/cosmic/floating-svgs.tsx`, find the tier constants (lines 127-128) and replace:

```tsx
  // --- Depth tiers: subtle, weighted, "feel depth rather than see movement" ---
  // bg = large/deep backdrop (moves least) · mid = mid florals · fg = small fragments (most).
  // Spread widened so the differential between planes reads as depth (was 0.06/0.13/0.22).
  const tier =
    item.type === "branch" || item.type === "branch-small" || item.type === "interactive-green-ecosystem"
      ? "mid"
      : item.type === "trail" || item.type === "footer-bloom" || item.type === "interactive-pink-particles"
        ? "fg"
        : "bg"
  const SCROLL_MULT = { bg: 0.06, mid: 0.14, fg: 0.28 } as const   // was 0.06/0.13/0.22
  const MOUSE_PX = { bg: 8, mid: 16, fg: 26 } as const              // was 7/14/22
```

- [ ] **Step 3: Tighten mid-tier masks so silhouettes hold**

In `components/cosmic/floating-svgs.tsx`, find the `maskImage` block (lines 224-235) and replace:

```tsx
  // Radial masks feather rectangular images into soft cosmic forms.
  // MID tiers tightened (larger solid core) so silhouettes hold and read as a distinct plane.
  let maskImage: string | undefined = "radial-gradient(circle at center, black 15%, transparent 60%)"
  if (item.type === "nebula-glow") {
    maskImage = undefined
  } else if (item.type === "galaxy") {
    maskImage = "radial-gradient(circle at center, black 25%, transparent 65%)"   // FAR (unchanged)
  } else if (item.type === "river" || item.type === "orbital") {
    maskImage = "radial-gradient(circle at center, black 28%, transparent 62%)"   // MID tightened (was 20%)
  } else if (item.type === "flower-deep") {
    maskImage = "radial-gradient(circle at center, black 20%, transparent 70%)"   // FAR (unchanged)
  } else if (item.type === "branch" || item.type === "branch-small") {
    maskImage = "radial-gradient(circle at center, black 20%, transparent 62%)"   // MID tightened (was 10%)
  }
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: success.

- [ ] **Step 5: Visual verification — plane separation**

Run: `cd /tmp && node /tmp/verify-depth.mjs /tmp/portfolio-shots-task3`
Expected: hero shot now shows the galaxy/nebula (FAR) visibly dimmer/hazier than the branches/rivers (MID), which hold firmer silhouettes. With the foreground motes (Task 2) in front, three depths should now read.

- [ ] **Step 6: Commit**

```bash
git add components/cosmic/floating-svgs.tsx
git commit -m "feat(depth): atmospheric perspective — FAR dim/MID lift, widened parallax spread, tightened mid masks"
```

---

## Task 4: CSS token + reduced-motion hardening

Small clarity change (CSS var for the z-index) and a defensive check that reduced-motion stays clean.

**Files:**
- Modify: `app/globals.css` (add var, reference in comment only — className stays literal for Tailwind)
- Verify: `components/cosmic/blossom-field.tsx` reduced-motion return

- [ ] **Step 1: Add a documented CSS token (clarity; not load-bearing)**

In `app/globals.css`, inside the `:root` block (after the `--space-section` line, ~line 98), add:

```css
  /* Spatial rhythm (8px grid) */
  --space-section: 5rem;

  /* z-index map for the homepage cosmic stack (documented in MOTION_SYSTEM.md).
     The foreground canvas (BlossomField) sits ABOVE content so its motes occlude it. */
  --z-cosmic-void: -10;
  --z-cosmic-far: 0;
  --z-content: 10;
  --z-edge-bloom: 2;
  --z-foreground: 40;
  --z-grain: 50;
```

(This documents the stack in one place. The Tailwind `z-[40]` class on the canvas stays literal — Tailwind v4 doesn't consume arbitrary custom props in `z-[...]`, so this is reference-only.)

- [ ] **Step 2: Confirm reduced-motion returns null**

In `components/cosmic/blossom-field.tsx`, confirm this line still exists and reads (it's the reduced-motion guard, near line 221):

```tsx
  if (prefersReduced) return null
```

Expected: present. (The idle trickle runs only inside the canvas `useEffect`, which returns early under reduced motion via the `if (prefersReduced) return` at line 58. No change needed — this is a verification step.)

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "docs(depth): document cosmic z-index stack as CSS tokens"
```

---

## Task 5: Document the depth tier in MOTION_SYSTEM.md

The spec requires the doc stay accurate. Update the stacking model, add the foreground tier, and add the interaction ladder.

**Files:**
- Modify: `docs/MOTION_SYSTEM.md`

- [ ] **Step 1: Update the stacking model diagram**

In `docs/MOTION_SYSTEM.md`, replace the stacking code block (lines 27-38) with:

```
.curved-paper-bg            z-0    (LayoutShell — paper ground, mostly hidden by the void)
└ .float-content            z-10   (LayoutShell — page content; establishes a stacking context)
   └ <main> bg #07060d
      ├ <ParticleField>     canvas  fixed  -z-10   ← drifting stars (opaque #07060d fill)
      ├ <FloatingSvgs>      fixed   z-0   isolation:isolate
      │   └ 12 cosmic layers, internal z-index -2 … 5  (blend *within* this isolated group)
      │     retuned into FAR (dim, soft) / MID (lifted, firmer mask) planes
      ├ <BlossomField>      canvas  fixed  z-40      ← FOREGROUND: motes occlude content
      │   hover/armed/exit petals + an idle trickle; tone-leans on engagement
      └ page sections       (hero / cards / spotify / ctf / footer; inner content z-10)
.paper-texture::before      z-50   (LayoutShell — film grain, mix-blend-screen)
.lowlight-burn              z-51   (LayoutShell — sensor vignette)
```

- [ ] **Step 2: Add a new section after the BlossomField/particle sections describing the foreground tier**

In `docs/MOTION_SYSTEM.md`, add this new section (after the existing "Particle field" section, before "Compositing treatment"):

```markdown
## Foreground mote tier (`components/cosmic/blossom-field.tsx`, z-40)

The single structural change that turns the scene from a flat backdrop into an
immersive space: the petal canvas was bumped from `z-1` to `z-40`, so its motes
now render **in front of** content (card edges, gaps) — real occlusion, the cue
the brain reads as depth. The canvas is otherwise unchanged: one 2D context,
sprite-cached blobs, `globalCompositeOperation = "lighter"`, 60fps cap, tab-hidden
pause, `prefers-reduced-motion` → `null`.

**Two mote streams share the one loop:**
1. *Hover petals* (background behaviour, retained) — spawned on hover, ambient alpha.
2. *Foreground motes* (`fg: true`) — sparser, slower, brighter; drift along viewport edges
   and section gaps (never parked over text). Carry the largest parallax of any tier.

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
```

- [ ] **Step 3: Update the "Atmospheric perspective" note in the cosmic-layers section**

In `docs/MOTION_SYSTEM.md`, update the base-opacity table note. Find the sentence after the cosmic-layers table (around line 71) and append:

```markdown
The 12 layers are retuned into two depth planes: **FAR** (nebula, galaxy, flower-deep —
dimmed ×0.7, softer masks → distant haze) and **MID** (river, orbital, branch, branch-small,
green-ecosystem — lifted ×1.15, tighter masks so silhouettes hold → the reachable middle).
Parallax spread widened (mouse 8/16/26px, scroll 0.06/0.14/0.28×) so the plane differential
reads as depth. The nearest plane (FOREGROUND) is carried by the BlossomField canvas above.
```

- [ ] **Step 4: Commit**

```bash
git add docs/MOTION_SYSTEM.md
git commit -m "docs(depth): document foreground z-40 tier, intensity ladder, FAR/MID planes"
```

---

## Task 6: Final verification — build, screenshots, reduced-motion, performance sanity

**Files:**
- None modified. Verification only.

- [ ] **Step 1: Clean build**

Run: `pnpm build`
Expected: success, no warnings about the modified files.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no new errors in the modified files. (Pre-existing unrelated warnings are acceptable.)

- [ ] **Step 3: Capture AFTER screenshots**

Run: `cd /tmp && node /tmp/verify-depth.mjs /tmp/portfolio-shots-after`
Expected: 5 files. Compare against `/tmp/portfolio-shots-before/`:
- `01-hero-desktop-idle.png`: sparse foreground motes now drift in front of card edges (occlusion). FAR (galaxy/nebula) visibly dimmer than MID (branches).
- `02/03-hover-*.png`: denser foreground, tone-leaning (green/pink).
- `04/05-scrolled-*.png`: foreground thinned over the dense zones; parallax spread visible.

- [ ] **Step 4: Reduced-motion smoke test**

In `/tmp/verify-depth.mjs`, temporarily change the context line to emulate reduced motion:
```js
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});
```
Run: `cd /tmp && node /tmp/verify-depth.mjs /tmp/portfolio-shots-reduced`
Expected: foreground motes absent (canvas returns `null`), cosmic layers static. **Revert** the `reducedMotion` line afterward (it's a throwaway file, but keep it clean for reuse).

- [ ] **Step 5: Performance sanity check (manual, no automation)**

With the dev server running, open the homepage in a real browser, open DevTools → Performance, record 5s while idle then while hovering both cards. Confirm:
- No sustained 60fps+ main-thread work when idle (trickle should be ~20fps canvas draws).
- No "forced reflow" / layout warnings from the modified files.
- Tab-hidden: the canvas pauses (check `requestAnimationFrame` count drops).

This is the CPU-flat guarantee from the perf contract.

- [ ] **Step 6: Final commit (if any revert/cleanup needed)**

If the reduced-motion test reverted cleanly and all checks pass, no commit needed (verification only). If you fixed anything, commit with `fix(depth): ...`.

---

## Self-Review

**1. Spec coverage:**
- Foreground tier z-40 occlusion → Task 2 ✓
- Reuse BlossomField canvas, no new DOM/animation system → Task 2 (one canvas, one loop) ✓
- Atmospheric perspective FAR/MID/FG (opacity + mask, no blur) → Task 3 ✓
- Parallax spread 8/16/26, 0.06/0.14/0.28 → Task 3 Step 2 ✓
- Intensity ladder (idle/hover/armed/exit) → Task 2 Step 7 ✓
- Idle trickle ~6 @ 20fps → Task 2 Steps 7 & 9 ✓
- ARM ripple ~10 motes → Task 2 Step 5 ✓
- Exit acceleration `size += 0.7` → Task 2 Step 7 ✓
- Scroll thinning over dense zones → Task 2 Step 7 ✓
- Cursor parallax largest on FG (~26px) → Task 3 Step 2 ✓ (carried by BlossomField being the fg tier; mouse parallax in FloatingSvgs governs the image layers)

**2. Placeholder scan:** No TBD/TODO; every step has concrete code.

**3. Type consistency:** `armedSide` prop flows `page.tsx` → `BlossomField`; `armedRef`/`rippleRef`/`lastFgSpawn` declared before use; `Mote.fg`/`Mote.ripple` added in Task 2 Step 3 and used in Step 7 consistently; `FLATTEN`/`COLORS`/`CAP`/`sprite` all pre-existing and unchanged in signature.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-18-immersive-depth.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — I execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
