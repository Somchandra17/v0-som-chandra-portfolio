"use client"

import { cn } from "@/lib/utils"

interface ImageSource {
  src: string
  alt: string
}

interface RevealImageListItemProps {
  text: string
  images: [ImageSource, ImageSource]
  isActive?: boolean
  onClick?: () => void
}

function RevealImageListItem({ text, images, isActive, onClick }: RevealImageListItemProps) {
  const container = "absolute right-4 md:right-8 -top-1 z-40 h-20 w-16"
  const effect =
    "relative duration-500 delay-100 shadow-none group-hover:shadow-xl group-hover:shadow-[#f0c6cf]/10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 group-hover:w-full group-hover:h-full w-16 h-16 overflow-hidden transition-all rounded-sm"

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-fit w-full overflow-visible py-6 md:py-8 text-left cursor-pointer"
    >
      <h1
        className={cn(
          "text-4xl md:text-6xl lg:text-7xl font-black transition-all duration-500 group-hover:opacity-40",
          isActive ? "text-[#f0c6cf]" : "text-[#e8e8e8]"
        )}
      >
        {text}
      </h1>
      <div className={container}>
        <div className={effect}>
          <img
            alt={images[1].alt}
            src={images[1].src}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      </div>
      <div
        className={cn(
          container,
          "translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-12"
        )}
      >
        <div className={cn(effect, "duration-200")}>
          <img
            alt={images[0].alt}
            src={images[0].src}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      </div>
      {/* Active indicator line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-px transition-all duration-500",
          isActive ? "w-full bg-[#f0c6cf]" : "w-0 bg-[#555] group-hover:w-full"
        )}
      />
    </button>
  )
}

export interface RevealNavItem {
  text: string
  tabKey: string
  images: [ImageSource, ImageSource]
}

interface RevealImageNavProps {
  items: RevealNavItem[]
  activeTab: string
  onTabChange: (tab: string) => void
}

function RevealImageNav({ items, activeTab, onTabChange }: RevealImageNavProps) {
  return (
    <div className="flex flex-col gap-1 px-2 md:px-8 py-4">
      {items.map((item) => (
        <RevealImageListItem
          key={item.tabKey}
          text={item.text}
          images={item.images}
          isActive={activeTab === item.tabKey}
          onClick={() => onTabChange(item.tabKey)}
        />
      ))}
    </div>
  )
}

export { RevealImageNav, RevealImageListItem }
