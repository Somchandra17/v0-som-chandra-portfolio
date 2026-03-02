"use client"

export function PaperOverlay() {
  return (
    <>
      <div className="paper-texture pointer-events-none fixed inset-0 z-50" aria-hidden />
      <div className="lowlight-burn pointer-events-none fixed inset-0 z-[51]" aria-hidden />
    </>
  )
}
