"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const tabs = ["Photography", "Sketching"] as const

const galleryItems = {
  Photography: Array.from({ length: 6 }, (_, i) => ({
    id: `photo-${i + 1}`,
    aspectRatio: [1, 1.3, 0.8, 1.2, 0.9, 1.1][i],
  })),
  Sketching: Array.from({ length: 6 }, (_, i) => ({
    id: `sketch-${i + 1}`,
    aspectRatio: [1.2, 0.8, 1, 1.4, 0.7, 1.1][i],
  })),
}

function GalleryItem({ id, aspectRatio, index, onClick }: {
  id: string
  aspectRatio: number
  index: number
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      className="group relative cursor-pointer overflow-hidden bg-[#111111]"
      style={{ aspectRatio: aspectRatio }}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={onClick}
      data-hover
    >
      {/* Shimmer placeholder */}
      <div className="absolute inset-0 shimmer-bg" />

      {/* Hover sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffffff10] to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />

      {/* Zoom effect */}
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" />

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-xs uppercase tracking-[0.3em] text-[#ffffff] bg-[#00000080] px-3 py-1">{id}</span>
      </div>
    </motion.div>
  )
}

function Lightbox({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000ee]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative aspect-[4/3] w-[90vw] max-w-[800px] bg-[#111111]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 shimmer-bg" />
        <button
          className="absolute -right-4 -top-4 z-10 flex h-8 w-8 items-center justify-center bg-[#ffffff] text-[#000000] transition-transform hover:scale-110"
          onClick={onClose}
          aria-label="Close lightbox"
          data-hover
        >
          <X size={16} />
        </button>
      </motion.div>
    </motion.div>
  )
}

export function CreativeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Photography")
  const [lightboxItem, setLightboxItem] = useState<string | null>(null)

  return (
    <section id="creative" ref={sectionRef} className="relative bg-[#000000] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading with brush reveal style */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl font-bold tracking-tighter text-[#ffffff] sm:text-4xl md:text-5xl">
            Creative Corner
          </h2>
        </motion.div>

        {/* Quote */}
        <motion.blockquote
          className="mb-12 border-l-2 border-[#333333] pl-6 text-base italic text-[#666666] sm:text-lg"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          {'"Between breaking systems and building frames -- this is where I breathe."'}
        </motion.blockquote>

        {/* Tabs */}
        <motion.div
          className="mb-10 flex gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-2.5 text-sm font-medium uppercase tracking-widest transition-colors ${
                activeTab === tab ? "text-[#ffffff]" : "text-[#666666] hover:text-[#999999]"
              }`}
              data-hover
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-[1px] bg-[#ffffff]"
                  layoutId="tab-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Gallery grid (masonry-like via columns) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="columns-2 gap-4 md:columns-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {galleryItems[activeTab].map((item, index) => (
              <div key={item.id} className="mb-4 break-inside-avoid">
                <GalleryItem
                  {...item}
                  index={index}
                  onClick={() => setLightboxItem(item.id)}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && <Lightbox onClose={() => setLightboxItem(null)} />}
      </AnimatePresence>
    </section>
  )
}
