"use client"

import { useEffect, useRef, useState } from "react"
import { useCursorMode } from "@/components/cursor-context"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)
  const { mode } = useCursorMode()

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(pointer: coarse)").matches) return

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
    }
    const onEnter = () => setVisible(true)
    const onLeave = () => setVisible(false)
    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)

    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mouseleave", onLeave)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)

    const addHoverListeners = () => {
      document
        .querySelectorAll('a, button, [role="button"], input, textarea, [data-hover]')
        .forEach((el) => {
          el.addEventListener("mouseenter", () => setHovering(true))
          el.addEventListener("mouseleave", () => setHovering(false))
        })
    }
    addHoverListeners()
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    let raf: number
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 18}px, ${ring.current.y - 18}px)`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [visible])

  const scale = clicking ? 0.8 : hovering ? 1.4 : 1

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] hidden md:block"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Main cursor shape */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 transition-transform duration-150"
        style={{ transform: "translate(-999px, -999px)" }}
      >
        <div style={{ transform: `translate(-50%, -50%) scale(${scale})`, transition: "transform 0.15s ease" }}>
          {mode === "creative" ? (
            /* Pencil tip */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 21l1.5-5.5L17 3l3 3L7.5 18.5z" stroke="#e8e8e8" strokeWidth="1.5" fill="none" />
              <path d="M3 21l1.5-5.5 4 4z" fill="#e8e8e8" opacity="0.6" />
              <path d="M14.5 6.5l3 3" stroke="#e8e8e8" strokeWidth="1" />
            </svg>
          ) : mode === "nerdy" ? (
            /* Terminal crosshair */
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="11" y1="0" x2="11" y2="8" stroke="#e8e8e8" strokeWidth="1" />
              <line x1="11" y1="14" x2="11" y2="22" stroke="#e8e8e8" strokeWidth="1" />
              <line x1="0" y1="11" x2="8" y2="11" stroke="#e8e8e8" strokeWidth="1" />
              <line x1="14" y1="11" x2="22" y2="11" stroke="#e8e8e8" strokeWidth="1" />
              <rect x="9" y="9" width="4" height="4" stroke="#e8e8e8" strokeWidth="1" fill="none" />
              <text x="11" y="16" textAnchor="middle" fontSize="4" fill="#e8e8e8" fontFamily="monospace" dy="6">{">_"}</text>
            </svg>
          ) : (
            /* Default ink dot */
            <div
              style={{
                width: hovering ? 10 : 6,
                height: hovering ? 10 : 6,
                background: "#e8e8e8",
                borderRadius: "50%",
                transition: "width 0.15s, height 0.15s",
              }}
            />
          )}
        </div>
      </div>

      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `1px solid ${hovering ? "rgba(232,232,232,0.5)" : "rgba(232,232,232,0.15)"}`,
          transition: "border-color 0.2s",
          transform: "translate(-999px, -999px)",
        }}
      />
    </div>
  )
}
