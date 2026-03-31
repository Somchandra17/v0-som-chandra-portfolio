const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing"
const TOP_TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks"
const TOP_ARTISTS_ENDPOINT = "https://api.spotify.com/v1/me/top/artists"
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played"

type SpotifyCredentials = {
  clientId: string
  clientSecret: string
  refreshToken: string
}

function getSpotifyCredentials(): SpotifyCredentials {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Spotify environment variables")
  }

  return { clientId, clientSecret, refreshToken }
}

async function getAccessToken() {
  const { clientId, clientSecret, refreshToken } = getSpotifyCredentials()
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Spotify token refresh failed (${response.status}): ${body.slice(0, 200)}`)
  }

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error("Spotify token response missing access_token")
  }

  return data.access_token
}

async function spotifyFetch(url: string) {
  const accessToken = await getAccessToken()

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })
}

export function cacheControl(seconds?: number): string {
  if (!seconds || seconds <= 0) {
    return "no-store"
  }

  return `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds}`
}

export async function getNowPlaying() {
  return spotifyFetch(NOW_PLAYING_ENDPOINT)
}

export async function getTopTracks() {
  return spotifyFetch(`${TOP_TRACKS_ENDPOINT}?time_range=long_term&limit=5`)
}

export async function getTopArtists() {
  return spotifyFetch(`${TOP_ARTISTS_ENDPOINT}?time_range=long_term&limit=5`)
}

export async function getRecentlyPlayed() {
  return spotifyFetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=5`)
}

export async function getPlaylistTracks(playlistId: string) {
  return spotifyFetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(added_at,track(name,artists(name),album(name,images),external_urls))`
  )
}
