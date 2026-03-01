"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-40 border-b border-[#c0c0b8] bg-[#f5f5f0]/95 backdrop-blur-sm"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="draw-underline flex items-center gap-2 text-sm font-mono text-[#666] hover:text-[#111] transition-colors"
          data-hover
        >
          <ArrowLeft className="h-4 w-4" />
          back home
        </Link>

        <div className="text-right">
          <h1 className="text-lg font-bold tracking-tight text-[#111]">{title}</h1>
          {subtitle && (
            <p className="text-xs font-mono text-[#999]">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.header>
  )
}
