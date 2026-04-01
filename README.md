# Som Chandra Portfolio

Personal portfolio site built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Run Locally

### 1. Prerequisites

- Node.js 20+ (Node 22 LTS recommended)
- `pnpm` (or `corepack` to enable pnpm)

### 2. Install dependencies

```bash
corepack enable
pnpm install
```

### 3. Configure environment variables

Copy the example file and add your Spotify credentials:

```bash
cp .env.example .env.local
```

`.env` also works if you prefer a single local env file.

Required variables in `.env.local`:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

### 4. Start development server

```bash
pnpm dev
```

Open:

- `http://localhost:3000`

## Run in Production Mode (Locally)

```bash
pnpm build
pnpm start
```

## Available Scripts

- `pnpm dev` - Start local development server
- `pnpm build` - Build production bundle
- `pnpm start` - Run production server
- `pnpm lint` - Run ESLint

## Spotify API Routes

These routes depend on the Spotify env vars:

- `/api/spotify/now-playing`
- `/api/spotify/recently-played`
- `/api/spotify/top-tracks`
- `/api/spotify/top-artists`
- `/api/spotify/playlist`

## Troubleshooting

- If port `3000` is busy, run `pnpm dev -- -p 3001`.
- If Spotify endpoints return empty data, re-check `.env.local` values and restart the server.
- If dependencies fail to install, delete `node_modules` and reinstall with `pnpm install`.
