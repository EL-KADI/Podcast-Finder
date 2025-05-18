import type { Podcast, PodcastDetail, PodcastSearchResponse, PodcastDetailResponse } from "./types"

const API_BASE_URL = "https://allfeeds.ai/api"
const API_KEY = "e7adntfhrczsct5ej839"

async function fetchFromAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}/${endpoint}`)

  url.searchParams.append("key", API_KEY)

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value)
    }
  })

  const response = await fetch(url.toString(), {
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed with status ${response.status}: ${errorText}`)
  }

  return response.json()
}

function sanitizeKeyword(keyword: string): string {
  if (!keyword) return ""

  let sanitized = keyword.trim()
  sanitized = sanitized.replace(/[^\w\s]/gi, "")

  if (sanitized.length < 2) {
    return ""
  }

  return sanitized
}

export async function findPodcastsByKeyword(keyword: string): Promise<Podcast[]> {
  const sanitized = sanitizeKeyword(keyword)

  if (!sanitized) {
    return []
  }

  try {
    const data = await fetchFromAPI<PodcastSearchResponse>("find_podcasts", { keyword: sanitized })

    return data.results.map((podcast) => ({
      ...podcast,
      image: podcast.image_url,
    }))
  } catch (error) {
    return []
  }
}

export async function findPodcastsByGenre(genre: string): Promise<Podcast[]> {
  if (!genre) {
    return []
  }

  try {
    const data = await fetchFromAPI<PodcastSearchResponse>("find_podcasts", { genre })

    return data.results.map((podcast) => ({
      ...podcast,
      image: podcast.image_url,
    }))
  } catch (error) {
    return []
  }
}

export async function findPodcasts(
  keyword: string,
  page?: number,
  genre?: string,
  language?: string,
): Promise<Podcast[]> {
  const params: Record<string, string> = {}

  if (keyword) {
    const sanitized = sanitizeKeyword(keyword)
    if (sanitized) {
      params.keyword = sanitized
    }
  }

  if (genre) {
    params.genre = genre
  }

  if (language) {
    params.language = language
  }

  if (page !== undefined) {
    params.page = page.toString()
  }

  if (!params.keyword && !params.genre && !params.language) {
    return []
  }

  try {
    const data = await fetchFromAPI<PodcastSearchResponse>("find_podcasts", params)

    return data.results.map((podcast) => ({
      ...podcast,
      image: podcast.image_url,
    }))
  } catch (error) {
    return []
  }
}

export async function getPodcastById(itunesId: string): Promise<PodcastDetail> {
  if (!itunesId) {
    throw new Error("iTunes ID is required")
  }

  try {
    const data = await fetchFromAPI<PodcastDetailResponse>("podcast_by_itunesid", { itunes_id: itunesId })

    return {
      ...data.results,
      image: data.results.image_url,
    }
  } catch (error) {
    throw error
  }
}
