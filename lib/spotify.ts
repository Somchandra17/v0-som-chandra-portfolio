const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64")
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing"
const TOP_TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks"
const TOP_ARTISTS_ENDPOINT = "https://api.spotify.com/v1/me/top/artists"
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played"

async function getAccessToken() {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token!,
    }),
  })

  return response.json()
}

export async function getNowPlaying() {
  const { access_token } = await getAccessToken()

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}

export async function getTopTracks() {
  const { access_token } = await getAccessToken()

  return fetch(`${TOP_TRACKS_ENDPOINT}?time_range=long_term&limit=10`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}

export async function getTopArtists() {
  const { access_token } = await getAccessToken()

  return fetch(`${TOP_ARTISTS_ENDPOINT}?time_range=long_term&limit=8`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}

export async function getRecentlyPlayed() {
  const { access_token } = await getAccessToken()

  return fetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=10`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}
