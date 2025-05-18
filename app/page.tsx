"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, RefreshCw, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PodcastCard from "@/components/podcast-card"
import { findPodcasts, findPodcastsByKeyword, findPodcastsByGenre } from "@/lib/api"
import type { Podcast } from "@/lib/types"

const POPULAR_GENRES = [
  { name: "Arts", code: "1301" },
  { name: "Business", code: "1321" },
  { name: "Comedy", code: "1303" },
  { name: "Education", code: "1304" },
  { name: "Fiction", code: "1483" },
  { name: "Health & Fitness", code: "1307" },
  { name: "History", code: "1487" },
  { name: "Leisure", code: "1459" },
  { name: "Music", code: "1310" },
  { name: "News", code: "1311" },
  { name: "Religion & Spirituality", code: "1314" },
  { name: "Science", code: "1315" },
  { name: "Society & Culture", code: "1324" },
  { name: "Sports", code: "1545" },
  { name: "Technology", code: "1318" },
  { name: "True Crime", code: "1488" },
  { name: "TV & Film", code: "1309" },
]

const POPULAR_KEYWORDS = [
  "podcast",
  "radio",
  "talk",
  "interview",
  "story",
  "news",
  "comedy",
  "science",
  "history",
  "business",
  "health",
  "politics",
  "education",
  "technology",
  "music",
  "culture",
  "sports",
  "entertainment",
  "motivation",
  "mindfulness",
]

const STORAGE_KEY = "featured_podcasts"
const LAST_REFRESH_KEY = "last_refresh_time"

export default function Home() {
  const [keyword, setKeyword] = useState("")
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [featuredPodcasts, setFeaturedPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => 0.5 - Math.random())
  }

  function isEnglishOnly(text: string): boolean {
    return /^[a-zA-Z0-9\s]*$/.test(text)
  }

  function validateKeyword(keyword: string): boolean {
    const trimmed = keyword.trim()

    if (trimmed.length < 2) {
      setError("Search term must be at least 2 characters long")
      return false
    }

    if (!isEnglishOnly(trimmed)) {
      setError("Only English characters are allowed")
      return false
    }

    return true
  }

  const loadFeaturedPodcasts = useCallback(async () => {
    setIsLoadingFeatured(true)

    try {
      const useKeyword = Math.random() > 0.5

      let allPodcasts: Podcast[] = []

      if (useKeyword) {
        const randomKeyword = POPULAR_KEYWORDS[Math.floor(Math.random() * POPULAR_KEYWORDS.length)]
        allPodcasts = await findPodcastsByKeyword(randomKeyword)
      } else {
        const randomGenre = POPULAR_GENRES[Math.floor(Math.random() * POPULAR_GENRES.length)]
        allPodcasts = await findPodcastsByGenre(randomGenre.code)
      }

      const shuffled = shuffleArray(allPodcasts)
      const featured = shuffled.slice(0, 12)

      setFeaturedPodcasts(featured)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(featured))
      localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString())
    } catch (error) {
      toast({
        title: "Error loading podcasts",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoadingFeatured(false)
    }
  }, [toast])

  const refreshFeaturedPodcasts = () => {
    setIsRefreshing(true)
    loadFeaturedPodcasts().finally(() => {
      setIsRefreshing(false)
    })
  }

  const wasPageRefreshed = useCallback(() => {
    if (typeof window !== "undefined") {
      const navigation = window.performance?.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming

      if (navigation) {
        return navigation.type === "reload"
      } else {
        const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY)
        const now = Date.now()

        if (!lastRefresh || now - Number.parseInt(lastRefresh) > 3600000) {
          return true
        }

        return false
      }
    }
    return false
  }, [])

  useEffect(() => {
    const loadPodcasts = async () => {
      const storedPodcasts = localStorage.getItem(STORAGE_KEY)

      if (storedPodcasts && !wasPageRefreshed()) {
        try {
          const parsed = JSON.parse(storedPodcasts)
          setFeaturedPodcasts(parsed)
          setIsLoadingFeatured(false)
        } catch (e) {
          await loadFeaturedPodcasts()
        }
      } else {
        await loadFeaturedPodcasts()
      }
    }

    loadPodcasts()
  }, [loadFeaturedPodcasts, wasPageRefreshed])

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setPodcasts([])
      setError(null)
      return
    }

    if (!validateKeyword(searchTerm)) {
      toast({
        title: "Invalid search term",
        description: error,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const data = await findPodcasts(searchTerm.trim())
      setPodcasts(data)

      if (data.length === 0) {
        setError("No podcasts found matching your search term.")
      } else {
        setError(null)
      }
    } catch (error) {
      let errorMessage = "An error occurred while searching for podcasts. Please try again."

      if (error instanceof Error && error.message.includes("The keyword you provided is not valid")) {
        errorMessage = "The search term you provided is not valid. Please try a different term."
      }

      setError(errorMessage)
      toast({
        title: "Error searching podcasts",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (!isEnglishOnly(value)) {
      setError("Only English characters are allowed")
      return
    }

    setKeyword(value)
    setError(null)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value)
      }, 500)
    } else if (value.trim().length === 0) {
      setPodcasts([])
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    performSearch(keyword)
  }

  const isShowingFeatured = podcasts.length === 0 && !isLoading
  const isShowingResults = podcasts.length > 0 && !isLoading

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Discover Amazing Podcasts</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Search for podcasts by keyword and find your next favorite show
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSearch}
        className="mx-auto mt-8 flex max-w-md gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search podcasts..."
            className="pl-9"
            value={keyword}
            onChange={handleInputChange}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </motion.form>

      <div className="mt-2 text-xs text-muted-foreground text-center">
        Search for podcasts using English terms like "comedy", "news", or "science"
      </div>

      <AnimatePresence>
        {(isLoading || isLoadingFeatured) && (
          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {error && !isLoading && (
        <motion.div
          className="mt-8 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {isShowingFeatured && featuredPodcasts.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Podcasts</h2>
            <Button
              variant="outline"
              onClick={refreshFeaturedPodcasts}
              disabled={isRefreshing}
              className="text-sm gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Podcasts"}
            </Button>
          </div>
          <motion.div
            key={featuredPodcasts.map((p) => p.itunes_id).join("-")}
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {featuredPodcasts.map((podcast, index) => (
                <motion.div
                  key={podcast.itunes_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PodcastCard podcast={podcast} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {isShowingResults && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Search Results</h2>
          <motion.div
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {podcasts.map((podcast, index) => (
                <motion.div
                  key={podcast.itunes_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PodcastCard podcast={podcast} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  )
}
