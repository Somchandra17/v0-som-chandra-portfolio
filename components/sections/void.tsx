"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const posts = [
  {
    title: "Why I Stopped Chasing CVEs",
    date: "2025-01-15",
    excerpt: "There was a time I measured my worth in the number of bugs I found. Then I realized the real exploit was burning myself out trying to keep score...",
    tags: ["#thoughts", "#tech"],
  },
  {
    title: "A Day in Bengaluru Traffic",
    date: "2024-12-28",
    excerpt: "The commute from Koramangala to the office takes 47 minutes on a good day and 2 hours when the rain gods decide otherwise. Today was a rain day...",
    tags: ["#dayinlife", "#rant"],
  },
  {
    title: "On Framing the Imperfect",
    date: "2024-11-10",
    excerpt: "The best photograph I ever took was one I almost deleted. Blurry, off-center, technically garbage. But it captured something no clean shot ever could...",
    tags: ["#thoughts", "#dayinlife"],
  },
]

export function VoidSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="void" ref={sectionRef} className="relative bg-[#000000] py-24 md:py-32">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.015]">
        <div className="h-[200%] w-full" style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff 2px, #ffffff 4px)",
          animation: "scanline 8s linear infinite",
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Heading with glitch */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="group relative inline-block text-3xl font-bold tracking-tighter text-[#ffffff] sm:text-4xl md:text-5xl">
            <span className="relative z-10">The Void</span>
            {/* Glitch layers */}
            <span className="absolute left-[2px] top-0 z-0 text-[#333333] opacity-0 transition-opacity group-hover:opacity-70" aria-hidden="true">The Void</span>
            <span className="absolute -left-[2px] top-0 z-0 text-[#666666] opacity-0 transition-opacity group-hover:opacity-50" aria-hidden="true">The Void</span>
          </h2>
          <p className="mt-2 text-sm text-[#666666]">Where thoughts go to decompose.</p>
        </motion.div>

        {/* Post cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              className="group relative overflow-hidden border border-[#333333] bg-[#0a0a0a] p-6 transition-colors hover:border-[#666666]"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.12 }}
            >
              {/* Typewriter texture overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22paper%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.04%22%20numOctaves%3D%225%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23paper)%22%20opacity%3D%220.02%22/%3E%3C/svg%3E')] opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="font-mono text-xs text-[#666666]">{tag}</span>
                  ))}
                </div>
                <h3 className="mt-3 text-lg font-bold text-[#ffffff]">{post.title}</h3>
                <time className="mt-1 block font-mono text-xs text-[#666666]">{post.date}</time>
                <p className="mt-3 text-sm leading-relaxed text-[#999999]">{post.excerpt}</p>

                {/* Read more hover */}
                <div className="mt-4 overflow-hidden">
                  <div className="translate-y-full text-xs font-medium uppercase tracking-widest text-[#ffffff] transition-transform duration-300 group-hover:translate-y-0">
                    Read More &rarr;
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
