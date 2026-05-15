import { describe, it, expect, beforeEach } from 'vitest'
import { useWatchlistStore } from './watchlistStore'
import type { Movie, Genre } from '@/shared/types/tmdb'

const mockGenres: Genre[] = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
]

const mockMovie: Movie & { genres: Genre[] } = {
  id: 1,
  title: 'The Dark Knight',
  overview: 'Batman fights Joker',
  poster_path: '/poster.jpg',
  backdrop_path: null,
  release_date: '2008-07-18',
  vote_average: 9.0,
  vote_count: 30000,
  genre_ids: [28, 12],
  popularity: 100,
  original_language: 'en',
  adult: false,
  genres: mockGenres,
}

describe('watchlistStore', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ movies: [] })
  })

  it('starts with an empty watchlist', () => {
    expect(useWatchlistStore.getState().movies).toHaveLength(0)
  })

  it('adds a movie to the watchlist', () => {
    useWatchlistStore.getState().addMovie(mockMovie)
    expect(useWatchlistStore.getState().movies).toHaveLength(1)
    expect(useWatchlistStore.getState().movies[0].id).toBe(1)
  })

  it('does not add duplicate movies', () => {
    useWatchlistStore.getState().addMovie(mockMovie)
    useWatchlistStore.getState().addMovie(mockMovie)
    expect(useWatchlistStore.getState().movies).toHaveLength(1)
  })

  it('removes a movie from the watchlist', () => {
    useWatchlistStore.getState().addMovie(mockMovie)
    useWatchlistStore.getState().removeMovie(1)
    expect(useWatchlistStore.getState().movies).toHaveLength(0)
  })

  it('correctly checks if a movie is in watchlist', () => {
    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(false)
    useWatchlistStore.getState().addMovie(mockMovie)
    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(true)
  })

  it('clears the entire watchlist', () => {
    useWatchlistStore.getState().addMovie(mockMovie)
    useWatchlistStore.getState().addMovie({ ...mockMovie, id: 2, title: 'Inception' })
    useWatchlistStore.getState().clearWatchlist()
    expect(useWatchlistStore.getState().movies).toHaveLength(0)
  })

  it('preserves addedAt timestamp when adding a movie', () => {
    const before = Date.now()
    useWatchlistStore.getState().addMovie(mockMovie)
    const after = Date.now()
    const addedMovie = useWatchlistStore.getState().movies[0]
    const addedAt = new Date(addedMovie.addedAt).getTime()
    expect(addedAt).toBeGreaterThanOrEqual(before)
    expect(addedAt).toBeLessThanOrEqual(after)
  })
})
