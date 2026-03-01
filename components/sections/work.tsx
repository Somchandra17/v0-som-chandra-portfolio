"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const experiences = [
  {
    company: "MoveInSync",
    role: "Cyber Security Engineer",
    period: "Jun 2025 -- Present",
    location: "Bengaluru",
    achievements: [
      "Conducted end-to-end VAPT for multiple applications",
      "Built internal tools: Swagger-UI Vuln Finder, Subdomain Takeover Tool, Endpoint Detection",
      "Secured Android app against rooted device exploitation using Google Play Integrity API",
      "Performed sanity testing, found WebView misconfigs and SSL bypasses",
      "Ran Nessus AMI Scans, applied compliance patches",
    ],
  },
  {
    company: "MoveInSync",
    role: "AppSec Intern",
    period: "Jan 2025 -- May 2025",
    location: "Bengaluru",
    achievements: [
      "Helped with API and application security testing",
      "Started building tools for Swagger endpoint enumeration",
      "Participated in pre-VAPT sanity testing",
    ],
  },
  {
    company: "Securaeon Initiative",
    role: "Cyber Security R&D Intern",
    period: "Feb 2022 -- Jul 2022",
    location: "Kolkata",
    achievements: [
      "Created content, walkthroughs, and PoCs for upcoming products",
    ],
  },
  {
    company: "Bugcrowd",
    role: "Security Researcher",
    period: "Oct 2021 -- Dec 2021",
    location: "Freelance",
    achievements: [
      "Found vulns in multiple Open Bug Bounty programs",
      "Collaborated with security teams for timely resolution",
    ],
  },
]

const skillCategories = [
  {
    name: "Mobile Security",
    skills: ["Mobile VAPT", "Root Detection", "SSL Pinning", "Frida", "Play Integrity API", "MobSF"],
    color: "#cc241d",
  },
  {
    name: "Security Tools",
    skills: ["Burp Suite", "OWASP ZAP", "Nessus", "Metasploit", "Wireshark", "Nmap", "Ghidra"],
    color: "#d65d0e",
  },
  {
    name: "Programming",
    skills: ["Python", "Bash", "Java", "JavaScript", "Kotlin", "NodeJS"],
    color: "#98971a",
  },
  {
    name: "DevOps",
    skills: ["Docker", "Kubernetes", "Linux", "Git", "Jenkins", "Azure", "AWS"],
    color: "#458588",
  },
]

const certifications = [
  { name: "CompTIA Security+", code: "SY0-701", date: "Dec 2024" },
  { name: "eWPTXv2", code: "eLearnSecurity", date: "Jan 2023" },
]

export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="work" ref={sectionRef} className="relative py-24 md:py-32" style={{ background: '#fbf1c7' }}>
      {/* Ruled lines */}
      <div className="absolute inset-0 ruled-lines opacity-20" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Heading */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}>
            work stuff
          </h2>
          <motion.svg width="100" height="8" viewBox="0 0 100 8" className="mt-1">
            <motion.path
              d="M2,5 Q20,1 40,5 T80,5 T100,4"
              fill="none" stroke="#98971a" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.svg>
          <p className="mt-2 text-sm" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
            (the boring-but-important bits)
          </p>
        </motion.div>

        <div className="flex flex-col gap-16 lg:flex-row lg:gap-16">
          {/* Timeline */}
          <div className="flex-1">
            <div className="relative border-l-2 border-dashed pl-8" style={{ borderColor: '#bdae93' }}>
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  className="relative mb-10 last:mb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[calc(2rem+6px)] top-1.5 h-3 w-3 rounded-full"
                    style={{ background: '#d65d0e', border: '2px solid #fbf1c7' }} />

                  <div className="text-xs font-mono" style={{ color: '#bdae93' }}>{exp.period}</div>
                  <h3 className="mt-1 text-xl font-bold" style={{ color: '#3c3836' }}>{exp.company}</h3>
                  <div className="text-sm" style={{ color: '#7c6f64' }}>
                    {exp.role} &middot; {exp.location}
                  </div>

                  <ul className="mt-2 flex flex-col gap-1">
                    {exp.achievements.map((achievement, i) => (
                      <motion.li
                        key={i}
                        className="flex gap-2 text-sm"
                        style={{ color: '#504945' }}
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: index * 0.15 + i * 0.08 + 0.3 }}
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: '#d79921' }} />
                        <span>{achievement}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Skills + Certs */}
          <div className="flex flex-col gap-8 lg:w-[360px]">
            {skillCategories.map((category, catIdx) => (
              <motion.div
                key={catIdx}
                className="p-4"
                style={{ background: '#f2e5bc', borderRadius: '2px' }}
                initial={{ opacity: 0, y: 20, rotate: catIdx % 2 === 0 ? -1 : 1 }}
                animate={isInView ? { opacity: 1, y: 0, rotate: catIdx % 2 === 0 ? -0.5 : 0.5 } : {}}
                transition={{ duration: 0.5, delay: catIdx * 0.1 + 0.3 }}
              >
                <h4 className="mb-2 text-lg" style={{ fontFamily: "'Caveat', cursive", color: category.color }}>
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIdx) => (
                    <motion.span
                      key={skillIdx}
                      className="px-2.5 py-1 text-xs border transition-all hover:-rotate-1"
                      style={{
                        borderColor: '#bdae93',
                        color: '#504945',
                        background: '#fbf1c7',
                        borderRadius: '2px',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: catIdx * 0.1 + skillIdx * 0.04 + 0.5 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Certifications */}
            <motion.div
              className="p-4"
              style={{ background: '#f2e5bc', borderRadius: '2px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h4 className="mb-2 text-lg" style={{ fontFamily: "'Caveat', cursive", color: '#d79921' }}>
                Certs I Actually Have
              </h4>
              <div className="flex flex-col gap-2">
                {certifications.map((cert, i) => (
                  <div key={i} className="p-3 border border-dashed" style={{ borderColor: '#bdae93', background: '#fbf1c7', borderRadius: '2px' }}>
                    <div className="text-sm font-bold" style={{ color: '#3c3836' }}>{cert.name}</div>
                    <div className="text-xs font-mono" style={{ color: '#7c6f64' }}>
                      {cert.code} &middot; {cert.date}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
