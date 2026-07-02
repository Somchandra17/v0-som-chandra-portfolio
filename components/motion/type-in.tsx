"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"

/**
 * Nerdy section headers "type in" with one blinking caret.
 *
 * A11y/SSR: the full text is ALWAYS in the DOM (server HTML included) — the typing is a
 * purely visual clip via a CSS-driven reveal, so crawlers and screen readers see the
 * complete heading immediately. Reduced motion renders the final state.
 */
export function TypeIn({
  text,
  className,
  speed = 34,
  startDelay = 120,
}: {
  text: string
  className?: string
  /** ms per character */
  speed?: number
  startDelay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const prefersReduced = useReducedMotion()
  const [visibleChars, setVisibleChars] = useState(0)
  const [done, setDone] = useState(false)

  const chars = [...text]

  useEffect(() => {
    if (prefersReduced) {
      setVisibleChars(chars.length)
      setDone(true)
      return
    }
    if (!inView) return
    let i = 0
    let interval: ReturnType<typeof setInterval>
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setVisibleChars(i)
        if (i >= chars.length) {
          clearInterval(interval)
          // let the caret blink once or twice, then release it
          setTimeout(() => setDone(true), 900)
        }
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      if (interval) clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, prefersReduced, speed, startDelay, text])

  const started = prefersReduced || visibleChars > 0

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>
        {chars.map((ch, i) => (
          <span
            key={i}
            style={{
              // Before typing starts (and on the server) the text is fully visible, so
              // SSR/no-JS/crawlers never see an empty heading; the clip applies only
              // while the animation is actually running.
              opacity: !started || i < visibleChars ? 1 : 0,
            }}
          >
            {ch}
          </span>
        ))}
      </span>
      {started && !done && <span className="caret" aria-hidden />}
    </span>
  )
}
