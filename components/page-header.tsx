"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  subtitleSmallCaps?: boolean
  titleSmallCaps?: boolean
  breadcrumb?: string
}

export function PageHeader({ title, subtitle, subtitleSmallCaps, titleSmallCaps, breadcrumb }: PageHeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-40 border-b border-ink-600 bg-ink-900/95 backdrop-blur-sm"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="draw-underline flex items-center gap-2 text-sm font-mono text-ink-400 hover:text-ink-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          back home
        </Link>

        <div className="text-right">
          {breadcrumb && (
            <p className="hidden sm:block font-mono text-[0.6rem] text-ink-400 mb-0.5">{breadcrumb}</p>
          )}
          <h1
            className="text-base font-bold tracking-tight text-ink-100"
            style={titleSmallCaps ? { fontVariant: "small-caps" } : undefined}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="hidden sm:block text-xs font-mono text-ink-400"
              style={subtitleSmallCaps ? { fontVariant: "small-caps" } : undefined}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.header>
  )
}
