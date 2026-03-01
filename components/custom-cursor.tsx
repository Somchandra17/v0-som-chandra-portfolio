"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export function CustomCursor() {
  const cursorRef = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [trailPos, setTrailPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
      setPos({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    const hoverElements = () => {
      const interactiveElements = document.querySelectorAll("a, button, [role='button'], input, textarea, [data-hover]")
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => setIsHovering(true))
        el.addEventListener("mouseleave", () => setIsHovering(false))
      })
    }

    hoverElements()
    const observer = new MutationObserver(hoverElements)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      observer.disconnect()
    }
  }, [isVisible])

  useEffect(() => {
    let animId: number
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const animate = () => {
      setTrailPos((prev) => ({
        x: lerp(prev.x, cursorRef.current.x, 0.12),
        y: lerp(prev.y, cursorRef.current.y, 0.12),
      }))
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        animate={{
          x: pos.x - (isHovering ? 20 : 5),
          y: pos.y - (isHovering ? 20 : 5),
          width: isHovering ? 40 : 10,
          height: isHovering ? 40 : 10,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
        style={{ borderRadius: "50%", backgroundColor: "#ffffff" }}
      />
      {/* Trailing ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none mix-blend-difference"
        animate={{
          x: trailPos.x - (isHovering ? 30 : 20),
          y: trailPos.y - (isHovering ? 30 : 20),
          width: isHovering ? 60 : 40,
          height: isHovering ? 60 : 40,
          opacity: isVisible ? 0.5 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
        style={{
          borderRadius: "50%",
          border: "1px solid #ffffff",
          backgroundColor: "transparent",
        }}
      />
    </>
  )
}
