"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CustomCursor } from "@/components/custom-cursor"
import { PaperOverlay } from "@/components/grain-overlay"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { Camera, PenTool, BookOpen, X } from "lucide-react"

/* -- data -- */

const photoGallery = [
  { id: 1, title: "Urban Geometry", desc: "Lines and shadows in concrete jungles", aspect: "aspect-[4/5]" },
  { id: 2, title: "Golden Hour", desc: "That fifteen-minute window where everything glows", aspect: "aspect-[3/4]" },
  { id: 3, title: "Strangers", desc: "Faces in transit, stories untold", aspect: "aspect-square" },
  { id: 4, title: "After Rain", desc: "Wet streets reflecting neon", aspect: "aspect-[4/5]" },
  { id: 5, title: "Solitude", desc: "A bench, a tree, nobody around", aspect: "aspect-[3/4]" },
  { id: 6, title: "Rust & Decay", desc: "Beauty in what is being forgotten", aspect: "aspect-square" },
  { id: 7, title: "Night Walk", desc: "Long exposures at 2 AM", aspect: "aspect-[4/5]" },
  { id: 8, title: "Rooftop View", desc: "The city from above", aspect: "aspect-[3/4]" },
]

const sketchGallery = [
  { id: 1, title: "Portrait Study #14", desc: "Graphite on paper, 2 hours", aspect: "aspect-[3/4]" },
  { id: 2, title: "Hand Gestures", desc: "Anatomy practice from reference", aspect: "aspect-square" },
  { id: 3, title: "Cat in Ink", desc: "Quick ink sketch, 20 minutes", aspect: "aspect-[4/5]" },
  { id: 4, title: "Architecture", desc: "That building I pass every day", aspect: "aspect-[3/4]" },
  { id: 5, title: "Abstract Flow", desc: "Pen on napkin during lunch", aspect: "aspect-square" },
  { id: 6, title: "Eye Detail", desc: "Close-up study, charcoal", aspect: "aspect-[4/5]" },
]

const thoughts = [
  {
    title: "On breaking and building",
    date: "Nov 2024",
    body: "There is a strange overlap between hacking a system and composing a photograph. Both require you to see what others miss -- the gap in the fence, the light through the crack. One breaks, the other frames. Same instinct, different output.",
  },
  {
    title: "Why I sketch at 3 AM",
    date: "Sep 2024",
    body: "The world is quieter at 3 AM. No notifications, no stand-ups, no Jira tickets. Just a pencil and whatever my brain decides to put on paper. Sometimes it is faces. Sometimes it is shapes that do not mean anything yet.",
  },
  {
    title: "Cameras and terminals",
    date: "Jun 2024",
    body: "People ask how I go from staring at Burp Suite all day to picking up a camera. I think the answer is simple: both are tools for seeing things more carefully. A proxy intercepts traffic. A lens intercepts light. Same discipline.",
  },
]

type Tab = "photos" | "sketches"

/* -- animation helpers -- */

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

/* -- page -- */

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<Tab>("photos")
  const [lightboxItem, setLightboxItem] = useState<{ title: string; desc: string } | null>(null)

  const gallery = activeTab === "photos" ? photoGallery : sketchGallery

  return (
    <>
      <CustomCursor />
      <PaperOverlay />

      <PageHeader title="The Creative Side" subtitle="photos / sketches / thoughts" />

      <PageTransition>
        <div className="relative min-h-screen">
          <div className="ruled-lines fixed inset-0 pointer-events-none opacity-20 z-0" aria-hidden />

          {/* -- Bio -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 pb-12">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-4">the other half</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-6">
                When I am not in a terminal, I am behind a lens.
              </h2>
              <div className="max-w-2xl space-y-4 text-sm md:text-base text-[#aaa] leading-relaxed margin-line">
                <p>
                  Photography and sketching are how I decompress. Street photography mostly -- candid moments,
                  urban textures, the way light hits concrete at weird angles. Sketching happens late at night,
                  usually faces and anatomy studies in graphite or ink.
                </p>
                <p>
                  None of this is particularly polished or gallery-ready. It is just a collection of what I see
                  and what I put on paper. Think of it as a visual journal.
                </p>
              </div>
            </motion.div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#2a2a2a]" /></div>

          {/* -- Gallery -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-6">gallery</p>

              {/* Tabs */}
              <div className="flex gap-1 mb-10">
                {([
                  { key: "photos" as Tab, label: "Photography", icon: Camera },
                  { key: "sketches" as Tab, label: "Sketches", icon: PenTool },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-sm font-mono transition-colors border
                      ${activeTab === tab.key
                        ? "bg-[#e8e8e8] text-[#0a0a0a] border-[#e8e8e8]"
                        : "bg-transparent text-[#666] border-[#2a2a2a] hover:text-[#e8e8e8] hover:border-[#555]"
                      }
                    `}
                    data-hover
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Masonry Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="columns-2 md:columns-3 gap-4 space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                {gallery.map((item, i) => (
                  <motion.div
                    key={`${activeTab}-${item.id}`}
                    className="break-inside-avoid paper-card overflow-hidden cursor-pointer group"
                    style={{ rotate: i % 3 === 0 ? "-0.3deg" : i % 3 === 1 ? "0.3deg" : "0deg" }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    whileHover={{ rotate: 0, y: -2, boxShadow: "3px 3px 0px #222" }}
                    onClick={() => setLightboxItem(item)}
                    data-hover
                  >
                    {/* Placeholder image area */}
                    <div className={`${item.aspect} w-full bg-[#1a1a1a] border-b border-[#2a2a2a] relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {activeTab === "photos" ? (
                          <Camera className="h-8 w-8 text-[#2a2a2a]" />
                        ) : (
                          <PenTool className="h-8 w-8 text-[#2a2a2a]" />
                        )}
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[#e8e8e8]/0 group-hover:bg-[#e8e8e8]/5 transition-colors duration-300" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-[#e8e8e8]">{item.title}</p>
                      <p className="text-xs text-[#555] mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#2a2a2a]" /></div>

          {/* -- Thoughts / The Void -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-4 w-4 text-[#555]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#555]">thoughts</p>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-10">
                Random things I wrote down.
              </h2>
            </motion.div>

            <div className="space-y-6">
              {thoughts.map((t, i) => (
                <motion.article
                  key={t.title}
                  className="paper-card p-6 md:p-8"
                  style={{ rotate: i % 2 === 0 ? "-0.2deg" : "0.2deg" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ rotate: 0, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#e8e8e8]">{t.title}</h3>
                    <span className="font-mono text-xs text-[#555]">{t.date}</span>
                  </div>
                  <p className="text-sm text-[#aaa] leading-relaxed">{t.body}</p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[#2a2a2a]">
            <div className="mx-auto max-w-4xl px-6 py-8 flex items-center justify-between">
              <p className="font-mono text-xs text-[#555]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#333]">the creative side</p>
            </div>
          </footer>
        </div>
      </PageTransition>

      {/* -- Lightbox -- */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-[#000]/85 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              className="relative bg-[#111] border border-[#2a2a2a] max-w-lg w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute top-3 right-3 p-1 hover:bg-[#1a1a1a] transition-colors"
                data-hover
              >
                <X className="h-5 w-5 text-[#666]" />
              </button>

              {/* Image placeholder */}
              <div className="aspect-[4/3] w-full bg-[#1a1a1a] flex items-center justify-center border-b border-[#2a2a2a]">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-[#2a2a2a] mx-auto mb-2" />
                  <p className="font-mono text-xs text-[#555]">image placeholder</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-[#e8e8e8]">{lightboxItem.title}</h3>
                <p className="text-sm text-[#888] mt-1">{lightboxItem.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
