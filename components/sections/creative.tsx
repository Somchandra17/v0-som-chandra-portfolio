"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const tabs = ["Photography", "Sketching"] as const

const galleryItems = {
  Photography: Array.from({ length: 6 }, (_, i) => ({
    id: `photo-${i + 1}`,
    aspectRatio: [1, 1.3, 0.8, 1.2, 0.9, 1.1][i],
    caption: ["golden hour", "street corner", "rain day", "rooftop vibes", "the alley", "morning light"][i],
  })),
  Sketching: Array.from({ length: 6 }, (_, i) => ({
    id: `sketch-${i + 1}`,
    aspectRatio: [1.2, 0.8, 1, 1.4, 0.7, 1.1][i],
    caption: ["face study", "hands again", "city line", "messy portrait", "gesture", "still life"][i],
  })),
}

function GalleryItem({ id, aspectRatio, caption, index, onClick }: {
  id: string
  aspectRatio: number
  caption: string
  index: number
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      className="group relative cursor-pointer overflow-hidden"
      style={{
        aspectRatio,
        background: '#ebdbb2',
        borderRadius: '2px',
        transform: `rotate(${(index % 2 === 0 ? -1 : 1) * (0.5 + index * 0.3)}deg)`,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={onClick}
      whileHover={{ rotate: 0, scale: 1.03 }}
      data-hover
    >
      {/* Paper-like placeholder */}
      <div className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #ebdbb2 0%, #d5c4a1 100%)' }}>
        <span className="text-lg" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
          {caption}
        </span>
      </div>

      {/* Hover label */}
      <div className="absolute inset-0 flex items-end p-3 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: 'linear-gradient(transparent 60%, #3c383666 100%)' }}>
        <span className="text-xs px-2 py-1" style={{ background: '#fbf1c7', color: '#3c3836', borderRadius: '2px' }}>
          {id}
        </span>
      </div>
    </motion.div>
  )
}

function Lightbox({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: '#3c3836ee' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative aspect-[4/3] w-[90vw] max-w-[700px] p-4 pb-14 shadow-xl"
        style={{ background: '#f2e5bc' }}
        initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, rotate: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full w-full" style={{ background: '#ebdbb2' }} />
        <p className="absolute bottom-4 left-4 text-lg" style={{ fontFamily: "'Caveat', cursive", color: '#7c6f64' }}>
          (imagine something beautiful here)
        </p>
        <button
          className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-transform hover:scale-110"
          style={{ background: '#cc241d', color: '#fbf1c7' }}
          onClick={onClose}
          aria-label="Close lightbox"
          data-hover
        >
          <X size={14} />
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
    <section id="creative" ref={sectionRef} className="relative py-24 md:py-32" style={{ background: '#fbf1c7' }}>
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}>
            creative bits
          </h2>
          <motion.svg width="110" height="8" viewBox="0 0 110 8" className="mt-1">
            <motion.path
              d="M2,5 Q20,1 40,5 T80,5 T110,4"
              fill="none" stroke="#b16286" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.svg>
        </motion.div>

        <motion.blockquote
          className="mb-10 pl-4 border-l-2 text-base italic"
          style={{ borderColor: '#d5c4a1', color: '#7c6f64', fontFamily: "'Caveat', cursive", fontSize: '1.2rem' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          {"between breaking systems and building frames -- this is where I breathe."}
        </motion.blockquote>

        {/* Tabs */}
        <motion.div
          className="mb-8 flex gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-5 py-2 text-sm font-medium transition-all"
              style={{
                color: activeTab === tab ? '#3c3836' : '#bdae93',
                background: activeTab === tab ? '#ebdbb2' : 'transparent',
                borderRadius: '2px',
              }}
              data-hover
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Gallery */}
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

      <AnimatePresence>
        {lightboxItem && <Lightbox onClose={() => setLightboxItem(null)} />}
      </AnimatePresence>
    </section>
  )
}
