# Design Review & Ultra Plan — som.chandra portfolio

A full design + architecture review of the portfolio, with a deep design system
plan and a phased execution roadmap. The goal: take this from "very good personal
site" to **award-tier** (Awwwards / FWA caliber) while keeping it unmistakably
*Som's* — nerdy, hand-built, and never looking AI-generated.

> Reviewed surface: `app/page.tsx`, `app/nerdy/page.tsx`, `app/creative/*`,
> `components/*`, `app/globals.css`, `styles/globals.css`, `lib/pretext.ts`,
> `app/api/spotify/*`, `package.json`.

---

## 0. North star

One sentence to design against:

> **Two worlds, one person.** A terminal and a sketchbook, run by the same brain
> at 3 AM — and the site should make you *feel* the switch between them.

Everything below serves that. The concept already exists ("pick a side"); it's
just under-committed. Award juries reward a single strong idea executed with
restraint and follow-through — not more features.

---

## 1. What's working — protect these

These are the load-bearing "made by a human" signals. A redesign must not sand
them off:

- **Dual-personality split** — `som` (creative, pink `#f0c6cf`) vs `0xs0m`
  (nerdy, green `#7fb07f`), with the morphing name in the hero.
- **Intentional-typos-with-roast** system (`app/creative/page.tsx`) — deeply
  personal, impossible to mistake for AI.
- **`rebots.txt` easter egg** and the chaotic-terminal voice.
- **`@chenglou/pretext` text measuring** (`lib/pretext.ts`) for tight highlight
  backgrounds and stable container sizing — genuine craft almost nobody ships.
- **Live Spotify** (now-playing / top / recent) — proof-of-life.
- **Paper + tape + grain + terminal** hybrid; the brutalist `3px 3px 0` card
  shadow; the `TextMorph` character blur.

**Rule for the whole redesign:** refine and systematize these; never replace them
with something more generic.

---

## 2. The core diagnosis

The site's problem is not taste — it's **discipline and follow-through**:

1. **The two worlds look the same.** Once inside `/nerdy` vs `/creative`, both are
   identical dark-gray `paper-card` layouts. The concept promises two universes
   and delivers one skin twice.
2. **Hardcoded hex everywhere** (hundreds of `#e8e8e8`, `#666`, `#333`…) makes the
   accent system impossible to evolve — so the worlds *can't* diverge cheaply.
3. **Homogeneous motion + uniform typography** read as "nice template," not
   "designed."
4. **Generic cyberpunk neon CSS** is the single most AI/templatey artifact in the
   repo and clashes with the tasteful paper aesthetic.

Fixing #2 first unlocks #1. The rest is contrast and restraint.

---

## 3. DEEP DIVE — Design system

### 3.1 Design tokens (the foundation for everything else)

Today colors are literals scattered across every file. Replace with a tokenized
system in `app/globals.css`, then reference tokens — never raw hex — in components.

```css
:root {
  /* Ink ramp (shared neutral spine) */
  --ink-900: #0a0a0a;  /* page bg            */
  --ink-850: #0e0e0e;  /* raised bg          */
  --ink-800: #111111;  /* card bg            */
  --ink-700: #1a1a1a;  /* muted surface      */
  --ink-600: #2a2a2a;  /* border             */
  --ink-500: #444444;  /* hairline / ring    */
  --ink-400: #6b6b6b;  /* muted text (AA-safe, was #666) */
  --ink-300: #8a8a8a;  /* secondary text     */
  --ink-200: #bbbbbb;  /* body               */
  --ink-100: #e8e8e8;  /* primary text       */

  /* Per-world accents */
  --accent-nerdy: #7fb07f;       /* terminal green  */
  --accent-nerdy-dim: #4f6e4f;
  --accent-creative: #f0c6cf;    /* darkroom pink   */
  --accent-creative-dim: #a98088;

  /* Active accent — set per route on a wrapper element */
  --accent: var(--accent-creative);
  --accent-dim: var(--accent-creative-dim);
}

[data-world="nerdy"]    { --accent: var(--accent-nerdy);    --accent-dim: var(--accent-nerdy-dim); }
[data-world="creative"] { --accent: var(--accent-creative); --accent-dim: var(--accent-creative-dim); }
```

Then a component reads `text-[var(--ink-300)]` / `text-[color:var(--accent)]`
instead of `text-[#888]`. Set `data-world` on the page wrapper (or the layout for
`/nerdy` and `/creative` subtrees) and the entire surface re-themes for free.

**Why it matters:** this is the single highest-leverage change. It is the
prerequisite for the two worlds diverging (3.4), and it kills the maintainability
problem in one pass.

**Migration aid:** a one-off codemod mapping the ~8 most common hex values to
tokens gets ~90% of the way; eyeball the rest.

### 3.2 Type scale — introduce real contrast

Right now nearly everything is `font-bold tracking-tight` at adjacent sizes
(`text-xl`→`text-2xl`→`text-3xl`). There is no display moment. Award typography
lives on *dramatic* scale jumps and a clear voice split.

Adopt a fixed modular scale (≈1.25 ratio) and assign **semantic roles**:

| Role           | Size (desktop)     | Font            | Use                                   |
|----------------|--------------------|-----------------|---------------------------------------|
| `display`      | `clamp(3rem,8vw,6rem)` | Space Grotesk 700 | hero name only — make it *huge*   |
| `h1`           | 2.25rem            | Space Grotesk 700 | section openers                    |
| `h2`           | 1.5rem             | Space Grotesk 600 | card titles                        |
| `body`         | 1rem / 1.6         | Space Grotesk 400 | prose                              |
| `label`        | 0.7rem, 0.22em tracking, uppercase | Geist Mono | the "system voice" eyebrows |
| `code/meta`    | 0.75rem            | Geist Mono      | timestamps, paths, `$ cmd`         |

**Voice rule:** Geist Mono = *the machine talking* (labels, paths, metadata,
`> whoami`). Space Grotesk = *Som talking* (headlines, prose). Use that split
deliberately and consistently — it reinforces the two-worlds idea at the
character level.

The hero name (`app/page.tsx`) should jump to `display` size and become the
unambiguous focal point. Right now at `text-6xl` it competes with three rotating
text elements (see 3.5).

### 3.3 Spacing, grid, rhythm

- Standardize on an **8px spatial grid**; today padding is ad hoc
  (`p-5 md:p-7`, `p-7 md:p-9`, `py-3.5`, `py-14`…). Define section rhythm tokens
  (`--space-section: 5rem` etc.).
- Keep the `max-w-5xl` / `max-w-4xl` containers, but make the **two worlds use
  different grid logic** (3.4): nerdy = tight, columnar, terminal; creative =
  looser, asymmetric, gallery-led.
- Replace repeated inline `border-t border-[#333]` section dividers with one
  `<SectionRule>` component so spacing/treatment is consistent and themeable.

### 3.4 ⭐ The differentiator — make the two worlds genuinely distinct

This is the headline design move and the thing most likely to win attention. The
moment a visitor crosses from `/nerdy` to `/creative` it should feel like a
*temperature change*, not a route change. Concretely:

**Nerdy world — "the terminal"** (`data-world="nerdy"`)
- Accent: green. Background: pure `--ink-900`, denser.
- Mono-forward: section eyebrows, the link bunker, experience meta all lean into
  the `$ command` framing you already started (`$ whoami --everywhere`,
  `$ cat resume.txt`).
- Layout: tighter vertical rhythm, a subtle left "gutter" line like a code editor,
  monospaced alignment. Optional: a thin top status-bar strip (like tmux) showing
  THM rank / now-playing as `[ ♪ track ]`.
- Motion: typing/caret reveals, not soft fades. One restrained blinking caret.
- Signature interaction: section headers "type in" on first view.

**Creative world — "the darkroom / sketchbook"** (`data-world="creative"`)
- Accent: pink. Background: `--ink-900` with *more* paper grain + a faint
  `lowlight-burn` vignette (you already wrote `.lowlight-burn` — it's barely used).
- Space-Grotesk forward, larger, airier, **asymmetric** layout. Let images break
  the grid.
- Motion: develop-in (photo "exposes" from dark), gentle rotation on cards like
  prints on a table. The tape strips and scribble underline belong here.
- Signature interaction: the existing nav image-reveal on hover is good — push it
  further (slight scatter, film-frame border, caption typed underneath).

**Shared spine:** same ink ramp, same grain engine, same footer voice — so it's
clearly one site. Only accent, type emphasis, layout density, and motion language
diverge. The home "pick a side" then becomes a true threshold between two designed
spaces.

### 3.5 Hero — one focal motion, not three

`app/page.tsx` currently runs **three** simultaneous auto-rotators:
`heroLines` (3s), `funFacts` (2.2s), and the `PretextHighlight`. That's busy and
slightly gimmicky.

Plan:
- Keep the **morphing name** (`TextMorph`) as the star — at `display` size.
- Keep **one** rotating line (the `PretextHighlight` highlight is the most
  distinctive — keep that, drop the separate `// funFacts` ticker or merge it in).
- Make the name↔`pick a side` relationship the primary choreography: hovering a
  side already recolors the name (great) — lean into that as *the* hero
  interaction and quiet everything else.
- Give the hero a real **scroll-driven** moment (you have `useScroll` already):
  e.g. the divider line draws and the two cards parallax in.

### 3.6 The loader — respect the visitor

`components/loader.tsx` gates first paint for ~5s (4 messages × 1s + 1s name).
Charming once; friction forever, and bad for SEO/first paint (see 4.3).

Plan:
- Cut total to **≤2.2s**; show 1–2 messages max, then the name reveal.
- Make it **skippable** (click / key / `Esc`), and skip entirely under
  `prefers-reduced-motion`.
- Keep the `sessionStorage` "seen" gate (already there) and the reload reset.
- Optional award-y touch: tie the progress dots to *actual* font/asset readiness
  rather than fixed timers.

### 3.7 Motion language — variety + restraint + a11y

- Today every section uses the same `fadeUp` (`opacity` + `y:20`). Define a small
  **motion vocabulary** instead: `rise` (prose), `develop` (creative images),
  `type` (nerdy headers), `settle` (cards with the spring you already use in
  `paper-card`). Assign per context, don't apply one everywhere.
- Add **`prefers-reduced-motion`** globally — currently absent. Gate framer-motion
  variants behind a `useReducedMotion()` hook and disable infinite loops
  (`float-slow`, `tape-wiggle`, blinking, neon pulses) when set. Juries and
  recruiters check this.
- Add **pause/idle** for auto-rotators (stop cycling on hover/focus, and when tab
  is hidden).

### 3.8 Remove the cyberpunk neon cruft

`app/globals.css` defines `neonPulse`, `borderGlow`, `trailEdge`, `cornerPulse`,
`neon-border`, `neon-edge-h/v`, `neon-corner`, `edgePulseH/V`. This is the most
"generic AI hacker theme" thing in the codebase and fights the paper aesthetic.

Plan: delete them. If you want a terminal signal in the nerdy world, replace with
**one** restrained motif (a single caret blink, or a faint scanline on the nerdy
status bar) — used once, on purpose.

### 3.9 Show the work

For a photographer/sketcher, the homepage is 100% text + Spotify; no real visual
work appears until two clicks deep. Surface **one or two real frames** on the home
hero's creative card (or a thin strip below the fold) so the craft is visible
immediately.

### 3.10 Micro-craft checklist (the 1% that reads as "award")

- Custom **focus-visible** rings in `--accent`, not browser default.
- Custom **text selection** per world (you have a global one; make it accent-aware).
- **Caption typography** in galleries: monospaced meta, italic human caption.
- Consistent **hover physics** (you have a nice spring; apply it as the one true
  hover, retire ad-hoc `transition-colors` mixes).
- A **404 / not-found** in-voice (you have the `rebots.txt` energy — use it).
- Optional **view-transitions** between home → world for a designed threshold.

---

## 4. Architecture & engineering plan

### 4.1 Kill dead weight
- **Delete `styles/globals.css`** — it's the stock shadcn *light* theme and
  conflicts with the real `app/globals.css`. Confirm nothing imports it.
- **Prune unused UI deps.** ~30 `@radix-ui/*` packages + the entire
  `components/ui/` (57 files) appear unused (everything is hand-rolled). Remove
  what's unimported. Smaller bundle, less generated-scaffold smell. (Audit with
  `depcheck` / `knip` before deleting.)

### 4.2 Tokenize colors
Per 3.1 — the engineering half of the design foundation. Land this before any
visual rework.

### 4.3 Server-render static content
- Home/nerdy/creative are all `"use client"`, and `LayoutShell` does
  `if (!checked) return null` at the root — so first paint is empty and the
  resume/about content (the "hire me" payload) isn't in the initial HTML.
- Plan: split static content (about, experience, projects, skills, certs) into
  **server components**; mount client islands only where motion/interactivity is
  needed. Don't return `null` at the root — render content, overlay the loader.
- Net win: SEO, social-card scraping, faster FCP, better Lighthouse.

### 4.4 SEO / metadata / discoverability
- Per-route `generateMetadata` with real titles/descriptions (current global is
  `title: "hey, it's som"`, `description: "a pretty corner over internet"`).
- **OG image** (a designed card per world) — biggest "share looks pro" win.
- **`app/sitemap.ts`** + fix `public/robots.txt` (it points at placeholder
  `https://yoursite.com/sitemap.xml`; the `rebots.txt` easter egg copies that bug).
- **JSON-LD `Person`** schema (name, role, sameAs socials) for rich results.
- Set canonical URL / `metadataBase`.

### 4.5 Résumé + contact
The nerdy page literally says "wanna hire me?" yet there's no résumé download or
prominent contact CTA. Add a **`/resume.pdf` download** button and a clear primary
contact action (mailto is fine, styled as the main CTA).

### 4.6 Images & performance
- Switch raw `<img>` → **`next/image`** with responsive `sizes` across galleries
  and Spotify artwork (`components/spotify-artwork.tsx`, `photo-card.tsx`,
  `gallery-page.tsx`, the hero previews in `app/creative/page.tsx`).
- Compress gallery assets (clicks/doodling were multi-MB like the removed
  sidequest set). Target ≤300KB/large image; generate AVIF/WebP.
- Lazy-load below-fold sections; keep framer-motion off the critical path where
  possible.

### 4.7 Accessibility pass
- Contrast: lift `--ink-400`/`#666`/`#555`/`#444` body text to ≥4.5:1 on
  `--ink-900` (the new ramp in 3.1 already nudges `#666`→`#6b6b6b`; verify each).
- `prefers-reduced-motion` (3.7).
- Focus-visible everywhere; ensure the name toggle, gallery lightbox, and
  auto-rotators are keyboard operable and announce sensibly.
- Real `alt` text on gallery images (currently generic).

### 4.8 Code structure tidy-ups
- One `<SectionRule>`, one `<SectionHeader>` (eyebrow + title + aside) component —
  the pattern is copy-pasted across all four pages.
- A `useWorld()` hook / layout that sets `data-world` so accent theming is
  declarative.
- Keep `lib/pretext.ts` — it's a feature, not debt. Just make sure its client-only
  nature doesn't block server rendering of text (render measured enhancements as
  progressive, not required).

---

## 5. Phased roadmap (execution order matters)

### Phase 0 — Foundation *(do first; unblocks everything)*
1. Delete `styles/globals.css`; audit + prune unused `ui/` + Radix deps.
2. Tokenize the ink ramp + per-world accents in `app/globals.css` (3.1).
3. Codemod hex → tokens across `app/**` and `components/**`.
4. Add `prefers-reduced-motion` plumbing (`useReducedMotion`) and a motion-vocab
   helper.
**Exit:** zero raw hex in components; `data-world` switches accent globally; no
dead CSS file; reduced-motion respected. Visual output unchanged.

### Phase 1 — Architecture & correctness
5. Server-render static content; stop returning `null` at root (4.3).
6. Metadata + OG images + sitemap + robots fix + JSON-LD (4.4).
7. Résumé download + primary contact CTA (4.5).
8. `next/image` migration + asset compression (4.6).
9. Contrast + focus + alt-text a11y pass (4.7).
**Exit:** Lighthouse ≥95 across the board; valid OG cards; résumé downloadable.

### Phase 2 — The differentiator (design payoff)
10. Build `SectionHeader` / `SectionRule` and the `useWorld` layout.
11. Implement the **type scale** + voice split (3.2) and 8px rhythm (3.3).
12. Diverge the two worlds: nerdy = terminal, creative = darkroom (3.4),
    including per-world motion language.
13. Tighten the hero to one focal motion + scroll choreography (3.5).
14. Fix the loader (≤2.2s, skippable, reduced-motion aware) (3.6).
**Exit:** crossing home→nerdy→creative feels like three designed spaces;
hero has a single clear focal point.

### Phase 3 — Polish & signature
15. Remove neon cruft; add the one restrained terminal motif (3.8).
16. Surface real visual work on home (3.9).
17. Micro-craft pass: focus rings, selection, captions, 404 in-voice, optional
    view-transitions (3.10).
**Exit:** the 1% details that make a jury stop scrolling.

---

## 6. Acceptance criteria (definition of "done")

- **Concept:** the two worlds are visually distinct yet obviously one site.
- **Color:** no raw hex in components; theme switches via `data-world`.
- **Type:** a clear display→label scale with a deliberate mono/sans voice split.
- **Motion:** varied, intentional, and fully `prefers-reduced-motion` safe.
- **Perf/SEO:** SSR'd content, Lighthouse ≥95, valid OG + sitemap + JSON-LD.
- **Hire-ability:** résumé download + obvious contact CTA.
- **A11y:** WCAG AA contrast, keyboard-operable, real alt text, visible focus.
- **Personality intact:** typos+roast, rebots.txt, pretext, Spotify, paper/tape —
  all preserved and sharpened.

---

## 7. Risks / watch-outs

- **Don't over-correct into minimalism.** The charm is the clutter-with-intent;
  systematize it, don't sterilize it.
- **`pretext` is client-only** — keep its enhancements progressive so SSR isn't
  blocked.
- **Pruning deps:** verify with `knip`/`depcheck` before removing `ui/`; a few may
  be imported indirectly.
- **Asset compression** is the highest-effort/highest-reward perf item — batch it.

---

*Prepared as a planning document. No application code has been changed by this
review. Recommended starting point: Phase 0, item 2 (tokenize colors) — nothing
else is clean until that lands.*
