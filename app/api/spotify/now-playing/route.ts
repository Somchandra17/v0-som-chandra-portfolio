import {
  cacheControl,
  getNowPlaying,
  getRecentlyPlayed,
  normalizeSpotifyTrack,
  type NormalizedSpotifyTrack,
} from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function toNowPlayingPayload(
  track: NormalizedSpotifyTrack,
  mode: "now_playing" | "last_played",
  playedAt?: string
) {
  return {
    // Keep existing frontend condition working: show card whenever we have a valid track.
    isPlaying: true,
    isCurrentlyPlaying: mode === "now_playing",
    mode,
    playedAt,
    title: track.title,
    artist: track.artist,
    album: track.album,
    albumImageUrl: track.albumImageUrl,
    songUrl: track.songUrl,
  }
}

export async function GET() {
  try {
    const response = await getNowPlaying()

    if (response.status !== 204 && response.status < 400) {
      const song = await response.json()
      const currentTrack = normalizeSpotifyTrack(song?.item)
      if (song?.currently_playing_type === "track" && currentTrack && song?.is_playing) {
        return Response.json(toNowPlayingPayload(currentTrack, "now_playing"), {
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
    const lastTrack = normalizeSpotifyTrack(lastPlayed?.track)
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
