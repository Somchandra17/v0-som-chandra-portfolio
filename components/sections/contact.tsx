"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Github, Linkedin, Mail, Globe } from "lucide-react"

const links = [
  { label: "somchandra.infosec@gmail.com", href: "mailto:somchandra.infosec@gmail.com", icon: Mail, note: "(I check this... sometimes)" },
  { label: "GitHub", href: "https://github.com/somchandra17", icon: Github, note: "(where the code lives)" },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra17", icon: Linkedin, note: "(the professional face)" },
  { label: "0xs0m.live", href: "https://0xs0m.live", icon: Globe, note: "(the other site)" },
]

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="contact" ref={sectionRef} className="relative py-24 md:py-32" style={{ background: '#f9f5d7' }}>
      {/* Coffee ring */}
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #a08450 50%, transparent 62%)' }} />

      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          className="mb-4 text-5xl sm:text-6xl md:text-8xl"
          style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={isInView ? { opacity: 1, y: 0, rotate: -1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {"say hi!"}
        </motion.h2>
        <motion.p
          className="mb-12 text-base"
          style={{ color: '#7c6f64' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {"I'm usually somewhere between a terminal and a sketchbook. Drop a message, I don't bite."}
        </motion.p>

        <div className="flex flex-col gap-3">
          {links.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="group flex items-center gap-4 py-4 border-b border-dashed transition-all hover:pl-2"
              style={{ borderColor: '#d5c4a1' }}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-hover
            >
              <link.icon size={18} style={{ color: '#d65d0e' }} className="transition-transform group-hover:rotate-12" />
              <span className="text-sm sm:text-base font-medium" style={{ color: '#3c3836' }}>
                {link.label}
              </span>
              <span className="text-xs hidden sm:inline" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
                {link.note}
              </span>
              <span className="ml-auto text-sm transition-transform group-hover:translate-x-1" style={{ color: '#cc241d' }}>
                {"->"}
              </span>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-20 pt-8 border-t border-dashed"
          style={{ borderColor: '#d5c4a1' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="text-center text-sm" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
            {"made with coffee stains and questionable decisions -- som, 2025"}
          </p>
        </motion.footer>
      </div>
    </section>
  )
}
