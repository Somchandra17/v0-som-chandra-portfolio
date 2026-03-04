"use client"

import { GalleryPage } from "@/components/gallery-page"
import { photoGallery } from "@/lib/creative-data"

export default function ClicksPage() {
  return (
    <GalleryPage
      title="clicks"
      subtitle="shot on phone -- no fancy gear, jus vibes"
      tabKey="photos"
      items={photoGallery}
      showSort={true}
    />
  )
}
