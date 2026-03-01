"use client"

export function PaperOverlay() {
  return (
    <>
      <div className="paper-texture pointer-events-none fixed inset-0 z-50" aria-hidden />

      {/* Faint white ring stain top-right */}
      <div
        className="pointer-events-none fixed z-[51]"
        aria-hidden
        style={{
          top: 60,
          right: 40,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.03) 48%, rgba(255,255,255,0.05) 54%, transparent 62%)",
        }}
      />

      {/* Faint white ring stain bottom-left */}
      <div
        className="pointer-events-none fixed z-[51]"
        aria-hidden
        style={{
          bottom: 100,
          left: 30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(255,255,255,0.025) 46%, rgba(255,255,255,0.045) 52%, transparent 60%)",
        }}
      />

      {/* Ink splatter mid-right */}
      <div
        className="pointer-events-none fixed z-[51]"
        aria-hidden
        style={{
          top: "45%",
          right: 60,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />
    </>
  )
}
