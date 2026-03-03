"use client"

import { motion } from "framer-motion"
import useSWR from "swr"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { ExternalLink, Shield, Terminal, Flag, Bug, Disc3 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getRelativePlayedText(playedAt?: string): string | null {
  if (!playedAt) return null
  const playedDate = new Date(playedAt)
  if (Number.isNaN(playedDate.getTime())) return null

  const diffSeconds = Math.round((playedDate.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute")

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour")

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, "day")
}

type NowPlayingData = {
  isPlaying: boolean
  isCurrentlyPlaying?: boolean
  mode?: "now_playing" | "last_played"
  playedAt?: string
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string
  songUrl?: string
}

const experience = [
  {
    role: "Cyber Security Engineer",
    company: "MoveInSync",
    period: "Jun 2025 -- Present",
    location: "Bengaluru, Karnataka",
    aside: "(the one where I actually get paid to break things)",
    bullets: [
      "Conducted end-to-end VAPT for multiple applications including gray-box testing, static/dynamic analysis, and false-positive verification",
      "Designed internal tools: Swagger-UI Vulnerability Finder, Subdomain Takeover Tool, and Endpoint Detection Tool with SQLite sync",
      "Secured Android app against rooted device exploitation and Frida-based attacks by integrating Google Play Integrity API",
      "Performed Nessus AMI Scans, applied compliance patches, tuned configurations, and validated results to reduce false positives",
      "Supported external vendor VAPT (Rudra, Coforge, etc.) by coordinating with stakeholders and validating tickets",
    ],
  },
  {
    role: "Application Security Intern",
    company: "MoveInSync",
    period: "Jan 2025 -- May 2025",
    location: "Bengaluru, Karnataka",
    aside: "(they liked me enough to keep me)",
    bullets: [
      "Assisted in API and application security testing, performing enumeration, manual validation, and raising tickets",
      "Initiated tool development for Swagger endpoint enumeration and subdomain takeover checks",
      "Built foundation skills in reporting, documentation, and collaborating with developers",
    ],
  },
  {
    role: "Cyber Security R&D Intern",
    company: "Securaeon Initiative",
    period: "Feb 2022 -- Jul 2022",
    location: "Remote/Kolkata",
    aside: "(writing walkthroughs at 2 AM)",
    bullets: [
      "Created content, walkthroughs, and proof of concepts for development of upcoming products and courses",
    ],
  },
  {
    role: "Security Researcher",
    company: "Bugcrowd",
    period: "Oct 2021 -- Dec 2021",
    location: "Freelance",
    aside: "(legally breaking into things for strangers)",
    bullets: [
      "Conducted vulnerability assessments and reported security issues for multiple Open Bug Bounty programs",
      "Collaborated with internal security teams to ensure timely resolution of reported vulnerabilities",
    ],
  },
]

const projects = [
  {
    name: "TrashRecon",
    desc: "Comprehensive Python recon framework. Automates 8 phases of info gathering with 15+ security tools including puredns, subfinder, amass, httpx. Containerized with Docker.",
    tech: ["Python", "Docker", "OSINT", "DNS"],
    link: "https://github.com/Somchandra17/TrashRecon",
  },
  {
    name: "API-Digger",
    desc: "Automated Swagger UI vuln scanner. Finds exposed API docs, detects versions with headless browser automation, multi-threaded for speed.",
    tech: ["Python", "Feroxbuster", "Chrome Headless"],
    link: "https://github.com/Somchandra17/API-Digger",
  },
  {
    name: "RootAppChecker",
    desc: "Android app that detects rooted devices using 7 different methods including native C/JNI checks, Magisk detection, and mount path analysis.",
    tech: ["Java", "Android", "C/JNI", "Security"],
    link: "https://github.com/Somchandra17/RootAppChecker",
  },
  {
    name: "PC-Info RCE",
    desc: "Static NodeJS web page vulnerable to Command Injection through User-Agent for RCE. Complete Boot-To-Root machine with misconfigured cronjob.",
    tech: ["NodeJS", "RCE", "CTF"],
    link: "https://github.com/Somchandra17/PCinfo-RCE",
  },
]

const skills: Record<string, string[]> = {
  "Mobile Security": ["Mobile VAPT", "Root/Jailbreak Detection", "SSL Pinning/Bypass", "Frida", "Google Play Integrity", "MobSF", "ADB"],
  "Security Testing": ["Burp Suite", "OWASP ZAP", "Nessus", "Nmap", "Metasploit", "Wireshark", "Nikto", "testssl"],
  "Languages": ["Python", "Bash", "Java", "JavaScript", "Kotlin", "MySQL", "NodeJS"],
  "DevOps & Cloud": ["Docker", "Kubernetes", "Linux", "Git", "Jenkins", "Azure", "AWS EC2/AMI"],
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
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

export default function NerdyPage() {
  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const isNowPlaying = nowPlaying?.mode === "now_playing"
  const relativePlayed = getRelativePlayedText(nowPlaying?.playedAt)

  return (
    <>
      <PageHeader title="the nerdy side" subtitle="resume / projects / hacking stuff" />

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
                  <div className="flex items-center gap-2 mb-4">
                    <Disc3
                      className={`h-4 w-4 ${isNowPlaying ? "animate-spin text-[#1DB954]" : "text-[#767676]"}`}
                      style={{ animationDuration: "3s" }}
                    />
                    <p className={`font-mono text-xs tracking-widest uppercase ${isNowPlaying ? "text-[#1DB954]" : "text-[#8a8a8a]"}`}>
                      {isNowPlaying ? "now playing" : "last played song"}
                    </p>
                    {!isNowPlaying && (
                      <span className="border border-[#3a3a3a] bg-[#141414] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8b8b8b]">
                        afk
                      </span>
                    )}
                    {!isNowPlaying && relativePlayed && (
                      <span className="font-mono text-[10px] text-[#6f6f6f]">({relativePlayed})</span>
                    )}
                  </div>
                  <a
                    href={nowPlaying.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-card p-5 flex items-center gap-5 hover-bounce group"
                  >
                    {nowPlaying.albumImageUrl && (
                      <img
                        src={nowPlaying.albumImageUrl}
                        alt={nowPlaying.album}
                        className="w-16 h-16 object-cover border border-[#333] shrink-0"
                        crossOrigin="anonymous"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#e8e8e8] truncate group-hover:underline">{nowPlaying.title}</p>
                      <p className="text-sm text-[#aaa] truncate">{nowPlaying.artist}</p>
                      <p className="text-xs text-[#666] truncate mt-0.5">{nowPlaying.album}</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </section>
          )}

          {/* -- About -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-14 pb-10">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">about</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                cybersecurity engineer who breaks things for a living.
              </h2>
              <p className="text-sm text-[#666] mb-5 italic">
                {"(legally... mostly)"}
              </p>
              <div className="max-w-2xl space-y-4 text-sm md:text-base text-[#ccc] leading-relaxed margin-line">
                <p>
                  {"B.Tech in CSE (Cybersecurity & Blockchain) from LPU, CGPA 7.73. Currently at MoveInSync in Bengaluru, doing end-to-end VAPT, building internal security tools, and making sure Android apps don't fall apart when someone roots their phone."}
                </p>
                <p>
                  {"Before this, I was hunting bugs on Bugcrowd, writing walkthroughs at Securaeon, and collecting Hall of Fames from companies that probably wish I hadn't found those vulnerabilities."}
                </p>
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
                { num: "P1", label: "Mastercard HoF" },
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
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">experience</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                {"places that let me in."}
              </h2>
              <p className="text-sm text-[#666] mb-8 italic">{"(on purpose, I mean)"}</p>
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
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">projects</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                things i built at 2 AM.
              </h2>
              <p className="text-sm text-[#666] mb-8 italic">{"(fueled by questionable decisions and instant noodles)"}</p>
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
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">skills</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                my toolbox.
              </h2>
              <p className="text-sm text-[#666] mb-8 italic">{"(or at least what I claim on LinkedIn)"}</p>
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
              <p className="font-mono text-xs text-[#666]">som chandra, 2025</p>
              <p className="font-mono text-xs text-[#555]">{"$ cat resume.txt"}</p>
            </div>
          </footer>
        </div>
      </PageTransition>
    </>
  )
}
