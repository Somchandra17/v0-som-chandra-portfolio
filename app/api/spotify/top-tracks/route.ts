import { getTopTracks } from "@/lib/spotify"

export const revalidate = 3600 // cache for 1 hour

export async function GET() {
  try {
    const response = await getTopTracks()
    const data = await response.json()

    const tracks = data.items.map(
      (track: {
        name: string
        artists: { name: string }[]
        album: { name: string; images: { url: string }[] }
        external_urls: { spotify: string }
      }) => ({
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        albumImageUrl: track.album.images[0]?.url,
        songUrl: track.external_urls.spotify,
      })
    )

    return Response.json({ tracks })
  } catch {
    return Response.json({ tracks: [] })
  }
}
