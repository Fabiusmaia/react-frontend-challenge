import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { moviesApi } from '@/features/movies/api/moviesApi'
import type { MoviesFilters } from '@/shared/types/tmdb'

export const movieKeys = {
  all: ['movies'] as const,
  trending: (page: number) => [...movieKeys.all, 'trending', page] as const,
  popular: (page: number) => [...movieKeys.all, 'popular', page] as const,
  search: (query: string, page: number) => [...movieKeys.all, 'search', query, page] as const,
  discover: (filters: MoviesFilters) => [...movieKeys.all, 'discover', filters] as const,
  detail: (id: number) => [...movieKeys.all, 'detail', id] as const,
  credits: (id: number) => [...movieKeys.all, 'credits', id] as const,
  videos: (id: number) => [...movieKeys.all, 'videos', id] as const,
  genres: () => [...movieKeys.all, 'genres'] as const,
}

export function useTrendingMovies(page: number) {
  return useQuery({
    queryKey: movieKeys.trending(page),
    queryFn: () => moviesApi.getTrending(page),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePopularMovies(page: number) {
  return useQuery({
    queryKey: movieKeys.popular(page),
    queryFn: () => moviesApi.getPopular(page),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSearchMovies(query: string, page: number) {
  return useQuery({
    queryKey: movieKeys.search(query, page),
    queryFn: () => moviesApi.search(query, page),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useDiscoverMovies(filters: MoviesFilters) {
  return useQuery({
    queryKey: movieKeys.discover(filters),
    queryFn: () => moviesApi.discover(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useInfiniteMovies(filters: MoviesFilters & { query?: string }) {
  const hasQuery = Boolean(filters.query && filters.query.length > 0)
  const hasFilters = Boolean(filters.genre || filters.year || filters.minRating)

  return useInfiniteQuery({
    queryKey: [...movieKeys.all, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => {
      if (hasQuery) return moviesApi.search(filters.query!, pageParam as number)
      if (hasFilters) return moviesApi.discover({ ...filters, page: pageParam as number })
      return moviesApi.getTrending(pageParam as number)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5,
  })
}

export function useMovieDetails(id: number) {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: () => moviesApi.getDetails(id),
    staleTime: 1000 * 60 * 10,
  })
}

export function useMovieCredits(id: number) {
  return useQuery({
    queryKey: movieKeys.credits(id),
    queryFn: () => moviesApi.getCredits(id),
    staleTime: 1000 * 60 * 10,
  })
}

export function useMovieVideos(id: number) {
  return useQuery({
    queryKey: movieKeys.videos(id),
    queryFn: () => moviesApi.getVideos(id),
    staleTime: 1000 * 60 * 10,
  })
}

export function useGenres() {
  return useQuery({
    queryKey: movieKeys.genres(),
    queryFn: moviesApi.getGenres,
    staleTime: 1000 * 60 * 60,
  })
}
