"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Creative", href: "#creative" },
  { label: "Music", href: "#music" },
  { label: "Void", href: "#void" },
  { label: "Contact", href: "#contact" },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[50] flex items-center justify-between px-6 py-4 transition-colors duration-500 ${
          scrolled ? "bg-[#000000ee] backdrop-blur-md" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        <a href="#hero" className="font-bold text-[#ffffff] tracking-tighter text-lg" data-hover>
          SC
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-[0.2em] text-[#999999] transition-colors hover:text-[#ffffff]"
              data-hover
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="text-[#ffffff] md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          data-hover
        >
          <Menu size={20} />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#000000] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute right-6 top-4 text-[#ffffff]"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              data-hover
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-6">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="text-2xl font-bold tracking-tighter text-[#ffffff]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMobileOpen(false)}
                  data-hover
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
