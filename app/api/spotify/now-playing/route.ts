import { getNowPlaying } from "@/lib/spotify"

export const revalidate = 0

export async function GET() {
  try {
    const response = await getNowPlaying()

    if (response.status === 204 || response.status > 400) {
      return Response.json({ isPlaying: false })
    }

    const song = await response.json()

    if (song.currently_playing_type !== "track") {
      return Response.json({ isPlaying: false })
    }

    const isPlaying = song.is_playing
    const title = song.item.name
    const artist = song.item.artists.map((a: { name: string }) => a.name).join(", ")
    const album = song.item.album.name
    const albumImageUrl = song.item.album.images[0]?.url
    const songUrl = song.item.external_urls.spotify

    return Response.json({
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
    })
  } catch {
    return Response.json({ isPlaying: false })
  }
}
