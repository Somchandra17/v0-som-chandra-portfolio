import type { MetadataRoute } from "next"

const SITE_URL = "https://www.somm.tf"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = ["", "/nerdy", "/creative", "/creative/clicks", "/creative/doodling"]
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }))
}
