"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type CursorMode = "default" | "nerdy" | "creative"

const CursorCtx = createContext<{
  mode: CursorMode
  setMode: (m: CursorMode) => void
}>({ mode: "default", setMode: () => {} })

export function CursorProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CursorMode>("default")
  return <CursorCtx.Provider value={{ mode, setMode }}>{children}</CursorCtx.Provider>
}

export const useCursorMode = () => useContext(CursorCtx)
