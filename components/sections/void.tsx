"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const posts = [
  {
    title: "Why I Stopped Chasing CVEs",
    date: "2025-01-15",
    excerpt: "There was a time I measured my worth in the number of bugs I found. Then I realized the real exploit was burning myself out trying to keep score...",
    tags: ["thoughts", "tech"],
    rotate: -1,
  },
  {
    title: "A Day in Bengaluru Traffic",
    date: "2024-12-28",
    excerpt: "The commute from Koramangala takes 47 minutes on a good day and 2 hours when the rain gods decide otherwise. Today was a rain day...",
    tags: ["day-in-life", "rant"],
    rotate: 0.8,
  },
  {
    title: "On Framing the Imperfect",
    date: "2024-11-10",
    excerpt: "The best photograph I ever took was one I almost deleted. Blurry, off-center, technically garbage. But it captured something no clean shot ever could...",
    tags: ["thoughts", "photography"],
    rotate: -0.5,
  },
]

export function VoidSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="void" ref={sectionRef} className="relative py-24 md:py-32" style={{ background: '#fbf1c7' }}>
      {/* Ruled lines */}
      <div className="absolute inset-0 ruled-lines opacity-15" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}>
            random thoughts
          </h2>
          <motion.svg width="150" height="8" viewBox="0 0 150 8" className="mt-1">
            <motion.path
              d="M2,5 Q25,1 50,5 T100,5 T150,4"
              fill="none" stroke="#d79921" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.svg>
          <p className="mt-2 text-sm" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
            (where thoughts go to decompose)
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              className="group relative p-6 transition-all hover:shadow-md cursor-pointer"
              style={{
                background: '#f2e5bc',
                borderRadius: '2px',
                border: '1px solid #d5c4a166',
                transform: `rotate(${post.rotate}deg)`,
              }}
              initial={{ opacity: 0, y: 40, rotate: post.rotate + 3 }}
              animate={isInView ? { opacity: 1, y: 0, rotate: post.rotate } : {}}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              whileHover={{ rotate: 0, y: -4 }}
            >
              {/* Tape */}
              <div className="absolute -top-3 right-6 w-12 h-5"
                style={{
                  background: 'linear-gradient(135deg, #d5c4a155 0%, #ebdbb255 100%)',
                  border: '1px solid #bdae9322',
                  transform: 'rotate(5deg)',
                }} />

              <div className="relative z-10">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5" style={{ background: '#ebdbb2', color: '#d65d0e', borderRadius: '2px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl mb-1" style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}>
                  {post.title}
                </h3>
                <time className="text-xs font-mono" style={{ color: '#bdae93' }}>{post.date}</time>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#504945' }}>
                  {post.excerpt}
                </p>

                <div className="mt-3 overflow-hidden">
                  <div className="translate-y-full text-sm transition-transform duration-300 group-hover:translate-y-0"
                    style={{ fontFamily: "'Caveat', cursive", color: '#cc241d' }}>
                    {"keep reading ->"}
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
