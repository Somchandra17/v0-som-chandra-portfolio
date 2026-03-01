"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export function CustomCursor() {
  const cursorRef = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
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

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      animate={{
        x: pos.x - 10,
        y: pos.y - 10,
        scale: isHovering ? 1.8 : 1,
        rotate: isHovering ? 15 : 0,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
    >
      {/* A little pencil-tip / ink dot */}
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r={isHovering ? 8 : 4} fill="#3c3836" opacity="0.6" />
        <circle cx="10" cy="10" r="2" fill="#cc241d" opacity="0.8" />
      </svg>
    </motion.div>
  )
}
