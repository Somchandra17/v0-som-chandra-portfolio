"use client"

import Link from "next/link"
import Image from "next/image"
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
      className="sticky top-0 z-40 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-sm"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="draw-underline flex items-center gap-2 text-sm font-mono text-[#777] hover:text-[#e8e8e8] transition-colors"
          data-hover
        >
          <Image
            src="/logo.png"
            alt="Som's logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <ArrowLeft className="h-4 w-4" />
          back home
        </Link>

        <div className="text-right">
          {breadcrumb && (
            <p className="font-mono text-[0.6rem] text-[#555] mb-0.5">{breadcrumb}</p>
          )}
          <h1
            className="text-base font-bold tracking-tight text-[#e8e8e8]"
            style={titleSmallCaps ? { fontVariant: "small-caps" } : undefined}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-xs font-mono text-[#777]"
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
