"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { Camera, PenTool, BookOpen, X } from "lucide-react"

const photoGallery = [
  { id: 1, title: "Urban Geometry", desc: "Lines and shadows in concrete jungles", location: "Mumbai, IN", date: "Dec 2024", aspect: "aspect-[4/5]" },
  { id: 2, title: "Golden Hour", desc: "That fifteen-minute window where everything glows", location: "Goa, IN", date: "Nov 2024", aspect: "aspect-[3/4]" },
  { id: 3, title: "Strangers", desc: "Faces in transit, stories untold", location: "Delhi, IN", date: "Oct 2024", aspect: "aspect-square" },
  { id: 4, title: "After Rain", desc: "Wet streets reflecting neon", location: "Bangalore, IN", date: "Sep 2024", aspect: "aspect-[4/5]" },
  { id: 5, title: "Solitude", desc: "A bench, a tree, nobody around", location: "Himachal, IN", date: "Aug 2024", aspect: "aspect-[3/4]" },
  { id: 6, title: "Rust & Decay", desc: "Beauty in what is being forgotten", location: "Kolkata, IN", date: "Jul 2024", aspect: "aspect-square" },
  { id: 7, title: "Night Walk", desc: "Long exposures at 2 AM", location: "Pune, IN", date: "Jun 2024", aspect: "aspect-[4/5]" },
  { id: 8, title: "Rooftop View", desc: "The city from above", location: "Jaipur, IN", date: "May 2024", aspect: "aspect-[3/4]" },
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
    body: "There's a strange overlap between hacking a system and composing a photograph. Both require you to see what others miss -- the gap in the fence, the light through the crack. One breaks, the other frames. Same instinct, different output.",
  },
  {
    title: "Why I sketch at 3 AM",
    date: "Sep 2024",
    body: "The world is quieter at 3 AM. No notifications, no stand-ups, no Jira tickets. Just a pencil and whatever my brain decides to put on paper. Sometimes it's faces. Sometimes it's shapes that don't mean anything yet.",
  },
  {
    title: "Cameras and terminals",
    date: "Jun 2024",
    body: "People ask how I go from staring at Burp Suite all day to picking up a camera. Both are tools for seeing things more carefully. A proxy intercepts traffic. A lens intercepts light. Same discipline.",
  },
]

type Tab = "photos" | "sketches"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<Tab>("photos")
  const [lightboxItem, setLightboxItem] = useState<{ title: string; desc: string } | null>(null)

  const gallery = activeTab === "photos" ? photoGallery : sketchGallery

  return (
    <>
      <PageHeader title="the unhinged side" subtitle="photos / sketches / late-night scribbles" />

      <PageTransition>
        <div className="relative min-h-screen">

          {/* -- Bio -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-14 pb-10">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">the other half</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                {"when i'm not hacking, i'm probably holding a camera wrong."}
              </h2>
              <p className="text-sm text-[#666] mb-5 italic">
                {"(or staring at a blank sketchbook like it owes me money)"}
              </p>
              <div className="max-w-2xl space-y-4 text-sm md:text-base text-[#ccc] leading-relaxed margin-line">
                <p>
                  {"Street photography mostly -- candid moments, urban textures, the way light hits concrete at weird angles. Sketching happens late at night, usually faces and anatomy studies in graphite or ink. Sometimes I just doodle nonsense and call it art."}
                </p>
                <p>
                  {"None of this is gallery-ready. Think of it as a visual journal of someone who stares at terminals all day and needs to look at literally anything else."}
                </p>
                <div className="border-l-2 border-[#555] pl-4 py-2">
                  <p className="text-xs font-mono tracking-wider text-[#999] uppercase mb-2">by the way</p>
                  <p className="text-sm text-[#aaa]">
                    {"i'm obsessed with pencils — mechanical, graphite, anything with a sharp point. they're honest. no distractions, just you and the paper. also obsessed with travel: cramped buses, overnight trains with strangers, hiking solo with just a backpack, road trips with close friends, exploring new cities with someone special. literally anywhere, alone or with people i actually like. but family trips? absolutely despise them. too much drama, too many compromises, too little freedom."}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Gallery -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-5">gallery</p>

              <div className="flex gap-1 mb-8">
                {([
                  { key: "photos" as Tab, label: "Photography", icon: Camera },
                  { key: "sketches" as Tab, label: "Sketches", icon: PenTool },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all border
                      ${activeTab === tab.key
                        ? "bg-[#e8e8e8] text-[#0a0a0a] border-[#e8e8e8]"
                        : "bg-transparent text-[#999] border-[#333] hover:text-[#e8e8e8] hover:border-[#666]"
                      }
                    `}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="columns-2 md:columns-3 gap-4 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {gallery.map((item, i) => (
                  <motion.div
                    key={`${activeTab}-${item.id}`}
                    className="break-inside-avoid paper-card overflow-hidden cursor-pointer group hover-bounce"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    onClick={() => setLightboxItem(item)}
                  >
                    <div className={`${item.aspect} w-full bg-[#1a1a1a] border-b border-[#333] relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {activeTab === "photos" ? (
                          <Camera className="h-8 w-8 text-[#333] group-hover:text-[#555] transition-colors" />
                        ) : (
                          <PenTool className="h-8 w-8 text-[#333] group-hover:text-[#555] transition-colors" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-[#e8e8e8]/0 group-hover:bg-[#e8e8e8]/5 transition-colors duration-300" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-[#e8e8e8]">{item.title}</p>
                      <p className="text-xs text-[#999] mt-0.5">{item.desc}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-[#555]">
                        <span className="font-mono">{item.location}</span>
                        <span className="font-mono">{item.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Thoughts -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-[#999]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#999]">thoughts</p>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                things i wrote at questionable hours.
              </h2>
              <p className="text-sm text-[#666] mb-8 italic">{"(3 AM brain is a different person)"}</p>
            </motion.div>

            <div className="space-y-5">
              {thoughts.map((t, i) => (
                <motion.article
                  key={t.title}
                  className="paper-card p-5 md:p-7 hover-bounce"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#e8e8e8]">{t.title}</h3>
                    <span className="font-mono text-xs text-[#999]">{t.date}</span>
                  </div>
                  <p className="text-sm text-[#ccc] leading-relaxed">{t.body}</p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[#333]">
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#666]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#555]">the unhinged side</p>
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
              className="relative bg-[#111] border border-[#333] max-w-lg w-full"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute top-3 right-3 p-1 hover:bg-[#1a1a1a] transition-colors"
              >
                <X className="h-5 w-5 text-[#999]" />
              </button>

              <div className="aspect-[4/3] w-full bg-[#1a1a1a] flex items-center justify-center border-b border-[#333]">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-[#333] mx-auto mb-2" />
                  <p className="font-mono text-xs text-[#666]">image placeholder</p>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-[#e8e8e8]">{lightboxItem.title}</h3>
                <p className="text-sm text-[#aaa] mt-1">{lightboxItem.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
