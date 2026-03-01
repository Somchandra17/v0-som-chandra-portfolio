import { getPlaylistTracks } from "@/lib/spotify"

export const revalidate = 1800 // cache 30 min

const PLAYLIST_ID = "7fOEf8vDsrfgMMjU9fNiP1"

export async function GET() {
  try {
    const response = await getPlaylistTracks(PLAYLIST_ID)
    const data = await response.json()

    const tracks = (data.items || [])
      .sort(
        (a: { added_at: string }, b: { added_at: string }) =>
          new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
      )
      .map(
        (item: {
          added_at: string
          track: {
            name: string
            artists: { name: string }[]
            album: { name: string; images: { url: string }[] }
            external_urls: { spotify: string }
          }
        }) => ({
          title: item.track.name,
          artist: item.track.artists.map((a) => a.name).join(", "),
          album: item.track.album.name,
          albumImageUrl: item.track.album.images[0]?.url,
          songUrl: item.track.external_urls.spotify,
          addedAt: item.added_at,
        })
      )

    return Response.json({ tracks })
  } catch {
    return Response.json({ tracks: [] })
  }
}
