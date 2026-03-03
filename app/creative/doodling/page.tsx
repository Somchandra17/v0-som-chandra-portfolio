"use client"

import { GalleryPage } from "@/components/gallery-page"
import { sketchGallery } from "@/lib/creative-data"

export default function DoodlingPage() {
  return (
    <GalleryPage
      title="doodling"
      subtitle="graphite dust and late nights"
      tabKey="sketches"
      items={sketchGallery}
      showSort={false}
    />
  )
}
