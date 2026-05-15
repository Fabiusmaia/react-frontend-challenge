import { Star, Plus, Check, Calendar } from 'lucide-react'
import { imageUrl } from '@/shared/api/client'
import { cn, formatDate, formatRating } from '@/shared/lib/utils'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import type { Movie } from '@/shared/types/tmdb'
import { useWatchlistStore } from '@/features/watchlist/store/watchlistStore'
import { useGenres } from '@/features/movies/hooks/useMovies'
import { Link } from '@tanstack/react-router'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const { addMovie, removeMovie, isInWatchlist } = useWatchlistStore()
  const { data: genres } = useGenres()
  const inWatchlist = isInWatchlist(movie.id)

  const movieGenres = genres
    ?.filter((g) => movie.genre_ids.includes(g.id))
    .slice(0, 2) ?? []

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWatchlist) {
      removeMovie(movie.id)
    } else {
      const movieWithGenres = {
        ...movie,
        genres: genres?.filter((g) => movie.genre_ids.includes(g.id)) ?? [],
      }
      addMovie(movieWithGenres)
    }
  }

  return (
    <Link to="/movie/$id" params={{ id: String(movie.id) }} className="block group">
      <div className="relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={imageUrl(movie.poster_path)}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Rating overlay */}
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-white">
                {formatRating(movie.vote_average)}
              </span>
            </div>
          </div>
          {/* Watchlist button */}
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'h-8 w-8 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90',
                inWatchlist && 'text-primary hover:text-primary'
              )}
              onClick={handleWatchlistToggle}
              title={inWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
            >
              {inWatchlist ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">{movie.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(movie.release_date)}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {movieGenres.map((genre) => (
              <Badge key={genre.id} variant="secondary" className="text-xs px-1.5 py-0">
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
