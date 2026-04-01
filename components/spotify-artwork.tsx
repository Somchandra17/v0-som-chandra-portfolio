"use client"

import { useEffect, useState, type ReactNode } from "react"

type SpotifyArtworkProps = {
  src?: string
  alt: string
  className: string
  imgClassName: string
  fallback: ReactNode
  loading?: "eager" | "lazy"
}

export function SpotifyArtwork({
  src,
  alt,
  className,
  imgClassName,
  fallback,
  loading = "lazy",
}: SpotifyArtworkProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const canRenderImage = Boolean(src) && !failed

  return (
    <div className={className}>
      {canRenderImage ? (
        <img
          src={src}
          alt={alt}
          className={imgClassName}
          crossOrigin="anonymous"
          loading={loading}
          onError={() => setFailed(true)}
        />
      ) : (
        fallback
      )}
    </div>
  )
}
