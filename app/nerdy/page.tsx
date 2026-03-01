"use client"

import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { ExternalLink, Shield, Terminal, Award, Flag } from "lucide-react"

/* -- data -- */

const experience = [
  {
    role: "Cybersecurity Engineer",
    company: "Siemens Healthineers",
    period: "Jul 2024 -- Present",
    aside: "(the one where I try not to break medical devices)",
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
    aside: "(they liked me enough to keep me)",
    bullets: [
      "Automated SBOM generation reducing manual effort by 60%",
      "Performed threat modeling for connected medical device platforms",
    ],
  },
  {
    role: "Penetration Tester",
    company: "JETHA Tech",
    period: "Jun 2023 -- Sep 2023",
    aside: "(legally breaking into things)",
    bullets: [
      "Web & API penetration testing for SaaS clients",
      "Delivered 15+ security assessment reports with remediation plans",
    ],
  },
  {
    role: "Cyber Threat Intelligence Intern",
    company: "PwC India",
    period: "Nov 2022 -- Feb 2023",
    aside: "(browsing the dark web for work, not fun)",
    bullets: [
      "Dark web monitoring and threat intelligence feeds analysis",
      "IOC enrichment and MITRE ATT&CK mapping for incident response",
    ],
  },
]

const projects = [
  {
    name: "TrashRecon",
    desc: "Full-scope OSINT & recon framework for bug bounty. Sounds cool, works cooler.",
    tech: ["Python", "Shodan", "DNS", "OSINT"],
    link: "https://github.com/0xs0m/TrashRecon",
  },
  {
    name: "API-Digger",
    desc: "Finds API keys and secrets in JS files, APKs, and repos. Basically a metal detector for bad secrets.",
    tech: ["Python", "Regex", "AST"],
    link: "https://github.com/0xs0m/API-Digger",
  },
  {
    name: "RootAppChecker",
    desc: "Android app that checks if your phone has root-level security problems. Spoiler: it probably does.",
    tech: ["Kotlin", "Android", "Security"],
    link: "https://github.com/0xs0m/RootAppChecker",
  },
  {
    name: "PC-Info RCE",
    desc: "Remote system info gathering for pen-tests. Please only use this legally.",
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

export default function NerdyPage() {
  return (
    <>
      <PageHeader title="the nerdy side" subtitle="resume / projects / stuff I know" />

      <PageTransition>
        <div className="relative min-h-screen">

          {/* -- About -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-14 pb-10">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#777] mb-3">about</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-5">
                security engineer who thinks in attack trees.
              </h2>
              <p className="text-sm text-[#999] mb-4 italic">
                {"(that sounds way more dramatic than it is)"}
              </p>
              <div className="max-w-2xl space-y-4 text-sm md:text-base text-[#bbb] leading-relaxed margin-line">
                <p>
                  {"I'm a cybersecurity engineer at Siemens Healthineers. My job is making sure medical device software doesn't accidentally endanger someone on an operating table. No pressure, right?"}
                </p>
                <p>
                  {"Before that I was poking at web apps as a pen tester, crawling dark web forums for threat intel at PwC, and building recon tools in my bedroom at 2 AM. I hold a CompTIA Security+ and eWPTXv2, and I've been thanked by the Indian government for finding things they'd rather I hadn't."}
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {[
                { num: "200+", label: "TryHackMe rooms" },
                { num: "15+", label: "Pen-test reports" },
                { num: "Top 1%", label: "THM global rank" },
                { num: "4+", label: "Years in security" },
              ].map((s) => (
                <div key={s.label} className="paper-card px-4 py-3 hover-bounce">
                  <p className="text-lg md:text-xl font-bold text-[#e8e8e8]">{s.num}</p>
                  <p className="text-xs font-mono text-[#777] mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#2a2a2a]" /></div>

          {/* -- Experience -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#777] mb-3">experience</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-8">
                {"where i've worked."}
              </h2>
            </motion.div>

            <div className="space-y-6">
              {experience.map((job, i) => (
                <motion.div
                  key={job.role + job.company}
                  className="paper-card p-5 md:p-7 relative hover-bounce"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  {i === 0 && <div className="tape-top" />}

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#e8e8e8]">{job.role}</h3>
                      <p className="text-sm text-[#999]">{job.company}</p>
                      <p className="text-xs text-[#555] italic mt-0.5">{job.aside}</p>
                    </div>
                    <p className="font-mono text-xs text-[#777] shrink-0">{job.period}</p>
                  </div>

                  <ul className="space-y-1.5">
                    {job.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-[#bbb]">
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
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#777] mb-3">projects</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                things i built.
              </h2>
              <p className="text-sm text-[#555] mb-8 italic">{"(at 2 AM, fueled by questionable decisions)"}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((p, i) => (
                <motion.a
                  key={p.name}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group paper-card p-5 flex flex-col justify-between min-h-[180px] hover-bounce"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  data-hover
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-[#e8e8e8]">{p.name}</h3>
                      <ExternalLink className="h-3.5 w-3.5 text-[#555] group-hover:text-[#e8e8e8] transition-colors" />
                    </div>
                    <p className="text-sm text-[#999] leading-relaxed">{p.desc}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.tech.map((t) => (
                      <span key={t} className="font-mono text-xs px-2 py-1 border border-[#2a2a2a] text-[#777]">
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
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#777] mb-3">skills</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                what i know.
              </h2>
              <p className="text-sm text-[#555] mb-8 italic">{"(or at least what I claim to know)"}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(skills).map(([category, items], i) => (
                <motion.div
                  key={category}
                  className="paper-card p-5"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="h-3.5 w-3.5 text-[#777]" />
                    <h3 className="font-mono text-xs tracking-widest uppercase text-[#777]">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="text-sm px-3 py-1.5 border border-[#2a2a2a] text-[#bbb] hover:bg-[#e8e8e8] hover:text-[#0a0a0a] transition-colors cursor-default"
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

          {/* -- Certs & Achievements -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="h-4 w-4 text-[#777]" />
                  <p className="font-mono text-xs tracking-widest uppercase text-[#777]">certifications</p>
                </div>
                <div className="space-y-3">
                  {certs.map((c) => (
                    <div key={c.name} className="paper-card p-4 hover-bounce">
                      <p className="font-bold text-[#e8e8e8]">{c.name}</p>
                      <p className="text-xs text-[#999] mt-0.5">{c.issuer}</p>
                      <p className="font-mono text-xs text-[#777] mt-0.5">{c.id}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fadeUp}>
                <div className="flex items-center gap-2 mb-5">
                  <Award className="h-4 w-4 text-[#777]" />
                  <p className="font-mono text-xs tracking-widest uppercase text-[#777]">achievements</p>
                </div>
                <div className="space-y-2.5">
                  {achievements.map((a, i) => (
                    <div key={a} className="flex items-start gap-3 text-sm text-[#bbb]">
                      <Flag className="h-3 w-3 mt-1.5 shrink-0 text-[#777]" />
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.35 }}
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
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#555]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#444]">the nerdy side</p>
            </div>
          </footer>
        </div>
      </PageTransition>
    </>
  )
}
