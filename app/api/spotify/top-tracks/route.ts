import { cacheControl, getTopTracks, normalizeSpotifyTrack } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const response = await getTopTracks()
    const data = await response.json()

    const tracks = (Array.isArray(data?.items) ? data.items : []).flatMap((track: unknown) => {
      const normalizedTrack = normalizeSpotifyTrack(track)
      return normalizedTrack ? [normalizedTrack] : []
    })

    return Response.json(
      { tracks },
      { headers: { "Cache-Control": cacheControl(3600) } }
    )
  } catch (error) {
    console.error("Spotify top tracks failed", error)
    return Response.json(
      { tracks: [] },
      { headers: { "Cache-Control": cacheControl() } }
    )
  }
}
