"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Headphones, Music } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Podcast } from "@/lib/types"

interface PodcastCardProps {
  podcast: Podcast
}

export default function PodcastCard({ podcast }: PodcastCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isExplicit = podcast.explicit === "yes" || podcast.explicit === true
  const hasImage = podcast.image_url && podcast.image_url.trim() !== "" && !imageError
  const hasEpisodeCount = podcast.episode_count && podcast.episode_count !== "0"

  return (
    <Link href={`/podcast/${podcast.itunes_id}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
          {hasImage ? (
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={podcast.image_url || "/placeholder.svg"}
                alt={podcast.title}
                fill
                className="object-cover transition-transform duration-500"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                onError={() => setImageError(true)}
              />
              {isExplicit && (
                <Badge variant="destructive" className="absolute top-2 right-2">
                  Explicit
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center aspect-square bg-muted">
              <Music className="h-16 w-16 text-muted-foreground" />
              {isExplicit && (
                <Badge variant="destructive" className="absolute top-2 right-2">
                  Explicit
                </Badge>
              )}
            </div>
          )}
          <CardContent className="p-4">
            <h3 className="font-semibold line-clamp-1">{podcast.title}</h3>
            {podcast.author && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{podcast.author}</p>}
          </CardContent>
          {hasEpisodeCount && (
            <CardFooter className="p-4 pt-0 flex justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Headphones className="h-3.5 w-3.5 mr-1" />
                <span>{podcast.episode_count} episodes</span>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </Link>
  )
}
