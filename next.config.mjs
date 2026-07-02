import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// Resume CTA renders only when the PDF actually exists (drop it in public/resume.pdf).
const hasResume = fs.existsSync(path.join(projectRoot, "public", "resume.pdf"))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the dev-mode "N / Compiling…" badge — it reads as a broken loading state
  // floating over the site. (Dev-only setting; production never shows it anyway.)
  devIndicators: false,
  env: {
    NEXT_PUBLIC_HAS_RESUME: hasResume ? "1" : "",
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: projectRoot,
  },
}

export default nextConfig
