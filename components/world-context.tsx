"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import type { World } from "@/lib/tokens"

const WorldContext = createContext<World | null>(null)

/** The active world ("nerdy" | "creative"), or null on neutral surfaces (home, 404). */
export function useWorld(): World | null {
  return useContext(WorldContext)
}

/**
 * Wraps a world layout's children. Provides the world to motion primitives and mirrors
 * it onto <html data-world-active> so global fixed overlays (grain, vignette) that live
 * outside the [data-world] wrapper re-theme too.
 */
export function WorldProvider({ world, children }: { world: World; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.worldActive = world
    return () => {
      delete document.documentElement.dataset.worldActive
    }
  }, [world])

  return <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
}
