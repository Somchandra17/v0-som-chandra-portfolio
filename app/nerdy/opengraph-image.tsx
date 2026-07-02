import { ImageResponse } from "next/og"
import { ACCENT, INK } from "@/lib/tokens"

export const alt = "som — the nerdy side"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GREEN = ACCENT.nerdy
const INK_900 = INK[900]
const INK_100 = INK[100]
const INK_400 = INK[400]

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK_900,
          padding: "72px 84px",
          borderLeft: `16px solid ${GREEN}`,
        }}
      >
        <div style={{ display: "flex", color: GREEN, fontSize: 30, letterSpacing: 6 }}>
          {"$ whoami"}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 130, fontWeight: 700, color: INK_100 }}>
            0xs0m
            <span style={{ color: GREEN }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 38, color: INK_400, marginTop: 10 }}>
            the nerdy side — resume, hacking stuff, certs
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: INK_400,
            fontSize: 26,
            letterSpacing: 4,
          }}
        >
          <span>cyber security engineer</span>
          <span style={{ color: GREEN }}>somm.tf/nerdy</span>
        </div>
      </div>
    ),
    size
  )
}
