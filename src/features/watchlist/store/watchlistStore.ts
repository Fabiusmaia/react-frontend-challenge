import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie, Genre } from '@/shared/types/tmdb'

export interface WatchlistMovie extends Movie {
  genres: Genre[]
  addedAt: string
}

interface WatchlistState {
  movies: WatchlistMovie[]
  addMovie: (movie: Movie & { genres: Genre[] }) => void
  removeMovie: (id: number) => void
  isInWatchlist: (id: number) => boolean
  clearWatchlist: () => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      movies: [],

      addMovie: (movie) => {
        const already = get().movies.some((m) => m.id === movie.id)
        if (already) return
        set((state) => ({
          movies: [...state.movies, { ...movie, addedAt: new Date().toISOString() }],
        }))
      },

      removeMovie: (id) => {
        set((state) => ({ movies: state.movies.filter((m) => m.id !== id) }))
      },

      isInWatchlist: (id) => get().movies.some((m) => m.id === id),

      clearWatchlist: () => set({ movies: [] }),
    }),
    { name: 'cinedash-watchlist' }
  )
)
