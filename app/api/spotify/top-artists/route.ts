import { cacheControl, getTopArtists } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const response = await getTopArtists()
    const data = await response.json()

    const artists = (Array.isArray(data.items) ? data.items : []).map(
      (artist: {
        name: string
        genres?: string[]
        images?: { url: string }[]
        external_urls?: { spotify?: string }
      }) => ({
        name: artist.name,
        genres: (artist.genres ?? []).slice(0, 2),
        imageUrl: artist.images?.[0]?.url,
        url: artist.external_urls?.spotify,
      })
    )

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
