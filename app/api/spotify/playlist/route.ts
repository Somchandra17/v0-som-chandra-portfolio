import { cacheControl, getPlaylistTracks, normalizeSpotifyTrack } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const PLAYLIST_ID = "7fOEf8vDsrfgMMjU9fNiP1"
type PlaylistItem = { added_at?: string; track?: unknown }

export async function GET() {
  try {
    const response = await getPlaylistTracks(PLAYLIST_ID)
    const data = await response.json()

    const tracks = (Array.isArray(data?.items) ? data.items : [])
      .sort(
        (a: PlaylistItem, b: PlaylistItem) =>
          new Date(a?.added_at ?? 0).getTime() - new Date(b?.added_at ?? 0).getTime()
      )
      .reverse()
      .flatMap((item: PlaylistItem) => {
        const normalizedTrack = normalizeSpotifyTrack(item?.track)
        if (!normalizedTrack) return []
        return [{
          ...normalizedTrack,
          addedAt: typeof item?.added_at === "string" ? item.added_at : "",
        }]
      })

    return Response.json(
      { tracks },
      { headers: { "Cache-Control": cacheControl(1800) } }
    )
  } catch (error) {
    console.error("Spotify playlist failed", error)
    return Response.json(
      { tracks: [] },
      { headers: { "Cache-Control": cacheControl() } }
    )
  }
}
