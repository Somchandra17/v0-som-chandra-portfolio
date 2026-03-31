import { cacheControl, getNowPlaying, getRecentlyPlayed } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type SpotifyTrack = {
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images?: Array<{ url: string }> }
  external_urls: { spotify?: string }
}

function toNowPlayingPayload(
  track: SpotifyTrack,
  mode: "now_playing" | "last_played",
  playedAt?: string
) {
  return {
    // Keep existing frontend condition working: show card whenever we have a valid track.
    isPlaying: true,
    isCurrentlyPlaying: mode === "now_playing",
    mode,
    playedAt,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumImageUrl: track.album.images?.[0]?.url,
    songUrl: track.external_urls.spotify,
  }
}

export async function GET() {
  try {
    const response = await getNowPlaying()

    if (response.status !== 204 && response.status < 400) {
      const song = await response.json()
      if (song.currently_playing_type === "track" && song.item && song.is_playing) {
        return Response.json(toNowPlayingPayload(song.item as SpotifyTrack, "now_playing"), {
          headers: { "Cache-Control": cacheControl() },
        })
      }
    }

    const recentResponse = await getRecentlyPlayed()
    if (recentResponse.status > 400) {
      return Response.json({ isPlaying: false }, { headers: { "Cache-Control": cacheControl() } })
    }

    const recent = await recentResponse.json()
    const lastPlayed = recent?.items?.[0]
    const lastTrack = lastPlayed?.track as SpotifyTrack | undefined
    if (!lastTrack) {
      return Response.json({ isPlaying: false }, { headers: { "Cache-Control": cacheControl() } })
    }

    return Response.json(toNowPlayingPayload(lastTrack, "last_played", lastPlayed?.played_at), {
      headers: { "Cache-Control": cacheControl() },
    })
  } catch (error) {
    console.error("Spotify now playing failed", error)
    return Response.json({ isPlaying: false }, { headers: { "Cache-Control": cacheControl() } })
  }
}
