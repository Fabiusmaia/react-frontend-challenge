import { tmdbClient } from '@/shared/api/client'
import type {
  MovieListResponse,
  MovieDetails,
  Credits,
  VideosResponse,
  Genre,
  MoviesFilters,
} from '@/shared/types/tmdb'

export const moviesApi = {
  getTrending: (page = 1) =>
    tmdbClient
      .get<MovieListResponse>('/trending/movie/week', { params: { page } })
      .then((r) => r.data),

  getPopular: (page = 1) =>
    tmdbClient
      .get<MovieListResponse>('/movie/popular', { params: { page } })
      .then((r) => r.data),

  search: (query: string, page = 1) =>
    tmdbClient
      .get<MovieListResponse>('/search/movie', { params: { query, page } })
      .then((r) => r.data),

  discover: (filters: MoviesFilters) => {
    const params: Record<string, unknown> = {
      page: filters.page ?? 1,
      sort_by: 'popularity.desc',
    }
    if (filters.genre) params.with_genres = filters.genre
    if (filters.year) params.primary_release_year = filters.year
    if (filters.minRating) params['vote_average.gte'] = filters.minRating

    return tmdbClient
      .get<MovieListResponse>('/discover/movie', { params })
      .then((r) => r.data)
  },

  getDetails: (id: number) =>
    tmdbClient.get<MovieDetails>(`/movie/${id}`).then((r) => r.data),

  getCredits: (id: number) =>
    tmdbClient.get<Credits>(`/movie/${id}/credits`).then((r) => r.data),

  getVideos: (id: number) =>
    tmdbClient.get<VideosResponse>(`/movie/${id}/videos`).then((r) => r.data),

  getGenres: () =>
    tmdbClient
      .get<{ genres: Genre[] }>('/genre/movie/list')
      .then((r) => r.data.genres),
}
