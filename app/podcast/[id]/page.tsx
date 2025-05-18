"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Globe, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getPodcastById } from "@/lib/api"
import type { PodcastDetail } from "@/lib/types"

export default function PodcastDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [podcast, setPodcast] = useState<PodcastDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const data = await getPodcastById(params.id as string)
        setPodcast(data)
      } catch (error) {
        toast({
          title: "Error loading podcast",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPodcast()
  }, [params.id, toast])

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {isLoading ? (
        <PodcastSkeleton />
      ) : podcast ? (
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
              <Image
                src={podcast.image_url || "/placeholder.svg?height=300&width=300"}
                alt={podcast.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {podcast.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={podcast.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Official Website
                  </a>
                </div>
              )}
              {podcast.latest_episode_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Latest Episode: {new Date(podcast.latest_episode_date).toLocaleDateString()}</span>
                </div>
              )}
              {podcast.episode_count && (
                <div className="flex items-center gap-2 text-sm">
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                  <span>{podcast.episode_count} episodes</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold">{podcast.title}</h1>
            {podcast.author && <p className="mt-2 text-lg text-muted-foreground">{podcast.author}</p>}

            {podcast.subtitle && <div className="mt-4 text-lg italic">{podcast.subtitle}</div>}

            {podcast.description && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: podcast.description }}
                />
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {podcast.language && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Language</div>
                  <div className="mt-1 font-medium">{podcast.language.toUpperCase()}</div>
                </div>
              )}

              {podcast.genres && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Genres</div>
                  <div className="mt-1 font-medium">
                    {podcast.genres
                      .split(",")
                      .map((genre) => {
                        const genreMap: Record<string, string> = {
                          "1301": "Arts",
                          "1302": "Business",
                          "1303": "Comedy",
                          "1304": "Education",
                          "1305": "Fiction",
                          "1307": "Health & Fitness",
                          "1310": "Music",
                          "1311": "News",
                          "1314": "Religion & Spirituality",
                          "1315": "Science",
                          "1324": "Society & Culture",
                          "1318": "Sports",
                          "1301": "Arts",
                          "26": "Podcasts",
                        }
                        return genreMap[genre.trim()] || genre
                      })
                      .join(", ")}
                  </div>
                </div>
              )}

              {podcast.copyright && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Copyright</div>
                  <div className="mt-1 text-sm">{podcast.copyright}</div>
                </div>
              )}

              {podcast.explicit && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Content Rating</div>
                  <div className="mt-1 font-medium">{podcast.explicit === "yes" ? "Explicit" : "Clean"}</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Podcast not found</h2>
          <p className="mt-2 text-muted-foreground">
            The podcast you're looking for doesn't exist or couldn't be loaded.
          </p>
        </div>
      )}
    </div>
  )
}

function PodcastSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[300px_1fr]">
      <div>
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="mt-2 h-6 w-1/2" />
        <Skeleton className="mt-6 h-6 w-1/4" />
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="mt-8 h-6 w-1/4" />
        <div className="mt-4 space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
