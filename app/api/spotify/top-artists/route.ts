import { cacheControl, getTopArtists, normalizeSpotifyArtist } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const response = await getTopArtists()
    const data = await response.json()

    const artists = (Array.isArray(data?.items) ? data.items : []).flatMap((artist: unknown) => {
      const normalizedArtist = normalizeSpotifyArtist(artist)
      return normalizedArtist ? [normalizedArtist] : []
    })

    return Response.json(
      { artists },
      { headers: { "Cache-Control": cacheControl(3600) } }
    )
  } catch (error) {
    console.error("Spotify top artists failed", error)
    return Response.json(
      { artists: [] },
      { headers: { "Cache-Control": cacheControl() } }
    )
  }
}
