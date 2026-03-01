"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ExternalLink } from "lucide-react"

const projects = [
  {
    name: "TrashRecon",
    description: "Comprehensive Python-based reconnaissance framework. Automates 8 phases of information gathering including subdomain enumeration, DNS extraction, port scanning, and API key scanning. Integrates 15+ security tools.",
    github: "https://github.com/Somchandra17/TrashRecon",
    tags: ["Python", "Docker", "Recon", "Multi-threaded"],
  },
  {
    name: "API-Digger",
    description: "Automated Swagger UI vulnerability scanner that identifies exposed and potentially vulnerable API documentation endpoints. Features headless browser automation and multi-threaded architecture.",
    github: "https://github.com/Somchandra17/API-Digger",
    tags: ["Python", "Scanner", "Swagger", "Feroxbuster"],
  },
  {
    name: "RootAppChecker",
    description: "Android application for detecting rooted devices using 7 detection methods including native C/JNI implementation for low-level system checks. Features Magisk detection and anti-tampering techniques.",
    github: "https://github.com/Somchandra17/RootAppChecker",
    tags: ["Android", "Java", "C/JNI", "Security"],
  },
  {
    name: "PC-Info RCE",
    description: "A deliberately vulnerable NodeJS web page exploitable via Command Injection through User-Agent for RCE. Built as a complete Boot-To-Root machine with misconfigured cronjob.",
    github: "https://github.com/Somchandra17/PCinfo-RCE",
    tags: ["NodeJS", "CTF", "RCE", "Boot-to-Root"],
  },
]

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      className="group relative overflow-hidden border border-[#333333] bg-[#0a0a0a] p-6 transition-colors hover:border-[#666666] md:p-8"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Hover draw-border effect */}
      <div className="absolute inset-0 border border-transparent transition-all duration-500 group-hover:border-[#666666]" />

      {/* ASCII art background */}
      <div className="absolute right-4 top-4 font-mono text-[80px] font-bold leading-none text-[#111111] opacity-0 transition-opacity group-hover:opacity-100">
        {">_"}
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <motion.h3
            className="text-xl font-bold text-[#ffffff] sm:text-2xl"
            initial={{ x: -20, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            {project.name}
          </motion.h3>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#666666] transition-colors hover:text-[#ffffff]"
            data-hover
            aria-label={`View ${project.name} on GitHub`}
          >
            <ExternalLink size={18} />
          </a>
        </div>

        <motion.p
          className="mt-3 text-sm leading-relaxed text-[#999999]"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          {project.description}
        </motion.p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag, i) => (
            <span
              key={i}
              className="font-mono text-xs text-[#666666] before:content-['#']"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="projects" ref={sectionRef} className="relative bg-[#0a0a0a] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-[#666666]">{"$"} </span>
            <h2 className="text-3xl font-bold tracking-tighter text-[#ffffff] sm:text-4xl md:text-5xl">
              Projects
            </h2>
          </div>
          <div className="mt-2 font-mono text-sm text-[#666666]">
            {"// tools built, systems broken"}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
