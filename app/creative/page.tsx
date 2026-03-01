"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"
import { Camera, PenTool, BookOpen, X, Compass, Guitar } from "lucide-react"

type Tab = "photos" | "sketches" | "sidequests"

// Aspect type for visual variety in the masonry grid
type AspectType = "portrait" | "landscape" | "square" | "wide"

// Photo and sketch data with predefined aspect ratios for visual variety
interface PhotoItem {
  id: number
  title: string
  desc: string
  location?: string
  date?: string
  src?: string
  aspect: AspectType
}

// Aspect ratio CSS classes for each type
const aspectClasses: Record<AspectType, string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  wide: "aspect-[16/9]",
}

const photoGallery: PhotoItem[] = [
  { id: 1, title: "Urban Geometrey", desc: "lines and shadwos in concrete jungels", location: "Mumbai, IN", date: "Dec 2024", aspect: "portrait" },
  { id: 2, title: "Golden Hour", desc: "that fiften-minute window where evrything glows", location: "Goa, IN", date: "Nov 2024", aspect: "wide" },
  { id: 3, title: "Strangerss", desc: "faces in transit, storeis untold", location: "Delhi, IN", date: "Oct 2024", aspect: "square" },
  { id: 4, title: "After Rainn", desc: "wet streets reflecitng neon", location: "Bangalore, IN", date: "Sep 2024", aspect: "landscape" },
  { id: 5, title: "Solitudee", desc: "a bench, a tree, nobdoy around", location: "Himachal, IN", date: "Aug 2024", aspect: "portrait" },
  { id: 6, title: "Rust & Dacay", desc: "beuaty in what is being forgoten", location: "Kolkata, IN", date: "Jul 2024", aspect: "square" },
  { id: 7, title: "Night Walkk", desc: "long exposurs at 2 AM", location: "Pune, IN", date: "Jun 2024", aspect: "wide" },
  { id: 8, title: "Rooftop Veiw", desc: "the city from abvoe", location: "Jaipur, IN", date: "May 2024", aspect: "landscape" },
]

const sketchGallery: PhotoItem[] = [
  { id: 1, title: "Portraitt Study #14", desc: "graphite on papar, 2 hours", aspect: "portrait" },
  { id: 2, title: "Hand Gesturs", desc: "anatomey practice from refernce", aspect: "square" },
  { id: 3, title: "Cat in Inkk", desc: "quick ink sktech, 20 minuts", aspect: "portrait" },
  { id: 4, title: "Archetecture", desc: "that bilding I pass evrey day", aspect: "wide" },
  { id: 5, title: "Abstact Flow", desc: "pen on napkinn during lnuch", aspect: "square" },
  { id: 6, title: "Eye Detale", desc: "close-up studey, charcol", aspect: "landscape" },
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
    body: "there's a specfic kind of silence that only exsits after 2 AM. no slack pings. no \"can you check this tickt.\" no one asking you to \"hop on a quick call.\" just you, a pencil, and whatevr fever dream your brain decidd to commissin tonight.\n\nsometimes it's faces. sometimes it's geometrc nonsense that won't mean anythng until 3 weeks later when i look at it and go \"oh.\" the paper doesn't have acceptnce criteria. there's no definiton of done. you're just moving a stick across a surfce until it feels right and honeslty that's the most free i feel all week.\n\nwatercolors can die tho. i mean it. unpredictble, unforgving, bleeds everywere, dries into somthing completly different from what you painted. sounds like a bug that only reproducs in production. i don't negotite with either. graphite only. i need control over at least one thing in my life.",
  },
  {
    title: "Cameras and terminlas",
    date: "Jun 2024",
    body: "i don't do photograpy. let me be clear about that.\n\ni don't wake up on weeknds with a plan to go shoot. i don't have a golden hour calender. i'm not out here doing compositon studies. i just go places — for food, for work, becuase someone dragged me somewere — and sometimes somthing looks intresting and i take my phone out for four secnds and that's it.\n\nthe photo either works or it doesn't. i don't bracket shots. i don't shoot in raw. i move on with my life.\n\nwhat's funny is people assume there's disciplne behind it. there isn't. it's closer to how i notice wierd things in a netwrok response — not becuase i'm looking for it, just becuase something felt off and i paid atention for a secnd. same thing. somthing catches, you captre it, you keep walkng.\n\ni think most people are so busy experiencng a moment that they forget to just look at it. i'm not better at photograpy. i'm just occasionaly present enough to notice when somthing is worth four secnds of my time.",
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

// Photo card component with proper aspect ratio
function PhotoCard({ 
  item, 
  index, 
  activeTab, 
  onClick,
}: { 
  item: PhotoItem
  index: number
  activeTab: Tab
  onClick: () => void
}) {
  const aspectClass = aspectClasses[item.aspect]
  
  return (
    <motion.div
      className="break-inside-avoid mb-4 paper-card overflow-hidden cursor-pointer group hover-bounce"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      onClick={onClick}
    >
      <div className={`${aspectClass} w-full bg-[#1a1a1a] relative overflow-hidden`}>
        {item.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#252525]">
            {activeTab === "photos" ? (
              <Camera className="h-8 w-8 text-[#444] group-hover:text-[#666] transition-colors" />
            ) : (
              <PenTool className="h-8 w-8 text-[#444] group-hover:text-[#666] transition-colors" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-[#e8e8e8]/0 group-hover:bg-[#e8e8e8]/5 transition-colors duration-300" />
      </div>
      
      {/* Caption below image */}
      <div className="p-3 border-t border-[#333]">
        <p className="text-sm font-bold text-[#e8e8e8]">{item.title}</p>
        <p className="text-xs text-[#888] mt-1 leading-relaxed">{item.desc}</p>
        {item.location && (
          <div className="flex items-center justify-between mt-2 text-xs text-[#555]">
            <span className="font-mono">{item.location}</span>
            <span className="font-mono">{item.date}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<Tab>("photos")
  const [lightboxItem, setLightboxItem] = useState<PhotoItem | null>(null)
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
                  className="columns-1 sm:columns-2 lg:columns-3 gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {gallery.map((item, i) => (
                    <PhotoCard
                      key={`${activeTab}-${item.id}`}
                      item={item}
                      index={i}
                      activeTab={activeTab}
                      onClick={() => setLightboxItem(item)}
                    />
                  ))}
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
