# GitHub Contributions Graph — `/nerdy` "github, lately" (design)

## Overview

The `/nerdy` page has a small **"github, lately"** block — three `.paper-card` chips
(commits this year · public repos · followers), fed by the public REST API in
`app/api/github/route.ts`, rendered by `components/github-stats.tsx`, fails-soft.

This adds a **monthly contributions graph** below the chips: a row of **12 vertical
block-bars** (one per month, rolling last 12 months) in the terminal-green CRT aesthetic,
plus a one-line **summary** (peak month + streak). The goal is a distinctive, on-brand
"bar graph in blocks" — not a GitHub heatmap clone.

**Constraints:** keep the design system (Space Grotesk / Geist Mono, sharp corners,
`#7fb07f` nerdy accent, `.paper-card`); no star counts; fail soft; transform/opacity-only
motion; reduced-motion + mobile safe. Scope is the `/nerdy` GitHub section only.

## Data

The graph needs the **contributions calendar** (per-day counts, last 12 months). Added to
the existing `GET /api/github` so the page keeps **one** SWR call + one cache.

**Source (two paths, graceful):**
- **Primary — GitHub GraphQL** (when `process.env.GITHUB_TOKEN` is set): one POST to
  `https://api.github.com/graphql` for
  `user(login).contributionsCollection(from,to).contributionCalendar.weeks[].contributionDays[] { date, contributionCount }`,
  `from` = ~1 year ago, `to` = now. This is the exact metric behind GitHub's green graph
  (commits + PRs + issues + reviews). GraphQL **requires auth even for public data** — any
  no-scope PAT works. (Production sets a token, so this is the prod path.)
- **Fallback — no token** (local / token absent): GET a public contributions endpoint
  (`https://github-contributions-api.jogruber.de/v4/Somchandra17?y=last`) → `{ contributions: [{ date, count }] }`.
- If **both** fail → return `contributions: null` and the graph hides (chips unaffected).

**Server-side derivation** (so the client gets ready-to-render data, raw days stay server-side):
- **Monthly buckets:** group days by `YYYY-MM`, sum counts, take the **last 12 months**
  ending the current month → `months: [{ key: "YYYY-MM", label: "J"|"Jan", count }]` (12 items, oldest→newest).
- **Peak:** the month with the max count → `peak: { label, count }`.
- **Streaks** (from the daily series, ascending): `longestStreak` = longest run of days with
  `count > 0`; `currentStreak` = trailing run of `count > 0` ending today (or yesterday).
- **Total:** `totalContributions` (sum over the window), for an optional label.

**Response shape** (added to the existing stats object):
```ts
contributions: {
  months: { key: string; label: string; count: number }[]   // 12, oldest → newest
  peak: { label: string; count: number }
  longestStreak: number
  currentStreak: number
  total: number
} | null
```
Existing fields (`commitsThisYear`, `publicRepos`, `followers`, `year`) are unchanged — the
**"commits in {year}" chip stays real commits**; the graph is labeled **"contributions."**
Cache stays `s-maxage=3600`.

## The graph (`components/github-graph.tsx` — new)

A focused presentational component: `GithubGraph({ data }: { data: Contributions })`. No
fetching of its own — `github-stats.tsx` owns the one SWR call and passes `data.contributions`.

**Block-bars:**
- 12 columns in a flex row (`gap`), bottom-aligned, with a faint baseline rule.
- Each column is a fixed ladder of **`LEVELS` cells** (e.g. 7) stacked bottom-up; **filled =
  `round(count / max * LEVELS)`** (min 1 cell when `count > 0`, 0 when none). Filled cells =
  terminal green (`#7fb07f`, optionally brighter toward the top); empty = faint (`#1a1a1a`).
  Square-ish cells, 1–2px gaps → the "blocks" look.
- Month **initial** below each column (`J F M A …`); the 3-letter name on `sm+`.
- **Interaction:** hover/focus a column → its exact count shows (small tooltip or a shared
  readout line). Touch-friendly (tap shows it).

**Summary line** (mono, under the bars): e.g. `peak: nov · 134 · longest streak 12d` with the
numbers in the green accent. Built from `peak` / `longestStreak` (+ `currentStreak` if nonzero).

**Motion:** on `whileInView`, columns **grow up** (`scaleY 0→1`, `transformOrigin:bottom`, or
per-cell opacity) **staggered** by index (~30ms). Transform/opacity only. **Reduced motion →
static** (full bars, no grow-in), gated by `useReducedMotion`.

## Section layout (`components/github-stats.tsx`)

Unchanged wrapper + header (`github, lately`) → the 3 stat chips (as today) → **`<GithubGraph>`**
→ summary line. The component renders the graph only when `data.contributions?.months` has a
nonzero total; otherwise just the chips (independent fail-soft). Whole section still returns
`null` if even the chips have no data.

## Robustness & mobile

- **Fail soft, independently:** chips and graph each hide on missing data; no thrown errors.
- **No new heavy deps** — bars are divs/CSS (no chart lib).
- **Mobile:** 12 columns shrink to fit `max-w-4xl` content width; if too tight at 320–390px,
  the bar row scrolls horizontally inside an `overflow-x-auto` wrapper (page never overflows).
- **A11y:** the graph has an `aria-label` summary (e.g. "monthly GitHub contributions, last 12
  months"); decorative cells `aria-hidden`. No star counts anywhere.

## Files

| File | Change |
|---|---|
| `app/api/github/route.ts` | Add contributions fetch (GraphQL if token, else no-token fallback) + monthly/peak/streak derivation; extend response with `contributions`. |
| `components/github-graph.tsx` | **New** — the 12 monthly block-bars + summary line + grow-in motion. |
| `components/github-stats.tsx` | Render `<GithubGraph>` below the chips; pass `data.contributions`. |
| `DESIGN.md` §6.1 | Document the contributions graph. |

**Out of scope:** the home/cosmic work, other `/nerdy` sections, the stat chips' data, star
counts, a daily heatmap, the 3D "skyline" view.

## Verification

- `pnpm build` + `pnpm lint` clean.
- Preview `/nerdy`: the 12 monthly block-bars render under the chips in terminal green, month
  labels correct, summary line shows peak + streak; bars **grow in** on scroll, **static**
  under reduced motion.
- **No token** (local): fallback path populates the bars (or graph hides if the fallback is
  down) — chips still show.
- **Token set:** GraphQL path matches the real contribution counts.
- Mobile 320/390px: no horizontal page overflow (bar row scrolls within its own wrapper if needed).
- Fail-soft: with `contributions: null`, only the chips render; no console errors.
