import { getTopArtists } from "@/lib/spotify"

export const revalidate = 3600

export async function GET() {
  try {
    const response = await getTopArtists()
    const data = await response.json()

    const artists = data.items.map(
      (artist: {
        name: string
        genres: string[]
        images: { url: string }[]
        external_urls: { spotify: string }
      }) => ({
        name: artist.name,
        genres: artist.genres.slice(0, 2),
        imageUrl: artist.images[0]?.url,
        url: artist.external_urls.spotify,
      })
    )

    return Response.json({ artists })
  } catch {
    return Response.json({ artists: [] })
  }
}
