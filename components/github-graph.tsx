"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

export type Contributions = {
  months: { key: string; label: string; count: number }[]
  peak: { label: string; count: number }
  longestStreak: number
  currentStreak: number
  total: number
}

// Isometric tower geometry (screen units inside the SVG viewBox).
const HW = 15 // half-width of a tower's top rhombus
const QH = 8 // quarter-height (rhombus vertical radius)
const DX = 33 // per-month horizontal step
const DZ = 7 // per-month recession — the row steps up-and-back to the right
const MAXH = 120 // tallest tower (px), for the peak month
const START_X = 80
const BASE_Y = 232
const VB_W = 520
const VB_H = 286

const TOP = "#a6dca7" // lit top face
const LEFT = "#6fa472" // front/left face
const RIGHT = "#3f5b44" // shadowed right face
const TOP_EMPTY = "rgba(127,176,127,0.14)" // dormant month — flat ground tile
const EDGE = "rgba(0,0,0,0.3)"

export function GithubGraph({ data }: { data: Contributions }) {
  const prefersReduced = useReducedMotion()
  const [active, setActive] = useState<string | null>(null)
  const max = Math.max(1, ...data.months.map((m) => m.count))

  const bars = data.months.map((m, i) => {
    const cx = START_X + i * DX
    const base = BASE_Y - i * DZ
    const h = m.count > 0 ? Math.max(7, (m.count / max) * MAXH) : 0
    const topCy = base - h
    const T = `${cx},${topCy - QH}`
    const R = `${cx + HW},${topCy}`
    const B = `${cx},${topCy + QH}`
    const L = `${cx - HW},${topCy}`
    const Bd = `${cx},${topCy + QH + h}`
    const Ld = `${cx - HW},${topCy + h}`
    const Rd = `${cx + HW},${topCy + h}`
    return {
      i,
      key: m.key,
      label: m.label[0],
      count: m.count,
      h,
      top: `${T} ${R} ${B} ${L}`,
      left: h > 0 ? `${L} ${B} ${Bd} ${Ld}` : null,
      right: h > 0 ? `${R} ${B} ${Bd} ${Rd}` : null,
      countX: cx,
      countY: topCy - QH - 6,
      labelX: cx,
      labelY: base + QH + 15,
    }
  })

  // Paint back-to-front so nearer (lower-index) towers overlap farther ones.
  const drawOrder = [...bars].reverse()

  return (
    <div className="mt-5 w-full max-w-[560px]">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        role="img"
        aria-label={`Monthly GitHub contributions, last 12 months — ${data.total} total, peak ${data.peak.count} in ${data.peak.label}`}
        style={{ display: "block", overflow: "visible" }}
        onMouseLeave={() => setActive(null)}
      >
        {drawOrder.map((b) => {
          const building = active === b.key && !prefersReduced
          return (
            <motion.g
              key={b.key}
              // Entrance: each tower grows up once when scrolled into view.
              style={{ transformBox: "fill-box", transformOrigin: "bottom", cursor: "pointer" }}
              initial={prefersReduced ? false : { scaleY: 0, opacity: 0 }}
              whileInView={prefersReduced ? undefined : { scaleY: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.05 * b.i, ease: [0.16, 1, 0.3, 1] }}
              onHoverStart={() => setActive(b.key)}
              onHoverEnd={() => setActive((cur) => (cur === b.key ? null : cur))}
              onTap={() => setActive((cur) => (cur === b.key ? null : b.key))}
            >
              {/* Hover: the block rebuilds itself from the base up. */}
              <motion.g
                style={{ transformBox: "fill-box", transformOrigin: "bottom", willChange: building ? "transform" : "auto" }}
                animate={building ? { scaleY: [0, 1] } : { scaleY: 1 }}
                transition={building ? { duration: 0.9, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
              >
                {b.right && <polygon points={b.right} fill={RIGHT} stroke={EDGE} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />}
                {b.left && <polygon points={b.left} fill={LEFT} stroke={EDGE} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />}
                <polygon points={b.top} fill={b.h > 0 ? TOP : TOP_EMPTY} stroke={EDGE} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
              </motion.g>
            </motion.g>
          )
        })}

        <motion.g
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={prefersReduced ? undefined : { opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {bars.map((b) => (
            <text
              key={b.key + "-l"}
              x={b.labelX}
              y={b.labelY}
              fill="#8a8a8a"
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              textAnchor="middle"
            >
              {b.label}
            </text>
          ))}
          {bars.map((b) =>
            b.count > 0 ? (
              <text
                key={b.key + "-c"}
                x={b.countX}
                y={b.countY}
                fill="#7c7c7c"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {b.count}
              </text>
            ) : null
          )}
        </motion.g>
      </svg>
      <p className="mt-3 font-mono text-xs text-[#888]">
        peak <span className="text-[#7fb07f]">{data.peak.label.toLowerCase()}</span>
        {" · "}
        <span className="tabular-nums text-[#7fb07f]">{data.peak.count}</span>
        {data.longestStreak > 0 && (
          <>
            {" · longest streak "}
            <span className="tabular-nums text-[#7fb07f]">{data.longestStreak}d</span>
          </>
        )}
        {data.currentStreak > 0 && (
          <>
            {" · current "}
            <span className="tabular-nums text-[#7fb07f]">{data.currentStreak}d</span>
          </>
        )}
      </p>
    </div>
  )
}
