"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useState } from "react"
import { ACCENT, GLOW, GRAPH_GREEN, INK } from "@/lib/tokens"

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
const LABEL_Y = VB_H - 10 // one straight baseline for all month letters

const TOP = GRAPH_GREEN.top // lit top face
const LEFT = GRAPH_GREEN.side // front/left face
const RIGHT = GRAPH_GREEN.dark // shadowed right face
const TOP_EMPTY = `rgba(${GLOW.nerdy}, 0.14)` // dormant month — flat ground tile
const EDGE = "rgba(0,0,0,0.3)"

export function GithubGraph({ data }: { data: Contributions }) {
  const prefersReduced = useReducedMotion()
  const [active, setActive] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null) // keyboard ring only
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
      cx,
      label: m.label[0],
      fullLabel: m.label,
      count: m.count,
      h,
      top: `${T} ${R} ${B} ${L}`,
      left: h > 0 ? `${L} ${B} ${Bd} ${Ld}` : null,
      right: h > 0 ? `${R} ${B} ${Bd} ${Rd}` : null,
      calloutY: topCy - QH - 8,
      isPeak: m.count === data.peak.count && m.count > 0,
    }
  })

  // Paint back-to-front so nearer (lower-index) towers overlap farther ones.
  const drawOrder = [...bars].reverse()
  const activeBar = bars.find((b) => b.key === active) ?? null

  return (
    <div className="mt-5 w-full">
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
              style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
              initial={prefersReduced ? false : { scaleY: 0, opacity: 0 }}
              whileInView={prefersReduced ? undefined : { scaleY: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.05 * b.i, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Hover/focus: the block rebuilds itself from the base up. */}
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

        {/* Month letters on one straight baseline. */}
        <motion.g
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={prefersReduced ? undefined : { opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {bars.map((b) => (
            <text
              key={b.key + "-l"}
              x={b.cx}
              y={LABEL_Y}
              fill={active === b.key ? ACCENT.nerdy : INK[300]}
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              textAnchor="middle"
            >
              {b.label}
            </text>
          ))}
          {/* Counts stay quiet: peak at rest, everything else on demand. */}
          {bars.map((b) =>
            b.isPeak && active !== b.key ? (
              <text
                key={b.key + "-peak"}
                x={b.cx}
                y={b.calloutY}
                fill={INK[400]}
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {b.count}
              </text>
            ) : null
          )}
        </motion.g>

        {/* Active readout: a fixed HUD line (terminal-style) so it can never collide
            with tower geometry or the resting peak label. */}
        {activeBar && (
          <text
            x={10}
            y={22}
            fill={ACCENT.nerdy}
            fontSize={12}
            fontFamily="ui-monospace, monospace"
            textAnchor="start"
          >
            {`> ${activeBar.fullLabel.toLowerCase()} · ${activeBar.count} contribution${activeBar.count === 1 ? "" : "s"}`}
          </text>
        )}

        {/* Fat interaction columns: full-height invisible hit-rects, keyboard-operable. */}
        {bars.map((b) => (
          <rect
            key={b.key + "-hit"}
            x={b.cx - DX / 2}
            y={12}
            width={DX}
            height={VB_H - 24}
            fill="transparent"
            stroke={focused === b.key ? `rgba(${GLOW.nerdy}, 0.35)` : "transparent"}
            strokeWidth={1}
            style={{ cursor: "pointer", outline: "none" }}
            tabIndex={0}
            role="button"
            aria-label={`${b.fullLabel}: ${b.count} contribution${b.count === 1 ? "" : "s"}`}
            onMouseEnter={() => setActive(b.key)}
            onFocus={() => {
              setActive(b.key)
              setFocused(b.key)
            }}
            onBlur={() => {
              setFocused(null)
              setActive((cur) => (cur === b.key ? null : cur))
            }}
            onClick={() => setActive((cur) => (cur === b.key ? null : b.key))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setActive((cur) => (cur === b.key ? null : b.key))
              }
            }}
          />
        ))}
      </svg>
      <p className="mt-3 font-mono text-xs text-ink-300">
        peak <span className="text-accent-nerdy">{data.peak.label.toLowerCase()}</span>
        {" · "}
        <span className="tabular-nums text-accent-nerdy">{data.peak.count}</span>
        {data.longestStreak > 0 && (
          <>
            {" · longest streak "}
            <span className="tabular-nums text-accent-nerdy">{data.longestStreak}d</span>
          </>
        )}
        {data.currentStreak > 0 && (
          <>
            {" · current "}
            <span className="tabular-nums text-accent-nerdy">{data.currentStreak}d</span>
          </>
        )}
      </p>
    </div>
  )
}
