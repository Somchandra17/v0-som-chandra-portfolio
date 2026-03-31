import { cacheControl, getRecentlyPlayed } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const response = await getRecentlyPlayed()
    const data = await response.json()

    const tracks = data.items.map(
      (item: {
        track: {
          name: string
          artists: { name: string }[]
          album: { name: string; images: { url: string }[] }
          external_urls: { spotify: string }
        }
        played_at: string
      }) => ({
        title: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(", "),
        album: item.track.album.name,
        albumImageUrl: item.track.album.images[0]?.url,
        songUrl: item.track.external_urls.spotify,
        playedAt: item.played_at,
      })
    )

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
