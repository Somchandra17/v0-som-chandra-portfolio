"use client"

export function GrainOverlay() {
  return (
    <>
      {/* Paper texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[90] paper-texture opacity-60" aria-hidden="true" />
      {/* Big coffee stain top-right */}
      <div
        className="fixed top-[-40px] right-[-20px] w-[280px] h-[280px] pointer-events-none z-[89] rounded-full opacity-[0.08]"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, #8b6914 0%, #a08450 30%, transparent 65%)',
          transform: 'rotate(15deg)',
        }}
        aria-hidden="true"
      />
      {/* Small stain bottom-left */}
      <div
        className="fixed bottom-[15%] left-[8%] w-[150px] h-[130px] pointer-events-none z-[89] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #7c6f64 0%, transparent 60%)',
          transform: 'rotate(-25deg)',
        }}
        aria-hidden="true"
      />
      {/* Ink splatter */}
      <div
        className="fixed top-[60%] right-[12%] w-[40px] h-[40px] pointer-events-none z-[89] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #3c3836 0%, transparent 70%)' }}
        aria-hidden="true"
      />
    </>
  )
}
