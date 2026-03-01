"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Github, Linkedin, Mail, Globe } from "lucide-react"

const links = [
  { label: "somchandra.infosec@gmail.com", href: "mailto:somchandra.infosec@gmail.com", icon: Mail },
  { label: "GitHub", href: "https://github.com/somchandra17", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra17", icon: Linkedin },
  { label: "0xs0m.live", href: "https://0xs0m.live", icon: Globe },
]

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="contact" ref={sectionRef} className="relative bg-[#0a0a0a] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Large heading */}
        <motion.h2
          className="mb-16 text-4xl font-bold tracking-tighter text-[#ffffff] sm:text-5xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {"Let's talk."}
        </motion.h2>

        {/* Links */}
        <div className="flex flex-col gap-4">
          {links.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="group relative flex items-center gap-4 overflow-hidden border-b border-[#1a1a1a] py-4 transition-colors"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-hover
            >
              {/* Fill from bottom */}
              <span className="absolute inset-0 translate-y-full bg-[#ffffff] transition-transform duration-300 group-hover:translate-y-0" />

              <link.icon size={18} className="relative z-10 text-[#666666] transition-colors group-hover:text-[#000000]" />
              <span className="relative z-10 font-mono text-sm text-[#999999] transition-colors group-hover:text-[#000000] sm:text-base">
                {link.label}
              </span>
              <span className="relative z-10 ml-auto text-xs uppercase tracking-widest text-[#666666] transition-colors group-hover:text-[#000000]">
                &rarr;
              </span>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-24 border-t border-[#1a1a1a] pt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="text-center text-xs text-[#666666]">
            Som Chandra &copy; 2025 &mdash; Built with obsession.
          </p>
        </motion.footer>
      </div>
    </section>
  )
}
