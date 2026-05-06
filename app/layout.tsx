import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { LayoutShell } from '@/components/layout-shell'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "som chandra",
    template: "%s / som chandra",
  },
  description:
    "A split portfolio for application security work, terminal experiments, photos, sketches, and other late-night side quests.",
  openGraph: {
    title: "som chandra",
    description: "Application security work on one side, photos and sketches on the other.",
    siteName: "som chandra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "som chandra",
    description: "Application security work on one side, photos and sketches on the other.",
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased bg-[#0a0a0a] text-[#e8e8e8]`}
      >
        <a href="#main-content" className="skip-link">
          skip to content
        </a>
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
