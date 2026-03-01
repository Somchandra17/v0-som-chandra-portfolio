"use client"

import { useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { CustomCursor } from "@/components/custom-cursor"
import { Loader } from "@/components/loader"
import { GrainOverlay } from "@/components/grain-overlay"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/sections/hero"
import { AboutSection } from "@/components/sections/about"
import { WorkSection } from "@/components/sections/work"
import { ProjectsSection } from "@/components/sections/projects"
import { CreativeSection } from "@/components/sections/creative"
import { SpotifySection } from "@/components/sections/spotify"
import { VoidSection } from "@/components/sections/void"
import { ContactSection } from "@/components/sections/contact"

export default function Home() {
  const [loading, setLoading] = useState(true)

  const handleLoadComplete = useCallback(() => {
    setLoading(false)
  }, [])

  return (
    <>
      <CustomCursor />
      <GrainOverlay />

      <AnimatePresence>
        {loading && <Loader onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {!loading && (
        <>
          <Navigation />
          <main>
            <HeroSection />
            <AboutSection />
            <WorkSection />
            <ProjectsSection />
            <CreativeSection />
            <SpotifySection />
            <VoidSection />
            <ContactSection />
          </main>
        </>
      )}
    </>
  )
}
