# GitHub Contributions Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-06-19-github-contributions-graph-design.md`](../specs/2026-06-19-github-contributions-graph-design.md)

**Goal:** Add a monthly contributions block-bar graph (+ peak/streak summary) under the `/nerdy` "github, lately" chips.

**Architecture:** Extend the existing `GET /api/github` to also return a derived `contributions` object (12 monthly buckets + peak + streaks), sourced from the GitHub GraphQL contributions calendar when `GITHUB_TOKEN` is set, falling back to a public no-token endpoint. A new presentational `components/github-graph.tsx` renders 12 terminal-green block-bars (grow-in on scroll) + a mono summary line; `github-stats.tsx` owns the single SWR call and passes the data down.

**Tech Stack:** Next.js 16 route handler, React 19, TypeScript, Framer Motion, Tailwind v4, SWR. No unit-test runner — verification is `pnpm build` + `pnpm lint` + hitting `/api/github` + the Claude Preview MCP tools.

## Global Constraints

- **Design system unchanged** — Geist Mono labels, sharp corners (`--radius:0`), nerdy accent `#7fb07f`, `.paper-card` chips. No restyle of the existing chips.
- **No star counts** anywhere.
- **Fail soft** — chips and graph hide independently on missing data; never throw to the client.
- **Animate `transform` + `opacity` only**; **reduced-motion → static** (gated by `useReducedMotion`).
- **Mobile safe** — no horizontal *page* overflow (the bar row scrolls within its own `overflow-x-auto` wrapper if needed).
- **Env var name is `GITHUB_TOKEN`** (already read by the route); server-only, never `NEXT_PUBLIC_`.
- **Metric = contributions** (commits + PRs + issues + reviews); the existing "commits in {year}" chip stays real commits.
- **Scope:** the `/nerdy` GitHub section only. Don't touch home/cosmic, other sections, or the chips' data.
- Commit messages use `feat(...)` / `docs(...)` style with **no Claude/Anthropic attribution trailer**.
- Framer change → verify on a freshly (re)loaded page; if motion looks frozen, the automation tab is backgrounded (rAF paused), not a bug.

---

### Task 0: Baseline

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `pnpm build`
Expected: completes, no errors.

- [ ] **Step 2: Clean lint**

Run: `pnpm lint`
Expected: no errors (engine warning OK).

- [ ] **Step 3: Before-shot**

Start the preview (`preview_start` name `next-dev`; keep the `serverId`). Load `/nerdy`, scroll to the "github, lately" block, `preview_screenshot`.
Expected: the 3 chips render; no graph yet. Save as the before-shot.

---

### Task 1: Contributions data in the API route

**Files:**
- Modify: `app/api/github/route.ts` (full rewrite below — adds the contributions fetch + derivation + response field)

**Interfaces:**
- Produces: `GET /api/github` JSON now also has
  `contributions: { months: {key:string;label:string;count:number}[]; peak:{label:string;count:number}; longestStreak:number; currentStreak:number; total:number } | null`
  (`months` has 12 entries, oldest→newest). Existing fields unchanged.

- [ ] **Step 1: Rewrite the route**

Replace the entire contents of `app/api/github/route.ts` with:

```ts
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const GITHUB_USER = "Somchandra17"
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function cacheControl(seconds: number) {
  return `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`
}

type Day = { date: string; count: number }

// Pull the contributions calendar (last ~year) as a flat per-day series.
// Primary: GitHub GraphQL (needs GITHUB_TOKEN — auth is required even for public data).
// Fallback: a public no-token contributions endpoint. Returns null if both fail.
async function fetchContributionDays(): Promise<Day[] | null> {
  const token = process.env.GITHUB_TOKEN
  const to = new Date()
  const from = new Date(to.getTime() - 364 * 24 * 60 * 60 * 1000)

  if (token) {
    try {
      const query =
        "query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}"
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "som-portfolio",
        },
        body: JSON.stringify({
          query,
          variables: { login: GITHUB_USER, from: from.toISOString(), to: to.toISOString() },
        }),
        cache: "no-store",
      })
      if (res.ok) {
        const json = await res.json()
        const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks
        if (Array.isArray(weeks)) {
          const days: Day[] = []
          for (const w of weeks) for (const d of w.contributionDays) days.push({ date: d.date, count: d.contributionCount })
          if (days.length) return days
        }
      }
    } catch (e) {
      console.error("GitHub GraphQL contributions failed", e)
    }
  }

  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`, {
      headers: { "User-Agent": "som-portfolio" },
      cache: "no-store",
    })
    if (res.ok) {
      const json = await res.json()
      const arr = json?.contributions
      if (Array.isArray(arr) && arr.length) {
        return arr.map((d: { date: string; count?: number }) => ({ date: d.date, count: d.count ?? 0 }))
      }
    }
  } catch (e) {
    console.error("GitHub contributions fallback failed", e)
  }

  return null
}

function lastTwelveMonthKeys(now: Date): string[] {
  const keys: string[] = []
  for (let i = 11; i >= 0; i--) {
    const m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    keys.push(`${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, "0")}`)
  }
  return keys
}

function deriveContributions(days: Day[], now: Date) {
  const keys = lastTwelveMonthKeys(now)
  const sums: Record<string, number> = {}
  for (const k of keys) sums[k] = 0
  for (const d of days) {
    const k = d.date.slice(0, 7)
    if (k in sums) sums[k] += d.count
  }
  const months = keys.map((k) => ({ key: k, label: MONTHS[parseInt(k.slice(5, 7), 10) - 1], count: sums[k] }))

  let peak = months[0]
  for (const m of months) if (m.count > peak.count) peak = m

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  let longestStreak = 0
  let run = 0
  for (const d of sorted) {
    if (d.count > 0) {
      run++
      if (run > longestStreak) longestStreak = run
    } else {
      run = 0
    }
  }
  let currentStreak = 0
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].count > 0) currentStreak++
    else if (i === sorted.length - 1) continue // today not yet contributed — ignore
    else break
  }

  const total = months.reduce((s, m) => s + m.count, 0)
  return { months, peak: { label: peak.label, count: peak.count }, longestStreak, currentStreak, total }
}

// Public GitHub stats for the nerdy page. No auth required for the chips (an optional
// GITHUB_TOKEN raises the rate limit AND enables the first-party contributions graph).
// Deliberately omits star counts. Fails soft — returns nulls so the client can hide.
export async function GET() {
  const year = new Date().getFullYear()
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "som-portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const [userRes, commitsRes, contributionDays] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers, cache: "no-store" }),
      fetch(
        `https://api.github.com/search/commits?q=author:${GITHUB_USER}+author-date:>=${year}-01-01&per_page=1`,
        { headers, cache: "no-store" }
      ),
      fetchContributionDays(),
    ])

    const user = userRes.ok ? await userRes.json() : null
    const commits = commitsRes.ok ? await commitsRes.json() : null
    const contributions = contributionDays ? deriveContributions(contributionDays, new Date()) : null

    return Response.json(
      {
        commitsThisYear: typeof commits?.total_count === "number" ? commits.total_count : null,
        publicRepos: typeof user?.public_repos === "number" ? user.public_repos : null,
        followers: typeof user?.followers === "number" ? user.followers : null,
        contributions: contributions && contributions.total > 0 ? contributions : null,
        year,
      },
      { headers: { "Cache-Control": cacheControl(3600) } }
    )
  } catch (error) {
    console.error("GitHub stats failed", error)
    return Response.json(
      { commitsThisYear: null, publicRepos: null, followers: null, contributions: null, year },
      { headers: { "Cache-Control": cacheControl(300) } }
    )
  }
}
```

- [ ] **Step 2: Type-check / build**

Run: `pnpm build`
Expected: compiles with no TypeScript errors.

- [ ] **Step 3: Verify the endpoint returns contributions**

With the dev server running, fetch the route and inspect the shape:

Run: `curl -s http://localhost:3000/api/github | python3 -m json.tool`
Expected: JSON with `commitsThisYear`/`publicRepos`/`followers` as before, plus a `contributions` object whose `months` array has **12** entries (each `{key,label,count}`), and numeric `peak`, `longestStreak`, `currentStreak`, `total`. (With `GITHUB_TOKEN` set in `.env.local`, this is the GraphQL path and should match the real graph.)

- [ ] **Step 4: Commit**

```bash
git add app/api/github/route.ts
git commit -m "feat(github): serve monthly contributions (calendar) + peak/streaks from /api/github"
```

---

### Task 2: The block-bar graph component + wire-in

**Files:**
- Create: `components/github-graph.tsx`
- Modify: `components/github-stats.tsx` (import + type + render below chips)

**Interfaces:**
- Consumes: the `contributions` object from Task 1.
- Produces: `export function GithubGraph({ data }: { data: Contributions })` and `export type Contributions`.

- [ ] **Step 1: Create the graph component**

Create `components/github-graph.tsx`:

```tsx
"use client"

import { motion, useReducedMotion } from "framer-motion"

export type Contributions = {
  months: { key: string; label: string; count: number }[]
  peak: { label: string; count: number }
  longestStreak: number
  currentStreak: number
  total: number
}

const LEVELS = 7

export function GithubGraph({ data }: { data: Contributions }) {
  const prefersReduced = useReducedMotion()
  const max = Math.max(1, ...data.months.map((m) => m.count))

  return (
    <div className="mt-5">
      <div
        className="flex items-end gap-1.5 overflow-x-auto pb-1 sm:gap-2"
        role="img"
        aria-label={`Monthly GitHub contributions, last 12 months — ${data.total} total, peak ${data.peak.count} in ${data.peak.label}`}
      >
        {data.months.map((m, i) => {
          const filled = m.count > 0 ? Math.max(1, Math.round((m.count / max) * LEVELS)) : 0
          return (
            <div key={m.key} className="flex shrink-0 flex-col items-center gap-1" title={`${m.label}: ${m.count}`}>
              <span className="h-3 font-mono text-[0.6rem] tabular-nums text-[#666]">{m.count > 0 ? m.count : ""}</span>
              <motion.div
                aria-hidden
                className="flex flex-col-reverse gap-[2px]"
                style={{ transformOrigin: "bottom" }}
                initial={prefersReduced ? false : { scaleY: 0, opacity: 0 }}
                whileInView={prefersReduced ? undefined : { scaleY: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                {Array.from({ length: LEVELS }).map((_, lvl) => (
                  <span
                    key={lvl}
                    className="block h-2.5 w-3 sm:w-4"
                    style={{ backgroundColor: lvl < filled ? "#7fb07f" : "#1a1a1a" }}
                  />
                ))}
              </motion.div>
              <span className="font-mono text-[0.6rem] uppercase text-[#888]">
                {m.label.slice(0, 1)}
                <span className="hidden sm:inline">{m.label.slice(1)}</span>
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 font-mono text-xs text-[#888]">
        peak <span className="text-[#7fb07f]">{data.peak.label.toLowerCase()}</span>
        {" · "}
        <span className="tabular-nums text-[#7fb07f]">{data.peak.count}</span>
        {data.longestStreak > 0 && (
          <>
            {" · longest streak "}
            <span className="tabular-nums text-[#7fb07f]">{data.longestStreak}d</span>
          </>
        )}
        {data.currentStreak > 0 && (
          <>
            {" · current "}
            <span className="tabular-nums text-[#7fb07f]">{data.currentStreak}d</span>
          </>
        )}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Wire it into the stats section**

In `components/github-stats.tsx`, add the import (with the other imports):

```tsx
import { GithubGraph, type Contributions } from "@/components/github-graph"
```

Extend the data type (add the `contributions` field):

```tsx
type GitHubStatsData = {
  commitsThisYear: number | null
  publicRepos: number | null
  followers: number | null
  contributions: Contributions | null
  year: number
}
```

Render the graph after the chips — change the closing of the chips block from:

```tsx
      </div>
    </motion.div>
  )
}
```

to:

```tsx
      </div>
      {data?.contributions && <GithubGraph data={data.contributions} />}
    </motion.div>
  )
}
```

- [ ] **Step 3: Build + lint**

Run: `pnpm build && pnpm lint`
Expected: clean.

- [ ] **Step 4: Visual verify on /nerdy**

Reload `/nerdy` in the preview, scroll to the GitHub block.
- `preview_screenshot`: 12 terminal-green block-bars render under the chips, month initials beneath, the count above each bar, and the `peak … · longest streak …` line below.
- Confirm the bars **grow up** on scroll-in (reload and watch, or `preview_eval` to check a bar's `transform` is non-identity briefly).
Expected: matches the design; chips unchanged above it.

- [ ] **Step 5: Commit**

```bash
git add components/github-graph.tsx components/github-stats.tsx
git commit -m "feat(github): monthly contributions block-bar graph + peak/streak summary"
```

---

### Task 3: Edges, docs, final verification

**Files:**
- Modify: `DESIGN.md` (§6.1 GitHub stats)

**Interfaces:** none new.

- [ ] **Step 1: Reduced-motion check**

Reason from code (the page can't toggle the OS media query): with `useReducedMotion()` true, the bar `motion.div` gets `initial={false}` and **no** `whileInView`, so bars render full/static — no grow-in. Confirm the code path; fix if any animation isn't gated.

- [ ] **Step 2: Mobile overflow check**

`preview_resize` to 390×844, load `/nerdy`, scroll to the graph. `preview_eval`: `document.documentElement.scrollWidth <= window.innerWidth`.
Expected: `true` (the bar row scrolls inside its own `overflow-x-auto` wrapper; the page never overflows). `preview_screenshot` to confirm the bars read well.

- [ ] **Step 3: Fail-soft check**

`preview_eval` to confirm the section still renders the chips if `contributions` is null — e.g. temporarily verify by reasoning: `github-stats.tsx` renders `<GithubGraph>` only when `data?.contributions` is truthy, and the route returns `contributions: null` when both sources fail or total is 0. `preview_console_logs` (level error): no client errors on `/nerdy`.

- [ ] **Step 4: Document in DESIGN.md**

In `DESIGN.md` §6.1 (GitHub stats), add a line describing the monthly contributions block-bar graph (12 bars, last 12 months, contributions metric via GraphQL+token / no-token fallback, peak+streak summary, grow-in motion, fails soft).

- [ ] **Step 5: Final build + lint**

Run: `pnpm build && pnpm lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add DESIGN.md
git commit -m "docs(github): document the monthly contributions block-bar graph"
```

---

## Self-Review

**Spec coverage:**
- Contributions calendar via GraphQL+token, no-token fallback, fail null → Task 1 `fetchContributionDays`. ✓
- 12 monthly buckets (rolling), peak, longest/current streak, total → Task 1 `deriveContributions` / `lastTwelveMonthKeys`. ✓
- Response shape `contributions: {...} | null` → Task 1 GET. ✓ (matches `Contributions` type in Task 2)
- 12 block-bars (ladder of `LEVELS` cells, filled ∝ count), month labels, per-bar count, grow-in staggered, reduced-motion static → Task 2 component. ✓
- Summary line (peak + streaks, green accents) → Task 2 component. ✓
- Section keeps 3 chips, renders graph below only when data present, independent fail-soft → Task 2 wire-in. ✓
- Mobile `overflow-x-auto`, no page overflow → Task 2 markup + Task 3 Step 2. ✓
- A11y `aria-label` summary + `aria-hidden` cells → Task 2. ✓
- No stars; commits chip stays real commits → unchanged in Task 1. ✓
- DESIGN.md doc → Task 3 Step 4. ✓

**Placeholder scan:** No TBD/"handle errors"/"similar to" — full route + component code inline; verification steps give exact commands. ✓

**Type consistency:** `Contributions` (Task 2 export) exactly matches the route's returned `contributions` object (`months[{key,label,count}]`, `peak{label,count}`, `longestStreak`, `currentStreak`, `total`); `github-stats.tsx` imports the type and passes `data.contributions`. Field names (`commitsThisYear`, `publicRepos`, `followers`, `contributions`, `year`) consistent across route and component. ✓
