"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "about me", href: "#about" },
  { label: "work stuff", href: "#work" },
  { label: "projects", href: "#projects" },
  { label: "creative bits", href: "#creative" },
  { label: "tunes", href: "#music" },
  { label: "thoughts", href: "#void" },
  { label: "say hi", href: "#contact" },
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
        className={`fixed top-0 left-0 right-0 z-[50] flex items-center justify-between px-6 py-4 transition-all duration-500 ${
          scrolled ? "shadow-sm" : ""
        }`}
        style={{
          background: scrolled ? '#fbf1c7ee' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        <a
          href="#hero"
          className="text-2xl"
          style={{ fontFamily: "'Caveat', cursive", color: '#cc241d' }}
          data-hover
        >
          som~
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm transition-colors hover:text-[#cc241d]"
              style={{ color: '#7c6f64' }}
              data-hover
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          style={{ color: '#3c3836' }}
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          data-hover
        >
          <Menu size={22} />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center md:hidden"
            style={{ background: '#fbf1c7' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute right-6 top-4"
              style={{ color: '#3c3836' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              data-hover
            >
              <X size={22} />
            </button>

            <div className="flex flex-col items-center gap-5">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="text-3xl"
                  style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}
                  initial={{ opacity: 0, y: 20, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.06 }}
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
