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
      className="sticky top-0 z-40 border-b border-[#20232b] bg-[#0b0d11]/88 backdrop-blur-md"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 border border-[#272b34] bg-[#101319]/72 px-3 py-2 text-sm font-mono text-[#868c96] transition-colors hover:border-[#464d5a] hover:text-[#e8e8e8]"
          data-hover
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          back home
        </Link>

        <div className="min-w-0 text-right">
          <div className="inline-flex max-w-full flex-col items-end gap-1 border border-[#272b34] bg-[#101319]/72 px-3 py-2">
            {breadcrumb && (
              <p className="max-w-full truncate font-mono text-[0.58rem] tracking-[0.16em] text-[#5f6774]">{breadcrumb}</p>
            )}
            <h1
              className="max-w-full text-base font-semibold tracking-[-0.03em] text-[#eef1f5]"
              style={titleSmallCaps ? { fontVariant: "small-caps" } : undefined}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="max-w-full text-xs text-[#8b919d]"
                style={subtitleSmallCaps ? { fontVariant: "small-caps" } : undefined}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
