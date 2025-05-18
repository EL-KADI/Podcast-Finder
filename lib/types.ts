export interface Podcast {
  itunes_id: string
  title: string
  image_url: string
  feed_url: string
  author?: string
  description?: string
  episode_count?: string
  rating?: number
  explicit?: string | boolean
}

export interface PodcastDetail {
  itunes_id: string
  title: string
  subtitle?: string
  description?: string
  image_url: string
  feed_url: string
  website?: string
  language?: string
  genres?: string
  author?: string
  owner_name?: string
  owner_email?: string
  copyright?: string
  explicit?: string
  latest_episode_date?: string
  episode_count?: string
  image?: string
}

export interface Episode {
  guid: string
  title: string
  description?: string
  published: string
  duration?: number
  image?: string
  audio?: string
}

export interface PodcastSearchResponse {
  results: Podcast[]
  total_results: number
  total_pages: number
  this_page: number
}

export interface PodcastDetailResponse {
  results: PodcastDetail
  total_results: number
}
