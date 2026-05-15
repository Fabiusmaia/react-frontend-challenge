import { useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2, TrendingUp, Film } from 'lucide-react'
import { Layout } from '@/shared/components/Layout'
import { MovieCard } from '@/features/movies/components/MovieCard'
import { MovieCardSkeleton } from '@/features/movies/components/MovieCardSkeleton'
import { MoviesFilters } from '@/features/movies/components/MoviesFilters'
import { useInfiniteMovies } from '@/features/movies/hooks/useMovies'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { MoviesFilters as Filters } from '@/shared/types/tmdb'
import { useEffect } from 'react'

export function HomePage() {
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<Omit<Filters, 'page' | 'query'>>({})

  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteMovies({ ...filters, query: debouncedSearch })

  const { ref, inView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const movies = data?.pages.flatMap((p) => p.results) ?? []
  const totalResults = data?.pages[0]?.total_results ?? 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleFiltersChange = useCallback((newFilters: Omit<Filters, 'page' | 'query'>) => {
    setFilters(newFilters)
  }, [])

  return (
    <Layout>
      {/* Hero section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          {debouncedSearch ? (
            <Film className="h-5 w-5 text-primary" />
          ) : (
            <TrendingUp className="h-5 w-5 text-primary" />
          )}
          <h1 className="text-2xl font-bold">
            {debouncedSearch ? 'Resultados da busca' : 'Filmes em Destaque'}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? 'Carregando...'
            : totalResults > 0
              ? `${totalResults.toLocaleString('pt-BR')} filmes encontrados`
              : 'Nenhum resultado encontrado'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <MoviesFilters
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar filmes</h3>
          <p className="text-muted-foreground text-sm">
            Verifique sua chave da API do TMDB no arquivo .env
          </p>
        </div>
      )}

      {/* Movie grid */}
      {!isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && movies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Nenhum filme encontrado</h3>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros ou buscar por outro título
          </p>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Carregando mais filmes...</span>
          </div>
        )}
      </div>
    </Layout>
  )
}
