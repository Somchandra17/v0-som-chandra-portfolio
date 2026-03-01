"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const experiences = [
  {
    company: "MoveInSync",
    role: "Cyber Security Engineer",
    period: "Jun 2025 -- Present",
    location: "Bengaluru, Karnataka",
    achievements: [
      "Conducted end-to-end VAPT for multiple applications including gray-box testing and false-positive verification",
      "Designed internal tools: Swagger-UI Vulnerability Finder, Subdomain Takeover Tool, and Endpoint Detection Tool",
      "Secured Android application against rooted device exploitation using Google Play Integrity API",
      "Performed sanity testing for Android/iOS builds, identifying WebView misconfigurations and SSL bypasses",
      "Conducted Nessus AMI Scans, applied compliance patches, and tuned configurations",
    ],
  },
  {
    company: "MoveInSync",
    role: "Application Security Intern",
    period: "Jan 2025 -- May 2025",
    location: "Bengaluru, Karnataka",
    achievements: [
      "Assisted in API and application security testing with manual validation",
      "Initiated tool development for Swagger endpoint enumeration and subdomain takeover checks",
      "Participated in sanity testing for builds before external VAPT",
    ],
  },
  {
    company: "Securaeon Initiative",
    role: "Cyber Security R&D Intern",
    period: "Feb 2022 -- Jul 2022",
    location: "Kolkata, West Bengal",
    achievements: [
      "Created content, walkthroughs, and proof of concepts for upcoming products and courses",
    ],
  },
  {
    company: "Bugcrowd",
    role: "Security Researcher",
    period: "Oct 2021 -- Dec 2021",
    location: "Freelance",
    achievements: [
      "Conducted vulnerability assessments for multiple Open Bug Bounty programs",
      "Collaborated with internal security teams for timely vulnerability resolution",
    ],
  },
]

const skillCategories = [
  {
    name: "Mobile Security",
    skills: ["Mobile VAPT", "Root Detection", "SSL Pinning", "Frida", "Play Integrity API", "MobSF"],
  },
  {
    name: "Security Tools",
    skills: ["Burp Suite", "OWASP ZAP", "Nessus", "Metasploit", "Wireshark", "Nmap", "Ghidra"],
  },
  {
    name: "Programming",
    skills: ["Python", "Bash", "Java", "JavaScript", "Kotlin", "NodeJS"],
  },
  {
    name: "DevOps",
    skills: ["Docker", "Kubernetes", "Linux", "Git", "Jenkins", "Azure", "AWS"],
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
    <section id="work" ref={sectionRef} className="relative bg-[#000000] py-24 md:py-32">
      {/* Terminal scanline effect */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="h-[1px] w-full bg-[#ffffff]" style={{ marginBottom: "8px" }} />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Heading */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-[#666666]">{">"} </span>
            <h2 className="text-3xl font-bold tracking-tighter text-[#ffffff] sm:text-4xl md:text-5xl">
              Cybersecurity
            </h2>
          </div>
          <div className="mt-2 font-mono text-sm text-[#666666]">
            {"// experience && skills"}
          </div>
        </motion.div>

        <div className="flex flex-col gap-16 lg:flex-row lg:gap-20">
          {/* Left: Timeline */}
          <div className="flex-1">
            <div className="relative border-l border-[#333333] pl-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  className="relative mb-12 last:mb-0"
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full border border-[#666666] bg-[#000000]" />

                  <div className="font-mono text-xs text-[#666666]">{exp.period}</div>
                  <h3 className="mt-1 text-xl font-bold text-[#ffffff]">{exp.company}</h3>
                  <div className="text-sm text-[#999999]">{exp.role} &middot; {exp.location}</div>

                  <ul className="mt-3 flex flex-col gap-1.5">
                    {exp.achievements.map((achievement, i) => (
                      <motion.li
                        key={i}
                        className="flex gap-2 text-sm text-[#999999]"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: index * 0.15 + i * 0.08 + 0.3 }}
                      >
                        <span className="mt-1 h-1 w-1 flex-shrink-0 bg-[#666666]" />
                        <span>{achievement}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Skills + Certs */}
          <div className="flex flex-col gap-10 lg:w-[380px]">
            {/* Skills */}
            {skillCategories.map((category, catIdx) => (
              <motion.div
                key={catIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: catIdx * 0.1 + 0.3 }}
              >
                <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#666666]">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIdx) => (
                    <motion.span
                      key={skillIdx}
                      className="border border-[#333333] bg-[#0a0a0a] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:border-[#666666] hover:text-[#ffffff]"
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
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#666666]">
                Certifications
              </h4>
              <div className="flex flex-col gap-3">
                {certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden border border-[#333333] bg-[#0a0a0a] p-4 transition-colors hover:border-[#666666]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="text-sm font-bold text-[#ffffff]">{cert.name}</div>
                      <div className="mt-0.5 font-mono text-xs text-[#666666]">
                        {cert.code} &middot; {cert.date}
                      </div>
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
