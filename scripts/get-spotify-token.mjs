/**
 * Spotify Refresh Token Generator
 * 
 * Steps:
 * 1. Go to: https://accounts.spotify.com/authorize?client_id=07b05f3eee1f4b3fae0857c72305f112&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=user-read-currently-playing%20user-top-read%20user-read-recently-played
 * 2. Authorize the app
 * 3. Copy the "code" from the redirect URL 
 * 4. Set it below and run this script: node scripts/get-spotify-token.mjs
 */

const CLIENT_ID = "07b05f3eee1f4b3fae0857c72305f112"
const CLIENT_SECRET = "bb26b3b0202d4c2f8ce7f142be9b733a"
const REDIRECT_URI = "http://localhost:3000/callback"

// PASTE YOUR AUTH CODE HERE:
const AUTH_CODE = process.argv[2] || ""

if (!AUTH_CODE) {
  console.log("\n--- Spotify Refresh Token Generator ---\n")
  console.log("Step 1: Open this URL in your browser:\n")
  console.log(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-currently-playing%20user-top-read%20user-read-recently-played\n`)
  console.log("Step 2: After authorizing, you'll be redirected to localhost:3000/callback?code=XXXXX")
  console.log("Step 3: Copy that code and run:\n")
  console.log("  node scripts/get-spotify-token.mjs YOUR_CODE_HERE\n")
  process.exit(0)
}

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")

const response = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: AUTH_CODE,
    redirect_uri: REDIRECT_URI,
  }),
})

const data = await response.json()

if (data.refresh_token) {
  console.log("\nSuccess! Your refresh token:\n")
  console.log(data.refresh_token)
  console.log("\nAdd this as SPOTIFY_REFRESH_TOKEN in your environment variables.")
} else {
  console.log("\nError:", data)
  console.log("\nMake sure the auth code is fresh (they expire quickly).")
}
