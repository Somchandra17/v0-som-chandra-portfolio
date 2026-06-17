const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing"
const TOP_TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks"
const TOP_ARTISTS_ENDPOINT = "https://api.spotify.com/v1/me/top/artists"
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played"
const SPOTIFY_LIST_LIMIT = 6

type SpotifyImage = { url?: string | null } | null
type SpotifyArtist = { name?: string | null } | null
type SpotifyAlbum = {
  name?: string | null
  images?: SpotifyImage[] | null
} | null
type SpotifyTrackLike = {
  name?: string | null
  artists?: SpotifyArtist[] | null
  album?: SpotifyAlbum
  external_urls?: { spotify?: string | null } | null
} | null
type SpotifyArtistLike = {
  name?: string | null
  genres?: string[] | null
  images?: SpotifyImage[] | null
  external_urls?: { spotify?: string | null } | null
} | null

export type NormalizedSpotifyTrack = {
  title: string
  artist: string
  album: string
  albumImageUrl?: string
  songUrl?: string
}

export type NormalizedSpotifyArtist = {
  name: string
  genres: string[]
  imageUrl?: string
  url?: string
}

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

// Cache the access token in module scope so we don't hit the token endpoint on every
// request. Spotify access tokens last ~1h; refreshing on each call caused 429 rate-limits.
let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken() {
  const now = Date.now()
  // Reuse the cached token until ~60s before it expires.
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.value
  }

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

  const data = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) {
    throw new Error("Spotify token response missing access_token")
  }

  const ttlMs = (typeof data.expires_in === "number" ? data.expires_in : 3600) * 1000
  cachedToken = { value: data.access_token, expiresAt: now + ttlMs }

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

function firstSpotifyImage(images?: SpotifyImage[] | null) {
  if (!Array.isArray(images)) return undefined
  return images.find((image) => typeof image?.url === "string" && image.url.trim().length > 0)?.url?.trim()
}

function normalizeSpotifyUrl(url?: string | null) {
  return typeof url === "string" && url.trim().length > 0 ? url.trim() : undefined
}

export function normalizeSpotifyTrack(track: unknown): NormalizedSpotifyTrack | null {
  const source = typeof track === "object" && track !== null ? (track as SpotifyTrackLike) : null
  const title = typeof source?.name === "string" ? source.name.trim() : ""
  if (!title) return null

  const artists = Array.isArray(source?.artists) ? source.artists : []
  const artistNames = artists
        .map((artist) => (typeof artist?.name === "string" ? artist.name.trim() : ""))
        .filter((name) => name.length > 0)

  const albumName = typeof source?.album?.name === "string" ? source.album.name.trim() : ""
  const album = albumName.length > 0
    ? albumName
    : "Unknown album"

  return {
    title,
    artist: artistNames.length > 0 ? artistNames.join(", ") : "Unknown artist",
    album,
    albumImageUrl: firstSpotifyImage(source?.album?.images),
    songUrl: normalizeSpotifyUrl(source?.external_urls?.spotify),
  }
}

export function normalizeSpotifyArtist(artist: unknown): NormalizedSpotifyArtist | null {
  const source = typeof artist === "object" && artist !== null ? (artist as SpotifyArtistLike) : null
  const name = typeof source?.name === "string" ? source.name.trim() : ""
  if (!name) return null

  const genres = Array.isArray(source?.genres)
    ? source.genres
        .filter((genre): genre is string => typeof genre === "string" && genre.trim().length > 0)
        .map((genre) => genre.trim())
        .slice(0, 2)
    : []

  return {
    name,
    genres,
    imageUrl: firstSpotifyImage(source?.images),
    url: normalizeSpotifyUrl(source?.external_urls?.spotify),
  }
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
  return spotifyFetch(`${TOP_TRACKS_ENDPOINT}?time_range=long_term&limit=${SPOTIFY_LIST_LIMIT}`)
}

export async function getTopArtists() {
  return spotifyFetch(`${TOP_ARTISTS_ENDPOINT}?time_range=long_term&limit=${SPOTIFY_LIST_LIMIT}`)
}

export async function getRecentlyPlayed() {
  return spotifyFetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=${SPOTIFY_LIST_LIMIT}`)
}

export async function getPlaylistTracks(playlistId: string) {
  return spotifyFetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(added_at,track(name,artists(name),album(name,images),external_urls))`
  )
}
