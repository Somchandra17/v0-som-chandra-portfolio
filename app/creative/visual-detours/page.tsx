"use client"

import { GalleryPage } from "@/components/gallery-page"
import { sidequestGallery } from "@/lib/creative-data"

export default function VisualDetoursPage() {
  return (
    <GalleryPage
      title="visual detors"
      subtitle="side quests are secretly the main quest"
      tabKey="sidequests"
      items={sidequestGallery}
      showSort={true}
    />
  )
}
