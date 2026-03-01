"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
    }
    const onEnter = () => setVisible(true)
    const onLeave = () => setVisible(false)

    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mouseleave", onLeave)

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
      ring.current.x += (mouse.current.x - ring.current.x) * 0.14
      ring.current.y += (mouse.current.y - ring.current.y) * 0.14

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [visible])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] hidden md:block"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        ref={dotRef}
        className="absolute top-0 left-0 transition-[width,height] duration-200"
        style={{
          width: hovering ? 8 : 5,
          height: hovering ? 8 : 5,
          background: "#e8e8e8",
          borderRadius: "50%",
        }}
      />
      <div
        ref={ringRef}
        className="absolute top-0 left-0 transition-[width,height,border-color] duration-200"
        style={{
          width: hovering ? 44 : 32,
          height: hovering ? 44 : 32,
          borderRadius: "50%",
          border: `1.5px solid ${hovering ? "#e8e8e8" : "#555"}`,
          marginLeft: hovering ? -6 : 0,
          marginTop: hovering ? -6 : 0,
        }}
      />
    </div>
  )
}
