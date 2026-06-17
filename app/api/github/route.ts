export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const GITHUB_USER = "Somchandra17"

function cacheControl(seconds: number) {
  return `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`
}

// Public GitHub stats for the nerdy page. No auth required (an optional GITHUB_TOKEN just
// raises the rate limit). Deliberately omits star counts. Fails soft — returns nulls so the
// client can hide the section rather than error.
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

    const [userRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers, cache: "no-store" }),
      fetch(
        `https://api.github.com/search/commits?q=author:${GITHUB_USER}+author-date:>=${year}-01-01&per_page=1`,
        { headers, cache: "no-store" }
      ),
    ])

    const user = userRes.ok ? await userRes.json() : null
    const commits = commitsRes.ok ? await commitsRes.json() : null

    return Response.json(
      {
        commitsThisYear: typeof commits?.total_count === "number" ? commits.total_count : null,
        publicRepos: typeof user?.public_repos === "number" ? user.public_repos : null,
        followers: typeof user?.followers === "number" ? user.followers : null,
        year,
      },
      { headers: { "Cache-Control": cacheControl(3600) } }
    )
  } catch (error) {
    console.error("GitHub stats failed", error)
    return Response.json(
      { commitsThisYear: null, publicRepos: null, followers: null, year },
      { headers: { "Cache-Control": cacheControl(300) } }
    )
  }
}
