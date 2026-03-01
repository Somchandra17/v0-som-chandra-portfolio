"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { Camera, PenTool, BookOpen, X, Compass, Guitar } from "lucide-react"

type Tab = "photos" | "sketches" | "sidequests"

// Aspect ratio types: "portrait" (3:4), "landscape" (4:3), "square" (1:1), "wide" (16:9), "ultrawide" (20:9), "panorama" (21:9 or wider)
type AspectType = "portrait" | "landscape" | "square" | "wide" | "ultrawide" | "panorama"

const photoGallery: Array<{
  id: number
  title: string
  desc: string
  location: string
  date: string
  aspectType: AspectType
}> = [
  { id: 1, title: "Urban Geometrey", desc: "lines and shadwos in concrete jungels", location: "Mumbai, IN", date: "Dec 2024", aspectType: "portrait" },
  { id: 2, title: "Golden Hour", desc: "that fiften-minute window where evrything glows", location: "Goa, IN", date: "Nov 2024", aspectType: "landscape" },
  { id: 3, title: "Strangerss", desc: "faces in transit, storeis untold", location: "Delhi, IN", date: "Oct 2024", aspectType: "square" },
  { id: 4, title: "After Rainn", desc: "wet streets reflecitng neon", location: "Bangalore, IN", date: "Sep 2024", aspectType: "wide" },
  { id: 5, title: "Solitudee", desc: "a bench, a tree, nobdoy around", location: "Himachal, IN", date: "Aug 2024", aspectType: "portrait" },
  { id: 6, title: "Rust & Dacay", desc: "beuaty in what is being forgoten", location: "Kolkata, IN", date: "Jul 2024", aspectType: "ultrawide" },
  { id: 7, title: "Night Walkk", desc: "long exposurs at 2 AM", location: "Pune, IN", date: "Jun 2024", aspectType: "panorama" },
  { id: 8, title: "Rooftop Veiw", desc: "the city from abvoe", location: "Jaipur, IN", date: "May 2024", aspectType: "landscape" },
]

// Helper to get aspect ratio class and grid span based on aspect type
const getAspectConfig = (aspectType: AspectType) => {
  const configs: Record<AspectType, { aspect: string; colSpan: string; rowSpan: string }> = {
    portrait: { aspect: "aspect-[3/4]", colSpan: "col-span-1", rowSpan: "row-span-2" },
    landscape: { aspect: "aspect-[4/3]", colSpan: "col-span-1", rowSpan: "row-span-1" },
    square: { aspect: "aspect-square", colSpan: "col-span-1", rowSpan: "row-span-1" },
    wide: { aspect: "aspect-video", colSpan: "md:col-span-2", rowSpan: "row-span-1" },
    ultrawide: { aspect: "aspect-[20/9]", colSpan: "md:col-span-2", rowSpan: "row-span-1" },
    panorama: { aspect: "aspect-[21/9]", colSpan: "col-span-full", rowSpan: "row-span-1" },
  }
  return configs[aspectType]
}

const sketchGallery: Array<{
  id: number
  title: string
  desc: string
  aspectType: AspectType
}> = [
  { id: 1, title: "Portraitt Study #14", desc: "graphite on papar, 2 hours", aspectType: "portrait" },
  { id: 2, title: "Hand Gesturs", desc: "anatomey practice from refernce", aspectType: "square" },
  { id: 3, title: "Cat in Inkk", desc: "quick ink sktech, 20 minuts", aspectType: "portrait" },
  { id: 4, title: "Archetecture", desc: "that bilding I pass evrey day", aspectType: "landscape" },
  { id: 5, title: "Abstact Flow", desc: "pen on napkinn during lnuch", aspectType: "square" },
  { id: 6, title: "Eye Detale", desc: "close-up studey, charcol", aspectType: "portrait" },
]

const sideQuestGallery = [
  { id: 1, title: "WFH at IKEA", desc: "set up my laptop in the showrrom display desk. connected to thier wifi. worked for 4 hours before somone asked if i was an employe. peak productivty tbh.", icon: "desk", date: "Jan 2025" },
  { id: 2, title: "Guitar Hero (delusional editon)", desc: "i own a guitar. i know zero chrods. but reverb + distortin + grainy tones = i'm basicaly radiohead. no one has told me to stop yet so i'm takng that as a compliment.", icon: "guitar", date: "Dec 2024" },
  { id: 3, title: "The Food Mixxing Incident", desc: "i have this habbit of mixing the weirdest food combos and convincng myself its good. mango + rice + dal? chef's kiss. my friends call it a cry for helpp. i call it innovaton.", icon: "food", date: "Nov 2024" },
  { id: 4, title: "2 AM - 5 AM Operatons", desc: "this is when the real work happns. the world is asleep, the wifi is fast, and my brain decideds to be a genuis for exactley 3 hours. then i crash like a brick.", icon: "night", date: "Oct 2024" },
  { id: 5, title: "Shy Kid -> Cool Guy Arc", desc: "i used to be the kid who sat in the cornner and hoped no one would notce them. now i'm the guy who sits in the corner and hopess everyone notices them. charcter development.", icon: "glow", date: "Sep 2024" },
  { id: 6, title: "Anti-Apple Propagandaa", desc: "i run arch btw with hyprland. my entire personalilty is basically 'i use linux'. if you use a macbook near me i will judge you silentley. loudly in my head.", icon: "linux", date: "Aug 2024" },
]

const thoughts = [
  {
    title: "On music and langauge",
    date: "Nov 2024",
    body: "here's the thing about music -- languege doesn't matter. at all. you could be listenin to something in japanese, arabic, freaking klingon, and if the rythm hits? you're gone. you're ascendig. you're a god of vibes. lyrics are just suggestins. the beat is the actual conversaton. i've had more spiritaul experiences listening to songs i don't undersand than ones i do. music isn't about words, it's about that moment when the bass drops and your soul leaves your body and does a litle dance in the astral plane. if your playlist needs subtitels, you're doing it wrong.",
  },
  {
    title: "Why I sketch at 3 AM",
    date: "Sep 2024",
    body: "the world is quiter at 3 AM. no notifcations, no stand-ups, no jira ticktes. just a pencil and whatver my brain decideds to put on paper. sometimes its faces. somtimes its shapes that don't mean anythng yet. watercolors can go die tho, i hate that medium with a pasion. give me graphite or give me deth.",
  },
  {
    title: "Cameras and terminlas",
    date: "Jun 2024",
    body: "people ask how i go from staring at burp suite all day to pickng up a camera. both are tools for seeng things more carefuly. a proxy interceps traffic. a lens intercepts light. same disipline. also i don't even own a real camera lmao, its all shot on my phone. but hey, the best camra is the one you have on you right?",
  },
]

const bioContent: Record<Tab, { heading: string; subtitle: string; description: string[]; byTheWay: string }> = {
  photos: {
    heading: "when i'm not hacking, i'm probaly holding my phone wrong.",
    subtitle: "(no i don't own a camera, its all on my phone lol)",
    description: [
      "street photgraphy mostly -- candid momments, urban textures, the way light hits concete at weird angels. i'm obsesed with capturing the evryday, the forgoten corners that people walk past withot seeing.",
      "there's this moment right befroe you press the shuttr where everything alines -- the light, the compoistion, the story. that split-secnd clarity is why i carry my " + "phone everywhere.",
      "none of this is gallrey-ready. think of it as a visual journl of someone who stares at terminlas all day and needs to look at literaly anything else.",
    ],
    byTheWay: "i'm obsesed with travel: cramped busses, overngiht trains with strangers, hiking solo with just a backpak, road trips with close freinds, exploring new citeis with someone specail. literaly anywhere, alone or with people i actually like. but famly trips? absolutley despise them. too much drama, too many compromsis, too little freedm.",
  },
  sketches: {
    heading: "when i'm not hacking, i'm probaly covered in graphite dust.",
    subtitle: "(and staring at a blank sketchbok like it owes me money)",
    description: [
      "sketchng happens late at night, usally faces and anatomey studies in graphite or ink. there's somthing meditative about the scrach of pencil on paper, no undo buton, no delete key. just commitent.",
      "i'm obsesed with pencils -- mechancial, graphite, charcol, anything with a sharp piont. they're honest tools. no distracstions, no fancy effetcs. just you and the paper. watercolors can burn tho. i tried once. never agian.",
      "sometimes i just doodle nonsense and call it art. sometimes those nonsense doodels turn into somthing real. none of this is polishd, and i prefr it that way.",
    ],
    byTheWay: "the best sketchs happen when the world is asleep. 3 AM brain is a diffrnt person -- uncensored, experimetal, messy. traveling with a sketchbok is freedom. pulling out a pencil in a train, a cafe, a random street cornr and just... creating. that's when the magic hapens.",
  },
  sidequests: {
    heading: "when i'm not hacking, i'm probaly doing somethin questionable.",
    subtitle: "(side quests are the main quest, fite me)",
    description: [
      "i live for side quests. the wierder the better. set up an entire workstatoin at ikea? done. tried to learn guitar by just vibeing? ongoing. mixed food combinatons that should be ilegal? daily.",
      "i spend most of my time between 2 AM and 5 AM. that's when the real stuff happns. the rest of the day is just waitng for the world to shut up so i can actualy think.",
      "i use arch btw. with hyprland. my entire setup is basicaly a flex. if you use a macbook i will not say anythng but i will think many things.",
    ],
    byTheWay: "i was the shyest kid in every room i walked into. now i'm the coolest person in the room (self-certified, no refunds). the charcter developmnt arc is real and i'm livng proof. also i hate apple. like really realy hate apple. that's not a personalilty trait, that's a lifestyle choce.",
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5 },
}

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<Tab>("photos")
  const [lightboxItem, setLightboxItem] = useState<{ title: string; desc: string } | null>(null)
  const [showPhone, setShowPhone] = useState(false)

  const gallery = activeTab === "photos" ? photoGallery : activeTab === "sketches" ? sketchGallery : null

  return (
    <>
      <PageHeader title="the unhinged side" subtitle="photos / sketches / side quests / late-night scribbles" />

      <PageTransition>
        <div className="relative min-h-screen">

          {/* Spelling disclaimer */}
          <div className="mx-auto max-w-4xl px-6 pt-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-mono text-[0.65rem] text-[#555] italic text-right"
            >
              {"* yes, the spelling mistakes are intentional. mostly. okay fine, some aren't. bear with me."}
            </motion.p>
          </div>

          {/* -- Bio -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pt-8 pb-10">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-3">the other half</p>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                    {bioContent[activeTab].heading}
                  </h2>
                  <p className="text-sm text-[#666] mb-5 italic">
                    {activeTab === "photos" ? (
                      <span>
                        {"(no i don't own a camera, its all on my "}
                        <span
                          className="relative cursor-pointer border-b border-dashed border-[#555] hover:text-[#e8e8e8] transition-colors"
                          onMouseEnter={() => setShowPhone(true)}
                          onMouseLeave={() => setShowPhone(false)}
                        >
                          phone
                          <AnimatePresence>
                            {showPhone && (
                              <motion.span
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute left-1/2 -translate-x-1/2 -top-8 bg-[#1a1a1a] border border-[#555] px-2 py-1 text-xs text-[#e8e8e8] whitespace-nowrap font-mono z-20"
                              >
                                vivo x300
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        {" lol)"}
                      </span>
                    ) : (
                      bioContent[activeTab].subtitle
                    )}
                  </p>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`bio-${activeTab}`}
                  className="max-w-2xl space-y-4 text-sm md:text-base text-[#ccc] leading-relaxed margin-line"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                >
                  {bioContent[activeTab].description.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                    >
                      {para}
                    </motion.p>
                  ))}

                  <motion.div
                    className="border-l-2 border-[#555] pl-4 py-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <p className="text-xs font-mono tracking-wider text-[#999] uppercase mb-2">by the way</p>
                    <p className="text-sm text-[#aaa]">
                      {bioContent[activeTab].byTheWay}
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Gallery / Side Quests -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-5">gallery</p>

              <div className="flex flex-wrap gap-1 mb-8">
                {([
                  { key: "photos" as Tab, label: "Photography", icon: Camera },
                  { key: "sketches" as Tab, label: "Sketches", icon: PenTool },
                  { key: "sidequests" as Tab, label: "Side Quests", icon: Compass },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all border
                      ${activeTab === tab.key
                        ? "bg-[#e8e8e8] text-[#0a0a0a] border-[#e8e8e8]"
                        : "bg-transparent text-[#999] border-[#333] hover:text-[#e8e8e8] hover:border-[#666]"
                      }
                    `}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === "sidequests" ? (
                <motion.div
                  key="sidequests"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {sideQuestGallery.map((quest, i) => (
                    <motion.div
                      key={quest.id}
                      className="paper-card p-5 md:p-7 hover-bounce"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.35 }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center border border-[#555] shrink-0">
                            {quest.icon === "guitar" ? (
                              <Guitar className="h-4 w-4 text-[#aaa]" />
                            ) : (
                              <Compass className="h-4 w-4 text-[#aaa]" />
                            )}
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-[#e8e8e8]">{quest.title}</h3>
                        </div>
                        <span className="font-mono text-xs text-[#555] shrink-0">{quest.date}</span>
                      </div>
                      <p className="text-sm text-[#ccc] leading-relaxed pl-11">{quest.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : gallery && (
                <motion.div
                  key={activeTab}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {gallery.map((item, i) => {
                    const config = getAspectConfig(item.aspectType)
                    return (
                      <motion.div
                        key={`${activeTab}-${item.id}`}
                        className={`paper-card overflow-hidden cursor-pointer group hover-bounce ${config.colSpan}`}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.35 }}
                        onClick={() => setLightboxItem(item)}
                      >
                        <div className={`${config.aspect} w-full bg-[#1a1a1a] border-b border-[#333] relative overflow-hidden`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            {activeTab === "photos" ? (
                              <Camera className="h-8 w-8 text-[#333] group-hover:text-[#555] transition-colors" />
                            ) : (
                              <PenTool className="h-8 w-8 text-[#333] group-hover:text-[#555] transition-colors" />
                            )}
                          </div>
                          <div className="absolute inset-0 bg-[#e8e8e8]/0 group-hover:bg-[#e8e8e8]/5 transition-colors duration-300" />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-[#e8e8e8]">{item.title}</p>
                          <p className="text-xs text-[#999] mt-0.5">{item.desc}</p>
                          {"location" in item && (
                            <div className="flex items-center justify-between mt-2 text-xs text-[#555]">
                              <span className="font-mono">{(item as typeof photoGallery[0]).location}</span>
                              <span className="font-mono">{(item as typeof photoGallery[0]).date}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="mx-auto max-w-4xl px-6"><div className="h-px bg-[#333]" /></div>

          {/* -- Thoughts -- */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 py-14">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-[#999]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#999]">thoughts</p>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                things i wrote at questionble hours.
              </h2>
              <p className="text-sm text-[#666] mb-8 italic">{"(3 AM brain is a diffrnt person)"}</p>
            </motion.div>

            <div className="space-y-5">
              {thoughts.map((t, i) => (
                <motion.article
                  key={t.title}
                  className="paper-card p-5 md:p-7 hover-bounce"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#e8e8e8]">{t.title}</h3>
                    <span className="font-mono text-xs text-[#999]">{t.date}</span>
                  </div>
                  <p className="text-sm text-[#ccc] leading-relaxed">{t.body}</p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[#333]">
            <div className="mx-auto max-w-4xl px-6 py-7 flex items-center justify-between">
              <p className="font-mono text-xs text-[#666]">som chandra -- 2025</p>
              <p className="font-mono text-xs text-[#555]">the unhinged side</p>
            </div>
          </footer>
        </div>
      </PageTransition>

      {/* -- Lightbox -- */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-[#000]/85 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              className="relative bg-[#111] border border-[#333] max-w-lg w-full"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute top-3 right-3 p-1 hover:bg-[#1a1a1a] transition-colors"
              >
                <X className="h-5 w-5 text-[#999]" />
              </button>

              <div className="aspect-[4/3] w-full bg-[#1a1a1a] flex items-center justify-center border-b border-[#333]">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-[#333] mx-auto mb-2" />
                  <p className="font-mono text-xs text-[#666]">image placeholder</p>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-[#e8e8e8]">{lightboxItem.title}</h3>
                <p className="text-sm text-[#aaa] mt-1">{lightboxItem.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
