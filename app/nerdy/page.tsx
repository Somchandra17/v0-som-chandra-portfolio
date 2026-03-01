"use client"

import { motion } from "framer-motion"
import { CustomCursor } from "@/components/custom-cursor"
import { PaperOverlay } from "@/components/grain-overlay"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { ExternalLink, Shield, Terminal, Award, Flag } from "lucide-react"

/* -- data -- */

const experience = [
  {
    role: "Cybersecurity Engineer",
    company: "Siemens Healthineers",
    period: "Jul 2024 -- Present",
    bullets: [
      "SAST & DAST tooling -- Fortify, SonarQube, BlackDuck, Contrast, Checkmarx",
      "CI/CD security integration with Azure DevOps & Jenkins",
      "ISO 62443 / IEC 81001-5-1 compliance for medical devices",
      "Vulnerability management & risk-based triage across 12+ product lines",
    ],
  },
  {
    role: "Security Engineer Intern",
    company: "Siemens Healthineers",
    period: "Jan 2024 -- Jul 2024",
    bullets: [
      "Automated SBOM generation reducing manual effort by 60%",
      "Performed threat modeling for connected medical device platforms",
    ],
  },
  {
    role: "Penetration Tester",
    company: "JETHA Tech",
    period: "Jun 2023 -- Sep 2023",
    bullets: [
      "Web & API penetration testing for SaaS clients",
      "Delivered 15+ security assessment reports with remediation plans",
    ],
  },
  {
    role: "Cyber Threat Intelligence Intern",
    company: "PwC India",
    period: "Nov 2022 -- Feb 2023",
    bullets: [
      "Dark web monitoring and threat intelligence feeds analysis",
      "IOC enrichment and MITRE ATT&CK mapping for incident response",
    ],
  },
]

const projects = [
  {
    name: "TrashRecon",
    desc: "Full-scope OSINT & reconnaissance framework for bug bounty and red-team ops.",
    tech: ["Python", "Shodan", "DNS", "OSINT"],
    link: "https://github.com/0xs0m/TrashRecon",
  },
  {
    name: "API-Digger",
    desc: "Automated API key & secret scanner that crawls JS files, mobile APKs, and repos.",
    tech: ["Python", "Regex", "AST"],
    link: "https://github.com/0xs0m/API-Digger",
  },
  {
    name: "RootAppChecker",
    desc: "Android app to detect root-level applications and security misconfigurations.",
    tech: ["Kotlin", "Android", "Security"],
    link: "https://github.com/0xs0m/RootAppChecker",
  },
  {
    name: "PC-Info RCE",
    desc: "Remote system information gathering tool for authorized pen-test engagements.",
    tech: ["Python", "Networking", "RCE"],
    link: "https://github.com/0xs0m/PC-Info-RCE",
  },
]

const skills: Record<string, string[]> = {
  Offensive: ["Burp Suite", "Nmap", "Metasploit", "SQLMap", "Frida", "Ghidra", "Wireshark"],
  Defensive: ["Splunk", "Fortify", "SonarQube", "BlackDuck", "Checkmarx", "Contrast"],
  Languages: ["Python", "Bash", "JavaScript", "SQL", "Kotlin", "Go"],
  Infra: ["AWS", "Azure", "Docker", "Kubernetes", "Jenkins", "Terraform"],
}

const certs = [
  { name: "CompTIA Security+", issuer: "CompTIA", id: "SY0-601" },
  { name: "eWPTXv2", issuer: "INE Security", id: "Web App Expert" },
]

const achievements = [
  "TryHackMe -- Top 1% globally, 200+ rooms completed",
  "NCIIPC (Govt of India) -- Acknowledged for responsible disclosure",
  "Hall of Fame -- Multiple bug bounty recognitions",
  "CTF Player -- Ranked in national-level competitions",
]

/* -- animation helpers -- */

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

/* -- page -- */

export default function NerdyPage() {
  return (
    <>
      <CustomCursor />
      <PaperOverlay />

      <PageHeader title="The Nerdy Side" subtitle="resume / projects / skills" />

      <PageTransition>
        <div className="relative min-h-screen">
          <div className="ruled-lines fixed inset-0 pointer-events-none opacity-20 z-0" aria-hidden />

          {/* -- About -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 pb-12">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-4">about</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-6">
                Security engineer who thinks in attack trees.
              </h2>
              <div className="max-w-2xl space-y-4 text-sm md:text-base text-[#aaa] leading-relaxed margin-line">
                <p>
                  I am a cybersecurity engineer at Siemens Healthineers, working on product security for
                  medical devices. My day-to-day involves SAST/DAST tooling, vulnerability management, and
                  making sure software does not accidentally endanger someone on an operating table.
                </p>
                <p>
                  Before that, I was poking at web apps as a pen tester, crawling dark web forums for threat
                  intel at PwC, and building recon tools in my bedroom. I hold a CompTIA Security+ and
                  eWPTXv2, and I have been acknowledged by NCIIPC (Govt of India) for responsible disclosure.
                </p>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="mt-10 flex flex-wrap gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {[
                { num: "200+", label: "TryHackMe rooms" },
                { num: "15+", label: "Pen-test reports" },
                { num: "Top 1%", label: "THM global rank" },
                { num: "4+", label: "Years in security" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="paper-card px-5 py-4"
                  style={{ rotate: i % 2 === 0 ? "-0.3deg" : "0.3deg" }}
                >
                  <p className="text-xl md:text-2xl font-bold text-[#e8e8e8]">{s.num}</p>
                  <p className="text-xs font-mono text-[#555] mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#2a2a2a]" /></div>

          {/* -- Experience -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-4">experience</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-10">
                Where I have worked.
              </h2>
            </motion.div>

            <div className="space-y-8">
              {experience.map((job, i) => (
                <motion.div
                  key={job.role + job.company}
                  className="paper-card p-6 md:p-8 relative"
                  style={{ rotate: i % 2 === 0 ? "-0.2deg" : "0.2deg" }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ rotate: 0, y: -2 }}
                >
                  {i === 0 && <div className="tape-top" />}

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#e8e8e8]">{job.role}</h3>
                      <p className="text-sm text-[#888]">{job.company}</p>
                    </div>
                    <p className="font-mono text-xs text-[#555] shrink-0">{job.period}</p>
                  </div>

                  <ul className="space-y-2">
                    {job.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-[#aaa]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#e8e8e8]" style={{ borderRadius: "50%" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#2a2a2a]" /></div>

          {/* -- Projects -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-4">projects</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-10">
                Things I built.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p, i) => (
                <motion.a
                  key={p.name}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group paper-card p-6 flex flex-col justify-between min-h-[200px]"
                  style={{ rotate: i % 2 === 0 ? "-0.4deg" : "0.4deg" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ rotate: 0, y: -3, boxShadow: "4px 4px 0px #222" }}
                  data-hover
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-[#e8e8e8]">{p.name}</h3>
                      <ExternalLink className="h-4 w-4 text-[#555] group-hover:text-[#e8e8e8] transition-colors" />
                    </div>
                    <p className="text-sm text-[#888] leading-relaxed">{p.desc}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {p.tech.map((t) => (
                      <span key={t} className="font-mono text-xs px-2 py-1 border border-[#2a2a2a] text-[#666]">
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.a>
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#2a2a2a]" /></div>

          {/* -- Skills -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-4">skills</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-10">
                What I know.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(skills).map(([category, items], i) => (
                <motion.div
                  key={category}
                  className="paper-card p-6"
                  style={{ rotate: i % 2 === 0 ? "-0.3deg" : "0.3deg" }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ rotate: 0 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="h-4 w-4 text-[#555]" />
                    <h3 className="font-mono text-xs tracking-widest uppercase text-[#555]">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="text-sm px-3 py-1.5 border border-[#2a2a2a] text-[#aaa] hover:bg-[#e8e8e8] hover:text-[#0a0a0a] transition-colors cursor-default"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#2a2a2a]" /></div>

          {/* -- Certifications & Achievements -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Certs */}
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-4 w-4 text-[#555]" />
                  <p className="font-mono text-xs tracking-widest uppercase text-[#555]">certifications</p>
                </div>
                <div className="space-y-4">
                  {certs.map((c, i) => (
                    <div
                      key={c.name}
                      className="paper-card p-5"
                      style={{ rotate: i % 2 === 0 ? "-0.3deg" : "0.3deg" }}
                    >
                      <p className="font-bold text-[#e8e8e8]">{c.name}</p>
                      <p className="text-xs text-[#888] mt-1">{c.issuer}</p>
                      <p className="font-mono text-xs text-[#555] mt-1">{c.id}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="h-4 w-4 text-[#555]" />
                  <p className="font-mono text-xs tracking-widest uppercase text-[#555]">achievements</p>
                </div>
                <div className="space-y-3">
                  {achievements.map((a, i) => (
                    <div key={a} className="flex items-start gap-3 text-sm text-[#aaa]">
                      <Flag className="h-3 w-3 mt-1.5 shrink-0 text-[#555]" />
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                      >
                        {a}
                      </motion.span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[#2a2a2a]">
            <div className="mx-auto max-w-4xl px-6 py-8 flex items-center justify-between">
              <p className="font-mono text-xs text-[#555]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#333]">the nerdy side</p>
            </div>
          </footer>
        </div>
      </PageTransition>
    </>
  )
}
