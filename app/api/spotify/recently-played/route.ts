import { cacheControl, getRecentlyPlayed, normalizeSpotifyTrack } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const response = await getRecentlyPlayed()
    const data = await response.json()

    const tracks = (Array.isArray(data?.items) ? data.items : []).flatMap((item: { track?: unknown; played_at?: unknown }) => {
      const normalizedTrack = normalizeSpotifyTrack(item?.track)
      if (!normalizedTrack) return []
      return [{
        ...normalizedTrack,
        playedAt: typeof item?.played_at === "string" ? item.played_at : "",
      }]
    })

    return Response.json(
      { tracks },
      { headers: { "Cache-Control": cacheControl() } }
    )
  } catch (error) {
    console.error("Spotify recently played failed", error)
    return Response.json(
      { tracks: [] },
      { headers: { "Cache-Control": cacheControl() } }
    )
  }
}
