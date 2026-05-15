import { ArrowLeft, Star, Clock, Calendar, Bookmark, BookmarkCheck, Play, Users } from 'lucide-react'
import { Link, useParams } from '@tanstack/react-router'
import { Layout } from '@/shared/components/Layout'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Separator } from '@/shared/components/ui/separator'
import { useMovieDetails, useMovieCredits, useMovieVideos } from '@/features/movies/hooks/useMovies'
import { useWatchlistStore } from '@/features/watchlist/store/watchlistStore'
import { backdropUrl, imageUrl } from '@/shared/api/client'
import { formatDate, formatRating } from '@/shared/lib/utils'
import { toast } from '@/shared/hooks/useToast'

export function MoviePage() {
  const { id } = useParams({ from: '/movie/$id' })
  const movieId = Number(id)

  const { data: movie, isLoading, isError } = useMovieDetails(movieId)
  const { data: credits } = useMovieCredits(movieId)
  const { data: videos } = useMovieVideos(movieId)

  const { addMovie, removeMovie, isInWatchlist } = useWatchlistStore()
  const inWatchlist = isInWatchlist(movieId)

  const trailer = videos?.results.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
  ) ?? videos?.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube')

  const director = credits?.crew.find((c) => c.job === 'Director')
  const topCast = credits?.cast.slice(0, 8) ?? []

  const handleWatchlistToggle = () => {
    if (!movie) return
    if (inWatchlist) {
      removeMovie(movie.id)
      toast({ title: 'Removido da lista', description: movie.title, variant: 'default' })
    } else {
      addMovie({ ...movie, genres: movie.genres ?? [] })
      toast({ title: 'Adicionado à lista', description: movie.title, variant: 'default' })
    }
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Filme não encontrado</h3>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Back button */}
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <MoviePageSkeleton />
      ) : movie ? (
        <div className="space-y-8">
          {/* Backdrop + info hero */}
          <div className="relative rounded-xl overflow-hidden">
            {movie.backdrop_path && (
              <div className="absolute inset-0">
                <img
                  src={backdropUrl(movie.backdrop_path)}
                  alt=""
                  className="h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              </div>
            )}
            <div className="relative flex flex-col sm:flex-row gap-6 p-6">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={imageUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-40 rounded-lg shadow-xl"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold leading-tight">{movie.title}</h1>
                  {movie.tagline && (
                    <p className="text-muted-foreground italic mt-1">{movie.tagline}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold text-foreground">
                      {formatRating(movie.vote_average)}
                    </span>
                    <span className="text-muted-foreground">
                      ({movie.vote_count.toLocaleString('pt-BR')})
                    </span>
                  </div>

                  {movie.runtime && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min</span>
                      </div>
                    </>
                  )}

                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Badge key={g.id} variant="secondary">
                      {g.name}
                    </Badge>
                  ))}
                </div>

                {director && (
                  <p className="text-sm text-muted-foreground">
                    Direção: <span className="text-foreground font-medium">{director.name}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={handleWatchlistToggle}
                    variant={inWatchlist ? 'secondary' : 'default'}
                  >
                    {inWatchlist ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Na minha lista
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Adicionar à lista
                      </>
                    )}
                  </Button>

                  {trailer && (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Assistir Trailer
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sinopse */}
          {movie.overview && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Sinopse</h2>
              <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
            </div>
          )}

          {/* Elenco */}
          {topCast.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Elenco Principal</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {topCast.map((member) => (
                  <div key={member.id} className="flex flex-col items-center text-center gap-2">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={member.profile_path ? imageUrl(member.profile_path, 'w185') : ''}
                        alt={member.name}
                      />
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium leading-tight line-clamp-2">{member.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{member.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Layout>
  )
}

function MoviePageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-6 p-6 rounded-xl border">
        <Skeleton className="w-40 h-60 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
