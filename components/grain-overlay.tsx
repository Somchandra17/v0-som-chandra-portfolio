"use client"

export function PaperOverlay() {
  return (
    <>
      <div className="paper-texture pointer-events-none fixed inset-0 z-50" aria-hidden />

      {/* Coffee stain top-right */}
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
            "radial-gradient(ellipse at center, transparent 40%, rgba(120,115,105,0.07) 48%, rgba(100,95,88,0.11) 54%, transparent 62%)",
        }}
      />

      {/* Coffee stain bottom-left */}
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
            "radial-gradient(ellipse at center, transparent 38%, rgba(130,125,118,0.06) 46%, rgba(110,105,98,0.1) 52%, transparent 60%)",
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
          background: "radial-gradient(circle, rgba(20,20,20,0.07) 0%, transparent 70%)",
        }}
      />
    </>
  )
}
