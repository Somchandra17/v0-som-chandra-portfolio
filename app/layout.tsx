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

const SITE_URL = 'https://www.somm.tf'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sup? - Som 00:21",
  description:
    'Som Chandra — Cyber Security Engineer by day, photographer and doodler by night. Two worlds, one website: resume, hacking projects, bug bounty Hall of Fames, photos, and sketches.',
  keywords: [
    'Som Chandra', 'cyber security engineer', 'application security', 'VAPT',
    'penetration testing', 'bug bounty', 'mobile security', 'portfolio',
  ],
  authors: [{ name: 'Som Chandra', url: SITE_URL }],
  creator: 'Som Chandra',
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    siteName: "som's corner",
    url: SITE_URL,
    title: "hey, it's som",
    description:
      'Cyber Security Engineer by day, photographer and doodler by night. Two worlds, one website.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'som' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "hey, it's som",
    description:
      'Cyber Security Engineer by day, photographer and doodler by night.',
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Som Chandra',
  url: SITE_URL,
  jobTitle: 'Cyber Security Engineer',
  worksFor: { '@type': 'Organization', name: 'MoveInSync' },
  sameAs: [
    'https://github.com/somchandra17',
    'https://linkedin.com/in/somchandra17',
    'https://tryhackme.com/p/0xs0m',
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
