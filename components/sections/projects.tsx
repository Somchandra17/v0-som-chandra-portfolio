"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ExternalLink } from "lucide-react"

const projects = [
  {
    name: "TrashRecon",
    description: "A Python recon framework that automates 8 phases of info gathering. Subdomain enum, DNS extraction, port scanning, API key scanning -- the works. Integrates 15+ tools.",
    github: "https://github.com/Somchandra17/TrashRecon",
    tags: ["Python", "Docker", "Recon"],
    noteColor: "#fabd2f22",
    rotate: -1.5,
  },
  {
    name: "API-Digger",
    description: "Automated Swagger UI vulnerability scanner. Finds exposed and potentially vulnerable API docs. Headless browser + multi-threaded magic.",
    github: "https://github.com/Somchandra17/API-Digger",
    tags: ["Python", "Scanner", "Swagger"],
    noteColor: "#8ec07c22",
    rotate: 1,
  },
  {
    name: "RootAppChecker",
    description: "Android app for detecting rooted devices using 7 methods including native C/JNI checks. Magisk detection, anti-tampering, the whole nine yards.",
    github: "https://github.com/Somchandra17/RootAppChecker",
    tags: ["Android", "Java", "C/JNI"],
    noteColor: "#83a59822",
    rotate: -0.8,
  },
  {
    name: "PC-Info RCE",
    description: "A deliberately vulnerable NodeJS page exploitable via Command Injection through User-Agent. Built as a complete Boot-To-Root CTF machine.",
    github: "https://github.com/Somchandra17/PCinfo-RCE",
    tags: ["NodeJS", "CTF", "RCE"],
    noteColor: "#fb493422",
    rotate: 1.5,
  },
]

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      className="group relative p-6 transition-all hover:shadow-md"
      style={{
        background: project.noteColor,
        border: '1px solid #bdae9344',
        borderRadius: '2px',
        transform: `rotate(${project.rotate}deg)`,
      }}
      initial={{ opacity: 0, y: 40, rotate: project.rotate + 5 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: project.rotate } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      whileHover={{ rotate: 0, scale: 1.02 }}
    >
      {/* Tape on top */}
      <div className="absolute -top-3 left-6 w-14 h-5"
        style={{
          background: 'linear-gradient(135deg, #d5c4a155 0%, #ebdbb255 100%)',
          border: '1px solid #bdae9322',
          transform: 'rotate(-2deg)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl" style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}>
            {project.name}
          </h3>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#cc241d]"
            style={{ color: '#7c6f64' }}
            data-hover
            aria-label={`View ${project.name} on GitHub`}
          >
            <ExternalLink size={16} />
          </a>
        </div>

        <p className="mt-2 text-sm leading-relaxed" style={{ color: '#504945' }}>
          {project.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-sm"
              style={{ background: '#ebdbb2', color: '#7c6f64' }}>
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
    <section id="projects" ref={sectionRef} className="relative py-24 md:py-32" style={{ background: '#f9f5d7' }}>
      {/* Coffee stain */}
      <div className="absolute top-12 right-16 w-32 h-32 rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(ellipse, #8b6914, transparent 65%)' }} />

      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}>
            things I built
          </h2>
          <motion.svg width="140" height="8" viewBox="0 0 140 8" className="mt-1">
            <motion.path
              d="M2,5 Q25,1 50,5 T100,5 T140,4"
              fill="none" stroke="#458588" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.svg>
          <p className="mt-2 text-sm" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
            (mostly tools that break other tools)
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
