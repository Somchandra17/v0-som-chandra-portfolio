"use client"

import { motion } from "framer-motion"
import useSWR from "swr"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { SectionHeader } from "@/components/section-header"
import { SpotifyNowPlayingContent } from "@/components/now-playing"
import { fetcher, type NowPlayingData } from "@/lib/creative-data"
import { ExternalLink, Shield, Terminal, Flag, Bug, Github, Linkedin, Mail } from "lucide-react"

const linkHub = [
  {
    label: "github",
    value: "Somchandra17",
    href: "https://github.com/somchandra17",
    icon: Github,
    aside: "where the side quests live",
  },
  {
    label: "tryhackme",
    value: "0xs0m",
    href: "https://tryhackme.com/p/0xs0m",
    icon: Terminal,
    aside: "ranked chaos, but documented",
  },
  {
    label: "linkedin",
    value: "somchandra17",
    href: "https://linkedin.com/in/somchandra17",
    icon: Linkedin,
    aside: "the polite version of me",
  },
  {
    label: "mail",
    value: "somchandra.infosec@gmail.com",
    href: "mailto:somchandra.infosec@gmail.com",
    icon: Mail,
    aside: "for bugs, jobs, or bad ideas",
  },
]

const experience = [
  {
    role: "Cyber Security Engineer",
    company: "MoveInSync",
    period: "Jun, 2025 -- Present",
    location: "Bengaluru, Karnataka, India",
    aside: "(the one where I actually get paid to break things)",
    bullets: [
      "Conduct end-to-end VAPT across web, API, Android, iOS, and infrastructure surfaces using gray-box testing, manual validation, static and dynamic analysis, Burp Suite, Postman, Frida, MobSF, JADX, apktool, and Nessus",
      "Turn vulnerabilities into developer-usable Jira tickets with evidence, reproduction steps, exploitability context, affected assets, remediation guidance, and closure validation",
      "Built internal AppSec automation for API inventory, external exposure review, endpoint risk detection, SQLite-backed result tracking, and repeatable validation",
      "Hardened Android flows against rooted-device abuse and Frida runtime attacks by integrating Google Play Integrity API and revalidating SSL pinning, WebView, and API-header controls",
      "Coordinate external VAPT work with vendors like Rudra and Coforge across test accounts, builds, finding triage, duplicate cleanup, fix validation, and stakeholder alignment",
      "Run Nessus AMI and compliance scans, tune plugins and checks, and cut down noisy findings before developer handoff",
    ],
  },
  {
    role: "Application Security Intern",
    company: "MoveInSync",
    period: "Jan, 2025 -- May, 2025",
    location: "Bengaluru, Karnataka, India",
    aside: "(they liked me enough to keep me)",
    bullets: [
      "Supported API, web, and mobile testing through endpoint enumeration, manual validation, evidence capture, and reproducible ticket creation",
      "Performed pre-assessment sanity testing for Android and iOS builds before external VAPT engagements",
      "Prototyped API discovery and exposure checks that later fed reusable internal security automation",
      "Assisted with Nessus review, API triage, reporting, documentation, and developer follow-through to remediation closure",
    ],
  },
  {
    role: "Cyber Security R&D Intern",
    company: "Securaeon Initiative",
    period: "Feb, 2022 -- Jul, 2022",
    location: "Remote/Kolkata, West Bengal",
    aside: "(writing walkthroughs at 2 AM)",
    bullets: [
      "Created security walkthroughs, proof-of-concept material, and practical lab content for upcoming cybersecurity products and courses",
    ],
  },
  {
    role: "Security Researcher",
    company: "Bugcrowd",
    period: "Oct, 2021 -- Dec, 2021",
    location: "Freelance",
    aside: "(legally breaking into things for strangers)",
    bullets: [
      "Reported web security vulnerabilities through open bug bounty programs, including findings later recognized in Hall of Fame listings and responsible-disclosure acknowledgments",
      "Communicated impact, proof of concept, and remediation context to program security teams to support timely validation and closure",
    ],
  },
]

const projects = [
  {
    name: "Burp AI Agent",
    desc: "Merged upstream contribution to a Burp Suite extension for AI-assisted analysis, MCP tooling, privacy controls, and passive or active scanning. I added NVIDIA NIM backend support, settings persistence, and cleaner HTTP 429 handling.",
    tech: ["Kotlin", "Burp Suite", "AI", "Open Source"],
    link: "https://github.com/six2dez/burp-ai-agent",
  },
  {
    name: "TrashDroid",
    desc: "Terminal-first Android DAST framework that orchestrates ADB, drozer, apktool, sqlite3, logcat, screenshots, and filesystem analysis across 9 mobile assessment phases with AI-ready reporting.",
    tech: ["Python", "Android", "DAST", "CLI"],
    link: "https://github.com/Somchandra17/TrashDroid",
  },
  {
    name: "TrashRecon",
    desc: "Dockerized recon framework chaining 17 tools across 10 phases for attack-surface mapping, screenshots, takeover checks, endpoint crawling, exposed-key checks, nuclei scans, and resumable output.",
    tech: ["Python", "Docker", "OSINT", "Recon"],
    link: "https://github.com/Somchandra17/TrashRecon",
  },
  {
    name: "RootAppChecker",
    desc: "Android root-detection app using Java plus native C/JNI checks for root files, SU binaries, BusyBox, Magisk traces, root apps, system properties, and integrity signals.",
    tech: ["Java", "Android", "C/JNI", "Mobile Security"],
    link: "https://github.com/Somchandra17/RootAppChecker",
  },
]

const skills: Record<string, string[]> = {
  "Application Security": ["Web/API/Mobile VAPT", "OWASP Top 10", "OWASP MASVS", "Gray-box Testing", "Manual Exploitation", "Vulnerability Triage", "Remediation Review"],
  "Mobile Security": ["Android/iOS Testing", "Root/Jailbreak Detection", "SSL Pinning Validation", "Frida", "WebView Security", "Google Play Integrity", "Anti-tampering"],
  "Security Tools": ["Burp Suite", "OWASP ZAP", "Nessus", "Nmap", "nuclei", "MobSF", "JADX", "apktool", "drozer", "ADB", "Ghidra", "Wireshark"],
  "Automation & Dev": ["Python", "Bash", "Kotlin", "Java", "JavaScript", "Node.js", "C/JNI", "SQLite", "MySQL", "REST", "GraphQL", "Docker", "Git", "Linux"],
}

const certs = [
  { name: "CompTIA Security+ (SY0-701)", issuer: "CompTIA", date: "Dec 2024" },
  { name: "eWPTXv2", issuer: "eLearnSecurity", date: "Jan 2023" },
]

const achievements = [
  "Top 1% on TryHackMe globally",
  "Hall of Fame -- Mastercard: SSTI escalated to LFI (P1)",
  "Hall of Fame -- Rakuten: Session Fixation (P2)",
  "Hall of Fame -- Chaturbate Inc: Stored XSS (P2)",
  "20+ Acknowledgements from NCIIPC India (auth bypass, XSS, SQLi, ATO)",
  "5th Place, OWASPLPU CTF 2022",
  "9th Place, WTFCTF 2022",
  "34th Place, RuCTF 2022",
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

export default function NerdyPage() {
  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })

  return (
    <>
      <PageHeader title="the nerdy side" subtitle="resume / projects / hacking stuff" breadcrumb="som / nerdy" />

      <PageTransition>
        <div className="relative min-h-screen">
          {nowPlaying?.isPlaying && (
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-10 pb-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="border-t border-[#333] pt-8">
                  <SpotifyNowPlayingContent nowPlaying={nowPlaying} />
                </div>
              </motion.div>
            </section>
          )}

          {/* -- About -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-14 pb-10">
            <motion.div {...fadeUp}>
              <SectionHeader
                kicker="about"
                title="cybersecurity engineer who breaks things for a living."
                aside="(legally... mostly)"
                className="mb-5"
              />
              <div className="max-w-2xl space-y-4 text-sm md:text-base text-[#ccc] leading-relaxed margin-line">
                <p>
                  {"Application Security / Cyber Security Engineer focused on web, API, Android, and iOS VAPT. I spend most days doing gray-box testing, runtime analysis, vulnerability validation, and writing the kind of remediation notes that developers pretend not to hate."}
                </p>
                <p>
                  {"Right now that means shipping AppSec work at MoveInSync, building internal automation, and making sure rooted phones, weak WebViews, or exposed endpoints don't quietly ruin everyone's week. Before that, I was hunting bugs on Bugcrowd, building weird tools, and collecting Hall of Fames from companies that definitely would have preferred a quieter email."}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mt-8 paper-card p-5 md:p-6"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.12, duration: 0.45 }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <div>
                  <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-1">link bunker</p>
                  <p className="text-sm text-[#666]">{"everything public, in one place, so nobody has to go treasure hunting."}</p>
                </div>
                <p className="font-mono text-xs text-[#666]">{"$ whoami --everywhere"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {linkHub.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border border-[#333] px-4 py-3 transition-colors hover:border-[#666] hover:bg-[#101010]"
                    >
                      <div className="flex items-center gap-2 text-[#999] mb-2">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-mono text-[11px] tracking-[0.22em] uppercase">{link.label}</span>
                      </div>
                      <p className="text-sm font-medium text-[#e8e8e8] break-all">{link.value}</p>
                      <p className="text-xs text-[#666] mt-1">{link.aside}</p>
                    </a>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {[
                { num: "Top 1%", label: "TryHackMe global" },
                { num: "20+", label: "NCIIPC acks" },
                { num: "#44", label: "merged upstream PR" },
              ].map((s) => (
                <div key={s.label} className="paper-card px-4 py-3 hover-bounce">
                  <p className="text-lg md:text-xl font-bold text-[#e8e8e8]">{s.num}</p>
                  <p className="text-xs font-mono text-[#999] mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Experience -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <SectionHeader
                kicker="experience"
                title="places that let me in."
                aside="(on purpose, I mean)"
                className="mb-8"
              />
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
                      <p className="text-sm text-[#aaa]">{job.company} <span className="text-[#666]">-- {job.location}</span></p>
                      <p className="text-xs text-[#666] italic mt-0.5">{job.aside}</p>
                    </div>
                    <p className="font-mono text-xs text-[#999] shrink-0">{job.period}</p>
                  </div>

                  <ul className="space-y-1.5">
                    {job.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-[#ccc]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#e8e8e8]" style={{ borderRadius: "50%" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Projects -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <SectionHeader
                kicker="projects"
                title="things i built at 2 AM."
                aside="(fueled by questionable decisions and instant noodles)"
                className="mb-8"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((p, i) => (
                <motion.a
                  key={p.name}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group paper-card p-5 flex flex-col justify-between min-h-[200px] hover-bounce"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-[#e8e8e8]">{p.name}</h3>
                      <ExternalLink className="h-3.5 w-3.5 text-[#666] group-hover:text-[#e8e8e8] transition-colors" />
                    </div>
                    <p className="text-sm text-[#aaa] leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.tech.map((t) => (
                      <span key={t} className="font-mono text-xs px-2 py-1 border border-[#333] text-[#999] group-hover:border-[#666] transition-colors">
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.a>
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Skills -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <SectionHeader
                kicker="skills"
                title="my toolbox."
                aside="(or at least what I claim on LinkedIn)"
                className="mb-8"
              />
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
                    <Terminal className="h-3.5 w-3.5 text-[#999]" />
                    <h3 className="font-mono text-xs tracking-widest uppercase text-[#999]">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="text-sm px-3 py-1.5 border border-[#333] text-[#ccc] hover:bg-[#e8e8e8] hover:text-[#0a0a0a] hover:border-[#e8e8e8] transition-colors cursor-default"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Certs & Achievements -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="h-4 w-4 text-[#999]" />
                  <p className="font-mono text-xs tracking-widest uppercase text-[#999]">certifications</p>
                </div>
                <div className="space-y-3">
                  {certs.map((c) => (
                    <div key={c.name} className="paper-card p-4 hover-bounce">
                      <p className="font-bold text-[#e8e8e8]">{c.name}</p>
                      <p className="text-xs text-[#aaa] mt-0.5">{c.issuer}</p>
                      <p className="font-mono text-xs text-[#999] mt-0.5">{c.date}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fadeUp}>
                <div className="flex items-center gap-2 mb-5">
                  <Bug className="h-4 w-4 text-[#999]" />
                  <p className="font-mono text-xs tracking-widest uppercase text-[#999]">hall of fame & achievements</p>
                </div>
                <div className="space-y-2.5">
                  {achievements.map((a, i) => (
                    <div key={a} className="flex items-start gap-3 text-sm text-[#ccc]">
                      <Flag className="h-3 w-3 mt-1.5 shrink-0 text-[#999]" />
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.35 }}
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
          <footer className="relative z-10 border-t border-[#333]">
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#666]">som chandra, 2026</p>
              <p className="font-mono text-xs text-[#555]">{"$ cat resume.txt"}</p>
            </div>
          </footer>
        </div>
      </PageTransition>
    </>
  )
}
