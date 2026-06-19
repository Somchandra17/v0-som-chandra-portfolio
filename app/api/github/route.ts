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
